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
 
const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/google-login").post(googleLogin);
router.route("/forgot-password").post(forgotPassword);
router.route("/send-password-to-mail").post(sendPasswordToMail);
router.route("/reset-password").post(resetPassword);
router.route("/profile").get(getUserProfile);
router.route("/create-quiz").post(createQuiz);
router.route("/submit-quiz").post(submitQuizAnswer);
router.route("/quiz-records").get(getQuizRecords);
router.route("/add_to_acitivity").post(addToHistory);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/get_to_activity").get(getUserHistory);

// WebRTC RTC Token Generation with Strict Role Authority
router.route("/media/rtc-token").post(generateRtcTokenController).get(generateRtcTokenController);

// Admin Routes
router.route("/admin/users").get(getAllUsers);
router.route("/admin/users/:userId").patch(updateUserRoleOrStatus);
router.route("/admin/media-permissions/:sessionId").get(getMediaPermissions).post(updateMediaPermission);

export default router;
