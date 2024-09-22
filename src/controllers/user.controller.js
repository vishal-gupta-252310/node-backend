// service and model
import { userModelMessages } from "../config/messages.config.js";
import { COOKIE_OPTIONS } from "../constants.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/FileUploadWithCloudinary.js";
import {
  ArrayHaveValues,
  GetObjectCopy,
  HaveValue,
  IsDefined,
  IsObjectHaveValues,
  IsStrictlyEqual,
  IsTrue,
  validateEmail
} from "../utils/Helper.js";
import jwt from "jsonwebtoken";

const userRegister = asyncHandler(async (req, res) => {
  // 1. to get the data from request body
  const { username, email, fullName, password } = req.body;

  // 2. validations not empty
  if (
    [username, email, fullName, password].some((field) => !HaveValue(field))
  ) {
    throw new ApiError(400, userModelMessages?.register?.all_fields_required);
  }
  // 3. check email and username is already exist or not if exist throw user exist error
  const userExisted = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (userExisted) {
    throw new ApiError(409, userModelMessages?.register?.user_already_exist);
  }

  if (!IsTrue(validateEmail(email))) {
    throw new ApiError(400, userModelMessages?.register?.email_validation_msg);
  }

  // 3. check for images, check for profile_pic
  const avatarLocalPath = req?.files?.avatar[0]?.path;

  if (!HaveValue(avatarLocalPath)) {
    throw new ApiError(400, userModelMessages?.register?.avatar_file_required);
  }

  const coverImageLocalPath = "";

  if (
    IsDefined(req?.files?.coverImage) &&
    ArrayHaveValues(req?.files?.coverImage)
  ) {
    coverImageLocalPath = req?.files?.coverImage[0]?.path;
  }

  const avatarImageCloudinary = await uploadFileOnCloudinary(avatarLocalPath);

  if (!avatarImageCloudinary) {
    throw new ApiError(400, userModelMessages?.register?.failed_to_upload_file);
  }

  let coverImageCloudinary = "";

  if (HaveValue(coverImageLocalPath)) {
    coverImageCloudinary = await uploadFileOnCloudinary(coverImageLocalPath);
  }

  // 5. create user object to store in db
  const userData = await User.create({
    email,
    username: username.toLowerCase(),
    password,
    fullName,
    avatar: avatarImageCloudinary?.url,
    coverImage: coverImageCloudinary?.url || ""
  });

  // 5. remove password and refresh token from response
  const createdUser = await User.findById(userData?._id).select(
    "-password -refreshToken"
  );

  if (createdUser) {
    new ApiError(500, userModelMessages?.register?.failed_to_create_user);
  }

  // 6. check user created if create then return res
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.register?.user_created_successfully,
        createdUser
      )
    );
});

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user?.generateAccessToken();
    const refreshToken = await user?.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, userModelMessages?.login?.common_error_msg_server);
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // get details from body
  // check empty validations and throw error
  // check email is valid if email provided and email is not valid then throw error
  // check email exist in db if not exist then throw error
  // check password is correct if not correct throw error
  // get logged user detail
  // generate access token and refresh token
  // save refresh token in db
  // return res with access token, refresh token in cookie
  // delete password and refresh token from object
  // return  and user details with success message

  const { email, password, username } = req.body;

  if (!HaveValue(email) && !HaveValue(username)) {
    throw new ApiError(
      400,
      userModelMessages?.login?.email_or_username_required
    );
  }

  if (!HaveValue(password)) {
    throw new ApiError(400, userModelMessages?.login?.password_field_required);
  }

  if (HaveValue(email) && !IsTrue(validateEmail(email))) {
    throw new ApiError(400, userModelMessages?.register?.email_validation_msg);
  }

  const userExisted = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!IsObjectHaveValues(userExisted)) {
    throw new ApiError(409, userModelMessages?.login?.user_not_exist);
  }

  const isPasswordValid = await userExisted?.isPasswordCorrect(password);

  if (!IsTrue(isPasswordValid)) {
    throw new ApiError(400, userModelMessages?.login?.password_incorrect);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userExisted?._id
  );

  delete userExisted?.password;
  delete userExisted?.refreshToken;

  res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(200, userModelMessages?.login?.logged_successfully, {
        user: userExisted,
        accessToken,
        refreshToken
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req?.user?._id, {
    $set: {
      refreshToken: ""
    }
  });

  return res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(new ApiResponse(200, userModelMessages?.logout?.logout_msg, {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req?.cookies?.refreshToken || req?.body?.refreshToken;

  if (!HaveValue(token)) {
    throw new ApiError(401, userModelMessages?.logout?.unauthorized_msg);
  }

  try {
    const decodeToken = await jwt.verify(
      token,
      process?.env?.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken?._id);

    if (!IsObjectHaveValues(user)) {
      throw new ApiError(401, userModelMessages?.logout?.invalid_token);
    }

    if (!IsStrictlyEqual(token, user?.refreshToken)) {
      throw new ApiError(
        401,
        userModelMessages?.logout?.refresh_token_expired_or_use
      );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user?._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          200,
          userModelMessages?.refreshToken?.access_token_refreshed,
          {
            accessToken,
            refreshToken
          }
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || userModelMessages?.logout?.invalid_token
    );
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!HaveValue(oldPassword) || !HaveValue(newPassword)) {
    throw new ApiError(
      401,
      userModelMessages?.change_password?.both_password_is_required
    );
  }

  const user = await User.findById(req?.user?._id);
  const isPasswordMatch = await user.isPasswordCorrect(oldPassword);

  if (!IsTrue(isPasswordMatch)) {
    throw new ApiError(
      401,
      userModelMessages?.change_password?.change_password_msg
    );
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.change_password?.password_changed_successfully
      )
    );
});

const getLoggedUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.change_password?.password_changed_successfully,
        req.user
      )
    );
});

const updateDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;

  if (!HaveValue(email) && !HaveValue(fullName)) {
    throw new ApiError(400, userModelMessages?.update?.required_fields);
  }

  const dataToUpdate = {};

  if (HaveValue(email) && !IsTrue(validateEmail(email))) {
    throw new ApiError(400, userModelMessages?.register?.email_validation_msg);
  }

  dataToUpdate.email = email;

  if (HaveValue(fullName)) {
    dataToUpdate.fullName = fullName;
  }

  const updatedUSer = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: { ...GetObjectCopy(dataToUpdate) }
    },
    { updated: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, userModelMessages?.update?.user_updated, updatedUSer)
    );
});

const updateLoggedUserAvatar = asyncHandler(async (req, res) => {
  if (!IsDefined(req, "file")) {
    throw new ApiError(400, userModelMessages?.register?.avatar_file_required);
  }

  const localPathAvatar = req?.file?.path;

  const cloudinaryAvatarFile = await uploadFileOnCloudinary(localPathAvatar);

  if (!IsObjectHaveValues(cloudinaryAvatarFile)) {
    throw new ApiError(500, userModelMessages?.register?.failed_to_upload_file);
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        avatar: cloudinaryAvatarFile?.url
      }
    },
    { updated: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.update?.avatar_updated_successfully,
        { user }
      )
    );
});

const updateLoggedUserCoverImage = asyncHandler(async (req, res) => {
  if (!IsDefined(req, "file")) {
    throw new ApiError(
      400,
      userModelMessages?.register?.coverImage_file_required
    );
  }

  const localPathCoverImage = req?.file?.path;

  const cloudinaryCoverImageFile =
    await uploadFileOnCloudinary(localPathCoverImage);

  if (!IsObjectHaveValues(cloudinaryCoverImageFile)) {
    throw new ApiError(500, userModelMessages?.register?.failed_to_upload_file);
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        coverImage: cloudinaryCoverImageFile?.url
      }
    },
    { updated: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.update?.cover_image_updated_successfully,
        { user }
      )
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!HaveValue(username)) {
    throw new ApiError(400, userModelMessages?.register?.username_required);
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribedToCount: {
          $size: "$subscribedTo"
        },
        subscribersCount: {
          $size: "$subscribers"
        },
        isChannelSubscribed: {
          $cond: {
            if: { $in: [req?.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $channel: {
        username: 1,
        fullName: 1,
        email: 1,
        coverImage: 1,
        avatar: 1,
        subscribedToCount: 1,
        subscribersCount: 1,
        isChannelSubscribed: 1,
        createdAt: 1
      }
    }
  ]);

  if (!ArrayHaveValues(channel)) {
    throw new ApiError(404, userModelMessages?.channel?.channel_not_found);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.channel?.channel_details_fetched,
        channel[0]
      )
    );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req?.user?._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: owner
            }
          },
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1
            }
          },
          {
            addFields: {
              owner: {
                $first: "owner"
              }
            }
          }
        ]
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.watch_history?.watch_history_msg,
        user.watchHistory[0]
      )
    );
});

export {
  userRegister,
  loginUser,
  generateAccessAndRefreshTokens,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getLoggedUser,
  updateDetails,
  updateLoggedUserAvatar,
  updateLoggedUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory
};
