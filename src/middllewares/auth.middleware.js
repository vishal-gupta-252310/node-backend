// packages
import jwt from "jsonwebtoken";

// model
import { User } from "../models/users.model.js";

// services
import { asyncHandler } from "../utils/asyncHandler.js";
import { HaveValue, IsObjectHaveValues } from "../utils/Helper.js";
import { ApiError } from "../utils/ApiError.js";
import { userModelMessages } from "../config/messages.config.js";

export const verifyJwtToken = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");

    if (!HaveValue(token)) {
      throw new ApiError(401, userModelMessages?.logout?.unauthorized_msg);
    }

    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const existedUser = User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!IsObjectHaveValues(existedUser)) {
      throw new ApiError(409, userModelMessages?.logout?.invalid_token);
    }

    req.user = existedUser;
    next();
  } catch (error) {
    throw new ApiError(
      401,
      error.message || userModelMessages?.logout?.invalid_token
    );
  }
});
