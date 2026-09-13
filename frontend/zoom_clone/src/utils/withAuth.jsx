import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { AuthContext } from "../contents/AuthContents";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        const location = useLocation();
        const [isReady, setIsReady] = useState(false);
        const { isLoaded, isSignedIn } = useClerkAuth();
        const { user: clerkUser } = useUser();
        const { handleGoogleLogin } = useContext(AuthContext);

        useEffect(() => {
            if (!isLoaded) return; // Wait for Clerk state to be determined

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const storedUser = localStorage.getItem("currentUser") || localStorage.getItem("user") || sessionStorage.getItem("user");
            const isAdmin = sessionStorage.getItem("admin_authenticated") === "true";

            // If we already have our backend auth token, proceed
            if ((token && storedUser) || isAdmin) {
                setIsReady(true);
                return;
            }

            // If no backend token but Clerk says user is signed in (e.g. after OAuth redirect)
            // We need to sync Clerk user with the backend to get the JWT token
            if (isSignedIn && clerkUser) {
                const syncClerkWithBackend = async () => {
                    try {
                        const email = clerkUser.primaryEmailAddress?.emailAddress;
                        const name = clerkUser.fullName || clerkUser.username || "User";
                        const googleId = clerkUser.id;
                        
                        await handleGoogleLogin(email, name, googleId, "student");
                        // handleGoogleLogin saves token to localStorage
                        setIsReady(true);
                    } catch (error) {
                        console.error("Failed to sync Clerk session with backend", error);
                        navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
                    }
                };
                syncClerkWithBackend();
                return;
            }

            // If not authenticated in either system, redirect to auth
            navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
        }, [location, isLoaded, isSignedIn, clerkUser]);

        if (!isReady) {
            return null; // Or return a loading spinner if preferred
        }

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
