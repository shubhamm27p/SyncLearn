import httpStatus from "http-status";
import { supabase } from "../utils/supabase.js";
import { generateAgoraRtcToken, RtcRole } from "../utils/agoraTokenGenerator.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendNewPasswordEmail } from "../utils/sendEmail.js";

const login = async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();
        if (error || !user) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            let token = crypto.randomBytes(20).toString("hex");

            await supabase.from('users').update({ token }).eq('id', user.id);
            
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
    const { name, username, password, role } = req.body || {};

    if (!name || !username || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        const { data: existingUser } = await supabase.from('users').select('*').eq('username', username).single();
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabase.from('users').insert([{
            name: name,
            username: username,
            password: hashedPassword,
            role: role || 'student'
        }]);

        if (error) throw error;

        return res.status(201).json({ message: "User Registered Successfully!" });
    } catch (e) {
        console.error("Register error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const getUserHistory = async (req, res) => {
    const token = req.query?.token || req.body?.token;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const { data: user, error: userError } = await supabase.from('users').select('*').eq('token', token).single();
        if (userError || !user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const { data: meetings, error: meetingsError } = await supabase.from('meetings').select('*').eq('user_id', user.username);
        if (meetingsError) throw meetingsError;

        return res.json(meetings);
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body || {};

    if (!token || !meeting_code) {
        return res.status(400).json({ message: "Token and meeting code are required" });
    }

    try {
        const { data: user, error: userError } = await supabase.from('users').select('*').eq('token', token).single();
        if (userError || !user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const { error } = await supabase.from('meetings').insert([{
            user_id: user.username,
            meeting_id: meeting_code
        }]);
        if (error) throw error;

        return res.status(201).json({ message: "Added code to History" });
    } catch (e) {
        console.error("addToHistory error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const googleLogin = async (req, res) => {
    const { email, name, googleId, role } = req.body || {};

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
                role: role || 'student',
                google_id: googleId || `google_${Date.now()}`,
                token: sessionToken
            }]).select().single();
            if (error) throw error;
            user = newUser;
        } else {
            const updateData = { token: sessionToken };
            if (googleId) updateData.google_id = googleId;
            if (name && !user.name) updateData.name = name;
            if (!user.email) updateData.email = email;
            if (role) updateData.role = role;

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

        const newPassword = `Viora#${Math.floor(100000 + Math.random() * 900000)}`;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const { error } = await supabase.from('users').update({
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null
        }).eq('id', user.id);
        
        if (error) throw error;

        const targetEmail = user.email || (user.username.includes("@") ? user.username : `${user.username}@example.com`);
        await sendNewPasswordEmail(targetEmail, newPassword, user.username);

        return res.status(200).json({
            message: `A new password (${newPassword}) has been generated and sent to your email (${targetEmail})!`,
            newPassword: newPassword,
            email: targetEmail,
            username: user.username
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

const createQuiz = async (req, res) => {
    const { meetingId, question, options, correctOptionIndex, creatorId } = req.body || {};

    if (!meetingId || !question || !options || !Array.isArray(options) || options.length === 0 || correctOptionIndex === undefined || correctOptionIndex === null) {
        return res.status(400).json({ message: "Please provide meetingId, question, options array, and correctOptionIndex." });
    }

    try {
        const { data: newQuiz, error } = await supabase.from('quizzes').insert([{
            meeting_id: meetingId,
            question,
            options,
            correct_option_index: Number(correctOptionIndex),
            creator_id: creatorId || "Trainer"
        }]).select().single();
        
        if (error) throw error;
        
        return res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });
    } catch (e) {
        console.error("Create Quiz error:", e);
        return res.status(500).json({ message: `Failed to create quiz: ${e.message || e}` });
    }
};

const submitQuizAnswer = async (req, res) => {
    const { quizId, meetingId, studentUsername, studentName, selectedOptionIndex } = req.body || {};

    if (!quizId || !meetingId || !studentUsername || selectedOptionIndex === undefined) {
        return res.status(400).json({ message: "Please provide quizId, meetingId, studentUsername, and selectedOptionIndex." });
    }

    try {
        const { data: quiz, error: quizError } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
        if (quizError || !quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const isCorrect = Number(selectedOptionIndex) === Number(quiz.correct_option_index);

        const { data: submission, error: subError } = await supabase.from('submissions').insert([{
            quiz_id: quizId,
            meeting_id: meetingId,
            student_username: studentUsername,
            student_name: studentName || studentUsername,
            selected_option_index: selectedOptionIndex,
            is_correct: isCorrect
        }]).select().single();
        
        if (subError) throw subError;

        return res.status(200).json({
            message: isCorrect ? "Correct answer!" : "Wrong answer!",
            isCorrect,
            correctOptionIndex: quiz.correct_option_index,
            selectedOptionIndex,
            submission
        });
    } catch (e) {
        console.error("Submit Quiz Answer error:", e);
        return res.status(500).json({ message: `Failed to submit answer: ${e.message || e}` });
    }
};

const getQuizRecords = async (req, res) => {
    const { meetingId, quizId } = req.query || {};

    try {
        let query = supabase.from('submissions').select('*').order('submitted_at', { ascending: false });
        if (meetingId) query = query.eq('meeting_id', meetingId);
        if (quizId) query = query.eq('quiz_id', quizId);

        const { data: submissions, error } = await query;
        if (error) throw error;

        const rightCount = submissions.filter(s => s.is_correct).length;
        const wrongCount = submissions.filter(s => !s.is_correct).length;

        return res.status(200).json({
            total: submissions.length,
            rightCount,
            wrongCount,
            submissions
        });
    } catch (e) {
        console.error("Get Quiz Records error:", e);
        return res.status(500).json({ message: `Failed to fetch records: ${e.message || e}` });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Exclude password and tokens
        const { data: users, error } = await supabase.from('users')
            .select('id, name, username, email, role, is_active, created_at, updated_at')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return res.status(200).json(users);
    } catch (e) {
        console.error("Get All Users error:", e);
        return res.status(500).json({ message: `Failed to fetch users: ${e.message || e}` });
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

export { 
    login, 
    register, 
    getUserHistory, 
    addToHistory, 
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
    getMediaPermissions,
    updateMediaPermission,
    generateRtcTokenController
};