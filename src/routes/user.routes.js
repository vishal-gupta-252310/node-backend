import { Router } from "express";
import { userRegister } from "../controllers/user.controller.js";
import { upload } from "../middllewares/multer.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  userRegister
);

export default userRouter;
