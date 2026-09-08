import { Router } from "express";
import { 
    addToHistory, 
    getUserHistory, 
    clearUserHistory,
    deleteMeetingFromHistory,
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
    deleteUser,
    getMediaPermissions,
    updateMediaPermission,
    generateRtcTokenController
    ,getSiteStatus, updateSiteStatus, submitSupportTicket
} from "../controllers/usersController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";
import { getActiveRooms } from "../controllers/socketmanager.js";
 
const router = Router();

// Public Routes (Protected by API Trigger Limiter to prevent brute force)
router.route("/login").post(authLimiter, login);
router.route("/register").post(authLimiter, register);
router.route("/google-login").post(authLimiter, googleLogin);
router.route("/forgot-password").post(authLimiter, forgotPassword);
router.route("/send-password-to-mail").post(authLimiter, sendPasswordToMail);
router.route("/reset-password").post(authLimiter, resetPassword);
router.route("/support/submit").post(authLimiter, submitSupportTicket);

// Public status read is needed for the site availability page.
router.route("/site-status").get(getSiteStatus);

// Admin routes require a valid server-side session and an admin/trainer role.
router.route("/admin/users").get(authMiddleware, adminMiddleware, getAllUsers);
router.route("/admin/users/:userId")
    .patch(authMiddleware, adminMiddleware, updateUserRoleOrStatus)
    .delete(authMiddleware, adminMiddleware, deleteUser);
router.route("/admin/media-permissions/:sessionId")
    .get(authMiddleware, adminMiddleware, getMediaPermissions)
    .post(authMiddleware, adminMiddleware, updateMediaPermission);
router.route("/site-status").put(authMiddleware, adminMiddleware, updateSiteStatus);

// Protected Routes (Require Token Authorization)
router.use(authMiddleware);

router.route("/profile").get(getUserProfile);
router.route("/create-quiz").post(createQuiz);
router.route("/submit-quiz").post(submitQuizAnswer);
router.route("/quiz-records").get(getQuizRecords);
router.route("/add_to_acitivity").post(addToHistory);
router.route("/add_to_activity").post(addToHistory); // alias
router.route("/get_all_activity").get(getUserHistory);
router.route("/get_to_activity").get(getUserHistory); // alias
router.route("/clear_user_history").delete(clearUserHistory).post(clearUserHistory);
router.route("/delete_meeting_history/:id").delete(deleteMeetingFromHistory);

// ==============================
// Active Rooms Routes
// ==============================
router.route("/active-rooms").get((req, res) => {
    try {
        const activeRooms = getActiveRooms();
        return res.status(200).json({ activeRooms });
    } catch (e) {
        return res.status(500).json({ message: "Failed to fetch active rooms" });
    }
});

// ==============================
// WebRTC RTC Token Generation with Strict Role Authority
router.route("/media/rtc-token").post(generateRtcTokenController).get(generateRtcTokenController);

export default router;
