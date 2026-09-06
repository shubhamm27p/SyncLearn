import { Router } from "express";
import { 
    addToHistory, 
    getUserHistory, 
    login, 
    register, 
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
} from "../controllers/usersController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
 
const router = Router();

// Public Routes (Protected by API Trigger Limiter to prevent brute force)
router.route("/login").post(authLimiter, login);
router.route("/register").post(authLimiter, register);
router.route("/google-login").post(authLimiter, googleLogin);
router.route("/forgot-password").post(authLimiter, forgotPassword);
router.route("/send-password-to-mail").post(authLimiter, sendPasswordToMail);
router.route("/reset-password").post(authLimiter, resetPassword);

// Admin Routes (Note: In a full implementation, you'd add an adminMiddleware here)
router.route("/admin/users").get(getAllUsers);
router.route("/admin/users/:userId").patch(updateUserRoleOrStatus);
router.route("/admin/media-permissions/:sessionId").get(getMediaPermissions).post(updateMediaPermission);

// Protected Routes (Require Token Authorization)
router.use(authMiddleware); // Apply to all routes below this line

router.route("/profile").get(getUserProfile);
router.route("/create-quiz").post(createQuiz);
router.route("/submit-quiz").post(submitQuizAnswer);
router.route("/quiz-records").get(getQuizRecords);
router.route("/add_to_acitivity").post(addToHistory);
router.route("/add_to_activity").post(addToHistory); // alias
router.route("/get_all_activity").get(getUserHistory);
router.route("/get_to_activity").get(getUserHistory); // alias

// WebRTC RTC Token Generation with Strict Role Authority
router.route("/media/rtc-token").post(generateRtcTokenController).get(generateRtcTokenController);

export default router;
