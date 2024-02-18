import { Router } from "express";
import { changeCurrentPassword, deleteUserAccount, forgotPassword, getCurrentUser, getUserProfile, loginUser, logoutUser, refereshAccessToken, registerUser, resetPassword, upDateUserDetails, verifyPasswordResetToken } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.route("/register").post(
//     upload.single([
//         {
//             name: "avatar",
//             maxCount: 1          //i can increase the maxCount to 2 if i want to upload two files for the property
//         }
//     ]),
//     registerUser
// )
router.route("/register").post(upload.single("avatar"), registerUser)
router.route("/login").post(loginUser);
//secured routes
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/refresh-token").post(refereshAccessToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-token/:token").patch(verifyPasswordResetToken);
router.route("/reset-password/:token").patch(resetPassword);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword)
router.route("/currentuser").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, upload.fields("avatar"), upDateUserDetails)
router.route("/profile/:userId").get(verifyJWT, getUserProfile)
router.route("/delete-account").get(verifyJWT, deleteUserAccount)


export default router;