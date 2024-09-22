import { Router } from "express";
import {
  changePassword,
  getLoggedUser,
  getUserChannelProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateDetails,
  updateLoggedUserAvatar,
  updateLoggedUserCoverImage,
  userRegister
} from "../controllers/user.controller.js";
import { upload } from "../middllewares/multer.middleware.js";
import { verifyJwtToken } from "../middllewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/signup").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  userRegister
);
userRouter.route("/login").post(loginUser);

// secured routes
userRouter.route("/logout").post(verifyJwtToken, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/change-password").post(verifyJwtToken, changePassword);
userRouter.route("/current-user").get(verifyJwtToken, getLoggedUser);
userRouter.route("/update-details").patch(verifyJwtToken, updateDetails);
userRouter
  .route("/avatar-update")
  .patch(verifyJwtToken, upload.single("avatar"), updateLoggedUserAvatar);
userRouter
  .route("/cover-image-update")
  .patch(
    verifyJwtToken,
    upload.single("coverImage"),
    updateLoggedUserCoverImage
  );
userRouter
  .route("/chanel/:username")
  .get(verifyJwtToken, getUserChannelProfile);
userRouter.route("/history").get(verifyJwtToken, getUserWatchHistory);

export default userRouter;
