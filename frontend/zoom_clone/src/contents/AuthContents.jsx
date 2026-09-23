import axios from 'axios';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/clerk-react';
export const AuthContext = createContext({});

const serverUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
    baseURL: `${serverUrl}/api/v1/users`
});

// Add request interceptor to inject the token from localStorage
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const AuthProvider = ({children}) => {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    
    const router = useNavigate();

    const { isLoaded: isAuthLoaded, isSignedIn } = useClerkAuth();
    const { isLoaded: isUserLoaded, user: clerkUser } = useUser();
    const { signOut: clerkSignOut } = useClerk();
    const [isAuthReady, setIsAuthReady] = useState(false);
    const clerkSyncRef = useRef(false);

    const getInitialUser = () => {
        try {
            const val = localStorage.getItem("currentUser");
            return val && val !== "undefined" && val !== "null" ? JSON.parse(val) : null;
        } catch (e) {
            return null;
        }
    };
    const [currentUser, setCurrentUser] = useState(getInitialUser());
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "student");

    const handleRegister = async (name, username, password, role = "student") => {
        try { 
            let request = await client.post("/register",{
                name: name, 
                username: username,
                password: password,
                role: role
            });
            if (request.status === 201 || request.status === 200) {
                return request.data.message || "User Registered Successfully!";
            }
        } catch(err) {
            throw err; 
        }    
    };

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username, 
                password: password
            });
            if (request.status === 200) {
                // Clear any stale admin authentication state for standard logins
                sessionStorage.removeItem("admin_authenticated");
                
                localStorage.setItem("token", request.data.token);
                if (request.data.user) {
                    localStorage.setItem("userRole", request.data.user.role || "student");
                    localStorage.setItem("currentUser", JSON.stringify(request.data.user));
                    setUserRole(request.data.user.role || "student");
                    setCurrentUser(request.data.user);
                }
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    const addToUserHistory = async (meeting_code) => {
        try {
            let request = await client.post("/add_to_acitivity", {
                token: localStorage.getItem("token"),
                meeting_code: meeting_code
            });
            return request;
        } catch (error) {
            throw error;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity");
            return request.data;
        } catch (error) {
            throw error;
        }
    }

    const clearUserHistoryApi = async () => {
        try {
            let request = await client.delete("/clear_user_history");
            return request.data;
        } catch (error) {
            throw error;
        }
    }

    const deleteMeetingHistoryApi = async (meetingId) => {
        try {
            let request = await client.delete(`/delete_meeting_history/${meetingId}`);
            return request.data;
        } catch (error) {
            throw error;
        }
    }

    const persistSession = (token, user) => {
        sessionStorage.removeItem("admin_authenticated");
        if (token) {
            localStorage.setItem("token", token);
        }
        if (user) {
            localStorage.setItem("userRole", user.role || "student");
            localStorage.setItem("currentUser", JSON.stringify(user));
            setUserRole(user.role || "student");
            setCurrentUser(user);
        }
    };

    const handleGoogleLogin = useCallback(async (email, name, googleId, role = "student") => {
        const request = await client.post("/google-login", {
            email,
            name,
            googleId,
            role
        });
        if (request.status === 200 && request.data?.token) {
            persistSession(request.data.token, request.data.user);
            return request.data.message || "Logged in with Google successfully!";
        }
        throw new Error(request.data?.message || "Google Sign-In failed");
    }, []);

    const handleLogout = useCallback(async () => {
        clerkSyncRef.current = false;
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        sessionStorage.removeItem("admin_authenticated");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setCurrentUser(null);
        setUserRole("student");
        try {
            await clerkSignOut();
        } catch (err) {
            console.warn("Clerk sign-out skipped:", err?.message || err);
        }
        router("/auth", { replace: true });
    }, [clerkSignOut, router]);

    const getActiveRoomsApi = async () => {
        const request = await client.get("/active-rooms");
        return request.data;
    };

    const handleForgotPassword = async (username) => {
        try {
            let request = await client.post("/forgot-password", {
                username
            });
            if (request.status === 200) {
                return request.data;
            }
        } catch (err) {
            throw err;
        }
    };

    const handleResetPassword = async (username, resetToken, newPassword) => {
        try {
            let request = await client.post("/reset-password", {
                username,
                resetToken,
                newPassword
            });
            if (request.status === 200) {
                return request.data.message || "Password updated successfully!";
            }
        } catch (err) {
            throw err;
        }
    };

    const createQuizApi = async (quizData) => {
        try {
            let request = await client.post("/create-quiz", quizData);
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const submitQuizApi = async (submissionData) => {
        try {
            let request = await client.post("/submit-quiz", submissionData);
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const getQuizRecordsApi = async (meetingId) => {
        try {
            let request = await client.get("/quiz-records", {
                params: { meetingId }
            });
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const getAllUsersApi = async () => {
        try {
            let request = await client.get("/admin/users");
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const updateUserRoleStatusApi = async (userId, data) => {
        try {
            let request = await client.patch(`/admin/users/${userId}`, data);
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteUserApi = async (userId) => {
        try {
            let request = await client.delete(`/admin/users/${userId}`);
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const getSiteStatusApi = async () => {
        const request = await client.get('/site-status');
        return request.data;
    };

    const updateSiteStatusApi = async (isOnline) => {
        const request = await client.put('/site-status', { isOnline });
        return request.data;
    };

    const getMediaPermissionsApi = async (sessionId) => {
        try {
            let request = await client.get(`/admin/media-permissions/${sessionId}`);
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const updateMediaPermissionApi = async (sessionId, data) => {
        try {
            let request = await client.post(`/admin/media-permissions/${sessionId}`, data);
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const getAgoraRtcTokenApi = async (channelName, uid) => {
        try {
            let request = await client.post("/media/rtc-token", {
                channelName,
                uid,
                userToken: localStorage.getItem("token")
            });
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        const onSsoCallback = window.location.pathname.includes("/sso-callback");

        if (!isAuthLoaded) return;
        // Clerk is still completing the OAuth handshake — do not mark the user logged out.
        if (onSsoCallback) return;

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const isAdmin = sessionStorage.getItem("admin_authenticated") === "true";

        if (token || isAdmin) {
            setIsAuthReady(true);
            return;
        }

        if (!isSignedIn) {
            clerkSyncRef.current = false;
            setIsAuthReady(true);
            return;
        }

        if (!isUserLoaded || !clerkUser) return;
        if (clerkSyncRef.current) return;
        clerkSyncRef.current = true;

        const syncClerkWithBackend = async () => {
            const email =
                clerkUser.primaryEmailAddress?.emailAddress ||
                clerkUser.emailAddresses?.[0]?.emailAddress;
            const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || email?.split("@")[0] || "User";
            const googleId = clerkUser.id;

            try {
                if (!email) {
                    throw new Error("Clerk account has no email address");
                }

                let lastError = null;
                for (let attempt = 0; attempt < 3; attempt += 1) {
                    try {
                        await handleGoogleLogin(email, name, googleId, "student");
                        lastError = null;
                        break;
                    } catch (error) {
                        lastError = error;
                        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
                    }
                }
                if (lastError) throw lastError;
            } catch (error) {
                console.error("Failed to sync Clerk session with backend", error);
                clerkSyncRef.current = false;
            } finally {
                setIsAuthReady(true);
            }
        };

        syncClerkWithBackend();
    }, [isAuthLoaded, isSignedIn, isUserLoaded, clerkUser, handleGoogleLogin]);

    const data = {
        userData, 
        setUserData, 
        userRole,
        setUserRole,
        currentUser,
        setCurrentUser,
        addToUserHistory,
        getHistoryOfUser,
        clearUserHistoryApi,
        deleteMeetingHistoryApi,
        getActiveRoomsApi,
        handleRegister,
        handleLogin,
        handleGoogleLogin,
        handleLogout,
        handleForgotPassword,
        handleResetPassword,
        createQuizApi,
        submitQuizApi,
        getQuizRecordsApi,
        getAllUsersApi,
        updateUserRoleStatusApi,
        deleteUserApi,
        getSiteStatusApi,
        updateSiteStatusApi,
        getMediaPermissionsApi,
        updateMediaPermissionApi,
        getAgoraRtcTokenApi,
        isAuthReady
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};