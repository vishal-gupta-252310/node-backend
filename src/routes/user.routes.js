import { Router } from "express";
import {
  changePassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
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

export default userRouter;
