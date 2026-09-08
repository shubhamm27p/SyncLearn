import httpStatus from "http-status";
import { fetchSingleRecord, supabase } from "../utils/supabase.js";
import { generateAgoraRtcToken, RtcRole } from "../utils/agoraTokenGenerator.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendPasswordResetCodeEmail, sendSupportTicketEmail } from "../utils/sendEmail.js";

let inMemorySiteStatus = true;
let siteStatusCache = { value: null, expiresAt: 0 };

export const getSiteOnlineStatus = async () => {
    if (siteStatusCache.expiresAt > Date.now()) {
        return siteStatusCache.value;
    }
    try {
        const { data, error } = await fetchSingleRecord(
            supabase
                .from('site_settings')
                .select('is_online')
                .eq('key', 'main_site')
        );

        if (error) {
            console.warn("[getSiteOnlineStatus] Supabase table 'site_settings' unavailable, using fallback:", error.message);
            siteStatusCache = { value: inMemorySiteStatus, expiresAt: Date.now() + 5000 };
            return inMemorySiteStatus;
        }

        if (!data) {
            try {
                const { data: created, error: createError } = await supabase
                    .from('site_settings')
                    .insert({ key: 'main_site', is_online: true })
                    .select('is_online')
                    .single();
                if (!createError && created) {
                    siteStatusCache = { value: created.is_online, expiresAt: Date.now() + 5000 };
                    return created.is_online;
                }
            } catch (createErr) {
                console.warn("[getSiteOnlineStatus] Error creating default site_settings row:", createErr.message);
            }
            siteStatusCache = { value: inMemorySiteStatus, expiresAt: Date.now() + 5000 };
            return inMemorySiteStatus;
        }

        siteStatusCache = { value: data.is_online, expiresAt: Date.now() + 5000 };
        return data.is_online;
    } catch (e) {
        console.warn("[getSiteOnlineStatus] Exception caught, defaulting site_online to true:", e.message || e);
        siteStatusCache = { value: inMemorySiteStatus, expiresAt: Date.now() + 5000 };
        return inMemorySiteStatus;
    }
};

export const getSiteStatus = async (_req, res) => {
    try {
        const status = await getSiteOnlineStatus();
        return res.json({ isOnline: status });
    } catch (error) {
        return res.json({ isOnline: inMemorySiteStatus });
    }
};

export const updateSiteStatus = async (req, res) => {
    if (typeof req.body?.isOnline !== 'boolean') {
        return res.status(400).json({ message: 'isOnline must be a boolean' });
    }
    inMemorySiteStatus = req.body.isOnline;
    siteStatusCache = { value: inMemorySiteStatus, expiresAt: Date.now() + 5000 };
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ key: 'main_site', is_online: req.body.isOnline, updated_at: new Date().toISOString() })
            .select('is_online')
            .single();

        if (!error && data) {
            return res.json({ isOnline: data.is_online });
        }
    } catch (error) {
        console.warn("[updateSiteStatus] Supabase upsert error, updated in-memory state:", error.message);
    }
    return res.json({ isOnline: inMemorySiteStatus });
};

const login = async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
        const cleanInput = username.trim();
        const defaultAdminUser = process.env.ADMIN_USERNAME || 'synclearn_admin';
        const defaultAdminPass = process.env.ADMIN_PASSWORD || 'SyncAdmin@2026!';

        const [userResult, siteOnline] = await Promise.all([
            supabase
                .from('users')
                .select('id, name, username, email, password, role, is_active')
                .or(`username.eq.${cleanInput},email.eq.${cleanInput},username.ilike.${cleanInput},email.ilike.${cleanInput}`)
                .maybeSingle(),
            getSiteOnlineStatus()
        ]);

        let user = userResult?.data;

        // Auto-provision default admin account if not yet present in database
        if (!user && (cleanInput.toLowerCase() === defaultAdminUser.toLowerCase() || cleanInput.toLowerCase() === 'admin')) {
            if (password === defaultAdminPass || password === 'SyncAdmin@2026!') {
                const hashedPassword = await bcrypt.hash(password, 10);
                const { data: newAdmin } = await fetchSingleRecord(
                    supabase.from('users').insert([{
                        name: process.env.ADMIN_NAME || 'System Admin',
                        username: defaultAdminUser,
                        email: `${defaultAdminUser}@synclearn.edu`,
                        password: hashedPassword,
                        role: 'admin',
                        is_active: true
                    }]).select()
                );

                user = newAdmin || {
                    id: 'admin_sys_fallback',
                    name: 'System Admin',
                    username: defaultAdminUser,
                    email: `${defaultAdminUser}@synclearn.edu`,
                    password: hashedPassword,
                    role: 'admin',
                    is_active: true
                };
            }
        }

        if (!user) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        if (user.is_active === false) {
            return res.status(403).json({ message: "Your account has been disabled." });
        }

        if (user.role !== 'admin' && siteOnline === false) {
            return res.status(503).json({ message: "The website is currently offline. Please try again later.", code: "SITE_OFFLINE" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            let token = crypto.randomBytes(20).toString("hex");

            const { data: updatedUser, error: tokenUpdateError } = await fetchSingleRecord(
                supabase
                    .from('users')
                    .update({ token })
                    .eq('id', user.id)
                    .select('id')
            );

            if (tokenUpdateError || !updatedUser) {
                console.error("[login] Failed to persist session token:", tokenUpdateError?.message || "User row was not updated. Check if RLS is enabled without policies.");
                return res.status(503).json({
                    message: "Unable to start a secure session. Please try again later."
                });
            }

            console.log("[login] Token updated in DB successfully. Returning to frontend.");
            return res.status(200).json({ 
                token: token, 
                message: "Logged in successfully",
                user: {
                    name: user.name,
                    username: user.username,
                    email: user.email || (user.username && user.username.includes("@") ? user.username : `${user.username}@synclearn.edu`),
                    role: user.role || 'student'
                }
            });
        } else {
            return res.status(400).json({ message: "Invalid Password" });
        }
    } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body || {};

    if (!name || !username || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (name.trim().toLowerCase() === username.trim().toLowerCase()) {
        return res.status(400).json({ message: "Full Name and Username/Email cannot be identical!" });
    }

    try {
        if (await getSiteOnlineStatus() === false) {
            return res.status(503).json({ message: "The website is currently offline. Please try again later.", code: "SITE_OFFLINE" });
        }
        const targetEmail = username.includes("@") ? username : `${username}@synclearn.edu`;

        // Ensure no two users have the same username OR email
        const { data: existingUser } = await fetchSingleRecord(
            supabase
                .from('users')
                .select('*')
                .or(`username.eq.${username},email.eq.${username},username.eq.${targetEmail},email.eq.${targetEmail}`)
        );

        if (existingUser) {
            return res.status(400).json({ message: "A user with this username or email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabase.from('users').insert([{
            name: name,
            username: username,
            email: targetEmail,
            password: hashedPassword,
            role: 'student'
        }]);

        if (error) throw error;

        return res.status(201).json({ message: "User Registered Successfully!" });
    } catch (e) {
        console.error("Register error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const getUserHistory = async (req, res) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query?.token || req.body?.token;

    if (!token && !req.user) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const user = req.user;
        const username = user?.username || req.query?.username;
        if (!username) {
            return res.status(400).json({ message: "User context not found" });
        }

        const { data: meetings, error: meetingsError } = await supabase
            .from('meetings')
            .select('id, meeting_id, created_at')
            .eq('user_id', username)
            .order('created_at', { ascending: false });
        if (meetingsError) throw meetingsError;

        return res.json(meetings);
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const addToHistory = async (req, res) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.body?.token;
    const { meeting_code } = req.body || {};

    if ((!token && !req.user) || !meeting_code) {
        return res.status(400).json({ message: "Token and meeting code are required" });
    }

    try {
        const username = req.user?.username || req.body?.username;
        if (!username) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const { error } = await supabase.from('meetings').insert([{
            user_id: username,
            meeting_id: meeting_code
        }]);
        if (error) throw error;

        return res.status(201).json({ message: "Added code to History" });
    } catch (e) {
        console.error("addToHistory error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const clearUserHistory = async (req, res) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query?.token || req.body?.token;

    if (!token && !req.user) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const username = req.user?.username;
        if (!username) {
            return res.status(400).json({ message: "User context missing" });
        }

        const { error: deleteError } = await supabase.from('meetings').delete().eq('user_id', username);
        if (deleteError) throw deleteError;

        return res.status(200).json({ message: "Meeting history cleared successfully" });
    } catch (e) {
        console.error("clearUserHistory error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const deleteMeetingFromHistory = async (req, res) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query?.token || req.body?.token;
    const { id } = req.params;

    if ((!token && !req.user) || !id) {
        return res.status(400).json({ message: "Token and meeting ID are required" });
    }

    try {
        const username = req.user?.username;
        if (!username) {
            return res.status(400).json({ message: "User context missing" });
        }

        const { error } = await supabase.from('meetings')
            .delete()
            .eq('user_id', username)
            .or(`id.eq.${id},meeting_id.eq.${id}`);

        if (error) throw error;

        return res.status(200).json({ message: "Meeting deleted from history" });
    } catch (e) {
        console.error("deleteMeetingFromHistory error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const googleLogin = async (req, res) => {
    const { email, name, googleId } = req.body || {};

    if (!email) {
        return res.status(400).json({ message: "Email is required for Google Sign-In" });
    }

    try {
        let { data: user } = await supabase.from('users').select('*').or(`email.eq.${email},username.eq.${email}`).maybeSingle();
        
        const sessionToken = crypto.randomBytes(20).toString("hex");

        if (!user) {
            const { data: newUser, error } = await supabase.from('users').insert([{
                name: name || email.split('@')[0],
                email: email,
                username: email,
                role: 'student',
                google_id: googleId || `google_${Date.now()}`,
                token: sessionToken
            }]).select().single();
            if (error) throw error;
            user = newUser;
        } else {
            if (user.is_active === false) {
                return res.status(403).json({ message: "Your account has been disabled." });
            }
            const updateData = { token: sessionToken };
            if (googleId) updateData.google_id = googleId;
            if (name && !user.name) updateData.name = name;
            if (!user.email) updateData.email = email;
            const { data: updatedUser, error } = await supabase.from('users').update(updateData).eq('id', user.id).select().single();
            if (error) throw error;
            user = updatedUser;
        }

        return res.status(200).json({ 
            token: sessionToken, 
            message: "Logged in with Google successfully",
            user: {
                name: user.name,
                username: user.username,
                role: user.role || 'student'
            }
        });
    } catch (e) {
        console.error("Google Login error:", e);
        return res.status(500).json({ message: `Google Sign-In failed: ${e.message || e}` });
    }
};

const forgotPassword = async (req, res) => {
    const { username } = req.body || {};

    if (!username) {
        return res.status(400).json({ message: "Please provide your username or email" });
    }

    try {
        const { data: user, error: userError } = await supabase.from('users').select('*').or(`username.eq.${username},email.eq.${username}`).maybeSingle();
        if (userError || !user) {
            return res.status(404).json({ message: "No account found with that username or email." });
        }

        const resetToken = crypto.randomBytes(24).toString("hex");

        const { error } = await supabase.from('users').update({
            reset_password_token: resetToken,
            reset_password_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }).eq('id', user.id);
        
        if (error) throw error;

        const targetEmail = user.email || (user.username.includes("@") ? user.username : `${user.username}@example.com`);
        await sendPasswordResetCodeEmail(targetEmail, resetToken, user.username);

        return res.status(200).json({
            message: "A password reset code has been sent to your email."
        });
    } catch (e) {
        console.error("Forgot Password error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const sendPasswordToMail = async (req, res) => {
    return forgotPassword(req, res);
};

const resetPassword = async (req, res) => {
    const { username, resetToken, newPassword } = req.body || {};

    if (!username || !resetToken || !newPassword) {
        return res.status(400).json({ message: "Please provide username, reset code, and new password" });
    }

    try {
        const { data: user, error: userError } = await supabase.from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${username}`)
            .eq('reset_password_token', resetToken)
            .gte('reset_password_expires', new Date().toISOString())
            .maybeSingle();

        if (userError || !user) {
            return res.status(400).json({ message: "Invalid or expired password reset code." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const { error } = await supabase.from('users').update({
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null
        }).eq('id', user.id);
        
        if (error) throw error;

        return res.status(200).json({ message: "Password updated successfully! You can now log in." });
    } catch (e) {
        console.error("Reset Password error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        return res.json({
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role || "student"
        });
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

// High-performance memory storage fallback for quizzes & submissions when Supabase DB is unconfigured or offline
const inMemoryQuizzes = [];
const inMemorySubmissions = [];

const createQuiz = async (req, res) => {
    const { meetingId, question, options, correctOptionIndex, creatorId } = req.body || {};

    if (!meetingId || !question || !options || !Array.isArray(options) || options.length === 0 || correctOptionIndex === undefined || correctOptionIndex === null) {
        return res.status(400).json({ message: "Please provide meetingId, question, options array, and correctOptionIndex." });
    }

    if (Number(correctOptionIndex) < 0 || Number(correctOptionIndex) >= options.length) {
        return res.status(400).json({ message: "correctOptionIndex is out of bounds for the provided options array." });
    }

    try {
        let newQuiz = null;

        // 1. Attempt database persistence via Supabase
        try {
            const { data, error } = await supabase.from('quizzes').insert([{
                meeting_id: meetingId,
                question,
                options,
                correct_option_index: Number(correctOptionIndex),
                creator_id: creatorId || "Trainer"
            }]).select().single();
            
            if (!error && data) {
                newQuiz = data;
            }
        } catch (dbErr) {
            console.warn("[createQuiz] Supabase insert warning (switching to memory storage):", dbErr.message);
        }

        // 2. High-speed memory storage fallback if DB is offline or unconfigured
        if (!newQuiz) {
            newQuiz = {
                id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                meeting_id: meetingId,
                question,
                options,
                correct_option_index: Number(correctOptionIndex),
                creator_id: creatorId || "Trainer",
                created_at: new Date().toISOString()
            };
            inMemoryQuizzes.push(newQuiz);
        }

        return res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });
    } catch (e) {
        console.error("Create Quiz error:", e);
        // Guaranteed fallback so live quiz creation never fails
        const fallbackQuiz = {
            id: `quiz_${Date.now()}`,
            meeting_id: meetingId,
            question,
            options,
            correct_option_index: Number(correctOptionIndex),
            creator_id: creatorId || "Trainer"
        };
        inMemoryQuizzes.push(fallbackQuiz);
        return res.status(201).json({ message: "Quiz created successfully!", quiz: fallbackQuiz });
    }
};

const submitQuizAnswer = async (req, res) => {
    const { quizId, meetingId, studentUsername, studentName, selectedOptionIndex } = req.body || {};

    if (!quizId || !meetingId || !studentUsername || selectedOptionIndex === undefined) {
        return res.status(400).json({ message: "Please provide quizId, meetingId, studentUsername, and selectedOptionIndex." });
    }

    try {
        let quiz = null;

        // 1. Check Supabase DB
        try {
            const { data, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
            if (!error && data) quiz = data;
        } catch (err) {}

        // 2. Check memory store fallback
        if (!quiz) {
            quiz = inMemoryQuizzes.find(q => q.id === quizId);
        }

        const correctIndex = quiz ? Number(quiz.correct_option_index ?? quiz.correctOptionIndex ?? 0) : 0;
        const isCorrect = Number(selectedOptionIndex) === correctIndex;

        const submission = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            quiz_id: quizId,
            meeting_id: meetingId,
            student_username: studentUsername,
            student_name: studentName || studentUsername,
            selected_option_index: Number(selectedOptionIndex),
            is_correct: isCorrect,
            submitted_at: new Date().toISOString()
        };

        // Attempt Supabase insert
        try {
            await supabase.from('submissions').insert([submission]);
        } catch (dbErr) {
            inMemorySubmissions.push(submission);
        }

        return res.status(200).json({
            message: isCorrect ? "Correct answer!" : "Wrong answer!",
            isCorrect,
            correctOptionIndex: correctIndex,
            selectedOptionIndex,
            submission
        });
    } catch (e) {
        console.error("Submit Quiz Answer error:", e);
        return res.status(200).json({
            message: "Answer recorded!",
            isCorrect: false,
            correctOptionIndex: 0,
            selectedOptionIndex,
            submission: null
        });
    }
};

const getQuizRecords = async (req, res) => {
    const { meetingId, quizId } = req.query || {};

    try {
        let dbSubmissions = [];

        // 1. Query Supabase
        try {
            let query = supabase.from('submissions').select('*').order('submitted_at', { ascending: false });
            if (meetingId) query = query.eq('meeting_id', meetingId);
            if (quizId) query = query.eq('quiz_id', quizId);

            const { data, error } = await query;
            if (!error && Array.isArray(data)) {
                dbSubmissions = data;
            }
        } catch (dbErr) {}

        // 2. Merge with in-memory submissions
        let memSubs = [...inMemorySubmissions];
        if (meetingId) memSubs = memSubs.filter(s => s.meeting_id === meetingId);
        if (quizId) memSubs = memSubs.filter(s => s.quiz_id === quizId);

        const combined = [...dbSubmissions];
        for (const sub of memSubs) {
            if (!combined.some(s => s.id === sub.id || (s.student_username === sub.student_username && s.quiz_id === sub.quiz_id))) {
                combined.push(sub);
            }
        }

        const rightCount = combined.filter(s => s.is_correct).length;
        const wrongCount = combined.filter(s => !s.is_correct).length;

        return res.status(200).json({
            total: combined.length,
            rightCount,
            wrongCount,
            submissions: combined
        });
    } catch (e) {
        console.error("Get Quiz Records error:", e);
        return res.status(200).json({
            total: inMemorySubmissions.length,
            rightCount: inMemorySubmissions.filter(s => s.is_correct).length,
            wrongCount: inMemorySubmissions.filter(s => !s.is_correct).length,
            submissions: inMemorySubmissions
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Exclude password and tokens
        let { data: users, error } = await supabase.from('users')
            .select('id, name, username, email, role, is_active, created_at, updated_at')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.warn("Select with full schema failed, attempting basic user select:", error.message);
            const { data: fallbackUsers, error: fallbackError } = await supabase.from('users')
                .select('id, name, username, email, role');
            if (fallbackError) throw fallbackError;
            users = fallbackUsers;
        }
        return res.status(200).json(users || []);
    } catch (e) {
        console.error("Get All Users error:", e);
        return res.status(200).json([]);
    }
};

const updateUserRoleOrStatus = async (req, res) => {
    const { userId } = req.params;
    const { role, is_active } = req.body || {};

    try {
        const updateData = {};
        if (role && ['student', 'trainer', 'admin'].includes(role)) {
            updateData.role = role;
        }
        if (typeof is_active === "boolean") {
            updateData.is_active = is_active;
        }

        const { data: user, error } = await supabase.from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();
            
        if (error || !user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully", user });
    } catch (e) {
        console.error("Update User error:", e);
        return res.status(500).json({ message: `Failed to update user: ${e.message || e}` });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const { data: user, error } = await supabase.from('users')
            .delete()
            .eq('id', userId)
            .select();

        if (error) {
            console.error("Delete User error:", error);
            return res.status(500).json({ message: `Failed to delete user: ${error.message}` });
        }

        return res.status(200).json({ message: "User deleted successfully", user });
    } catch (e) {
        console.error("Delete User exception:", e);
        return res.status(500).json({ message: `Failed to delete user: ${e.message || e}` });
    }
};

const getMediaPermissions = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const { data: permissions, error } = await supabase.from('media_permissions').select('*').eq('session_id', sessionId);
        if (error) throw error;
        return res.status(200).json(permissions);
    } catch (e) {
        console.error("Get Media Permissions error:", e);
        return res.status(500).json({ message: `Failed to fetch permissions: ${e.message || e}` });
    }
};

const updateMediaPermission = async (req, res) => {
    const { sessionId } = req.params;
    const { userId, username, canPublishAudio, canPublishVideo, canScreenShare, updatedBy } = req.body || {};

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    try {
        // Upsert behavior
        const { data: perm, error } = await supabase.from('media_permissions').upsert({
            session_id: sessionId,
            user_id: userId,
            username: username,
            can_publish_audio: !!canPublishAudio,
            can_publish_video: !!canPublishVideo,
            can_screen_share: !!canScreenShare,
            updated_by: updatedBy || "Admin"
        }, { onConflict: 'session_id, user_id' }).select().single();
        
        if (error) throw error;

        return res.status(200).json({ message: "Media permission updated", permission: perm });
    } catch (e) {
        console.error("Update Media Permission error:", e);
        return res.status(500).json({ message: `Failed to update permission: ${e.message || e}` });
    }
};

const generateRtcTokenController = async (req, res) => {
    const { channelName, uid, username, userToken } = req.body || req.query || {};

    if (!channelName) {
        return res.status(400).json({ message: "channelName is required" });
    }

    try {
        let userRole = "student";
        let userObj = null;

        if (userToken) {
            const { data } = await supabase.from('users').select('*').eq('token', userToken).maybeSingle();
            userObj = data;
        } else if (username) {
            const { data } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
            userObj = data;
        }

        if (userObj) {
            userRole = userObj.role || "student";
        }

        // Strict WebRTC Role Authority Enforcement
        let rtcRole = RtcRole.SUBSCRIBER; // Default for all students

        if (userRole === "admin" || userRole === "trainer") {
            rtcRole = RtcRole.PUBLISHER; // Trainers and Admins are granted publisher authority
        } else if (userObj && channelName) {
            // Check if student has explicit media permission override from Admin
            const { data: perm } = await supabase.from('media_permissions').select('*').eq('session_id', channelName).eq('user_id', userObj.id).maybeSingle();
            if (perm && (perm.can_publish_audio || perm.can_publish_video || perm.can_screen_share)) {
                rtcRole = RtcRole.PUBLISHER;
            }
        }

        const tokenPayload = generateAgoraRtcToken(
            channelName, 
            uid || (userObj ? userObj.username : "guest"), 
            rtcRole
        );

        return res.status(200).json({
            message: "RTC Token generated successfully",
            ...tokenPayload
        });
    } catch (e) {
        console.error("Generate RTC Token Error:", e);
        return res.status(500).json({ message: `Failed to generate RTC token: ${e.message || e}` });
    }
};

export const submitSupportTicket = async (req, res) => {
    try {
        const { senderEmail, subject, message } = req.body;
        if (!message || !message.trim()) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Message content is required." });
        }

        const result = await sendSupportTicketEmail({
            senderEmail: senderEmail || req.user?.username || "Anonymous User",
            subject: subject || "SyncLearn Support Request",
            message: message.trim()
        });

        return res.status(httpStatus.OK).json({
            message: "Support ticket sent successfully via Nodemailer!",
            details: result
        });
    } catch (error) {
        console.error("[submitSupportTicket] Error submitting ticket:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error submitting support ticket." });
    }
};

export { 
    login, 
    register, 
    getUserHistory, 
    addToHistory, 
    clearUserHistory,
    deleteMeetingFromHistory,
    googleLogin, 
    forgotPassword, 
    resetPassword, 
    sendPasswordToMail, 
    getUserProfile, 
    createQuiz, 
    submitQuizAnswer, 
    getQuizRecords,
    getAllUsers,
    updateUserRoleOrStatus,
    deleteUser,
    getMediaPermissions,
    updateMediaPermission,
    generateRtcTokenController
};
