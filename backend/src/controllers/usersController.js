import httpStatus from "http-status";
import { User } from "../models/usersModels.js";
import { Metting as Meeting } from "../models/mettingModel.js";
import { Quiz } from "../models/quizModel.js";
import { Submission } from "../models/submissionModel.js";
import { MediaPermission } from "../models/mediaPermissionModel.js";
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
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(200).json({ 
                token: token, 
                message: "Logged in successfully",
                user: {
                    name: user.name,
                    username: user.username,
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
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword,
            role: role || 'student'
        });

        await newUser.save();

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
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const meetings = await Meeting.find({ user_id: user.username });
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
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meeting_id: meeting_code
        });
        await newMeeting.save();
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
        let user = await User.findOne({ $or: [{ email: email }, { username: email }] });
        
        if (!user) {
            user = new User({
                name: name || email.split('@')[0],
                email: email,
                username: email,
                role: role || 'student',
                googleId: googleId || `google_${Date.now()}`
            });
        } else {
            if (googleId) user.googleId = googleId;
            if (name && !user.name) user.name = name;
            if (!user.email) user.email = email;
            if (role) user.role = role;
        }

        const sessionToken = crypto.randomBytes(20).toString("hex");
        user.token = sessionToken;
        await user.save();

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
        const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
        if (!user) {
            return res.status(404).json({ message: "No account found with that username or email." });
        }

        // Generate a new secure password
        const newPassword = `Viora#${Math.floor(100000 + Math.random() * 900000)}`;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

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
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }],
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired password reset code." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully! You can now log in." });
    } catch (e) {
        console.error("Reset Password error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message || e}` });
    }
};

const getUserProfile = async (req, res) => {
    const token = req.query?.token || req.headers?.authorization;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const user = await User.findOne({ token: token });
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
        const newQuiz = new Quiz({
            meetingId,
            question,
            options,
            correctOptionIndex: Number(correctOptionIndex),
            creatorId: creatorId || "Trainer"
        });
        await newQuiz.save();
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
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const isCorrect = Number(selectedOptionIndex) === Number(quiz.correctOptionIndex);

        const submission = new Submission({
            quizId,
            meetingId,
            studentUsername,
            studentName: studentName || studentUsername,
            selectedOptionIndex,
            isCorrect
        });
        await submission.save();

        return res.status(200).json({
            message: isCorrect ? "Correct answer!" : "Wrong answer!",
            isCorrect,
            correctOptionIndex: quiz.correctOptionIndex,
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
        const filter = {};
        if (meetingId) filter.meetingId = meetingId;
        if (quizId) filter.quizId = quizId;

        const submissions = await Submission.find(filter).sort({ submittedAt: -1 });

        const rightCount = submissions.filter(s => s.isCorrect).length;
        const wrongCount = submissions.filter(s => !s.isCorrect).length;

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
        const users = await User.find({}, "-password -resetPasswordToken").sort({ createdAt: -1 });
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
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (role && ['student', 'trainer', 'admin'].includes(role)) {
            user.role = role;
        }
        if (typeof is_active === "boolean") {
            user.is_active = is_active;
        }

        await user.save();
        return res.status(200).json({ message: "User updated successfully", user });
    } catch (e) {
        console.error("Update User error:", e);
        return res.status(500).json({ message: `Failed to update user: ${e.message || e}` });
    }
};

const getMediaPermissions = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const permissions = await MediaPermission.find({ sessionId });
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
        const perm = await MediaPermission.findOneAndUpdate(
            { sessionId, userId },
            {
                username,
                canPublishAudio: !!canPublishAudio,
                canPublishVideo: !!canPublishVideo,
                canScreenShare: !!canScreenShare,
                updatedBy: updatedBy || "Admin"
            },
            { upsert: true, new: true }
        );

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
            userObj = await User.findOne({ token: userToken });
        } else if (username) {
            userObj = await User.findOne({ username });
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
            const perm = await MediaPermission.findOne({ sessionId: channelName, userId: userObj._id.toString() });
            if (perm && (perm.canPublishAudio || perm.canPublishVideo || perm.canScreenShare)) {
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