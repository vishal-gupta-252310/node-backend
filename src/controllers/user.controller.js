// service and model
import { userModelMessages } from "../config/errors.config.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/FileUploadWithCloudinary.js";
import {
  ArrayHaveValues,
  HaveValue,
  IsDefined,
  IsTrue,
  validateEmail
} from "../utils/Helper.js";

const userRegister = asyncHandler(async (req, res) => {
  // 1. to get the data from request body
  const { username, email, fullName, password } = req.body;

  // 2. validations not empty
  if (
    [username, email, fullName, password].some((field) => !HaveValue(field))
  ) {
    throw new ApiError(400, userModelMessages?.all_fields_required);
  }
  // 3. check email and username is already exist or not if exist throw user exist error
  const userExisted = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (userExisted) {
    throw new ApiError(409, userModelMessages?.user_already_exist);
  }

  if (!IsTrue(validateEmail(email))) {
    throw new ApiError(400, userModelMessages?.email_validation_msg);
  }

  // 3. check for images, check for profile_pic
  const avatarLocalPath = req?.files?.avatar[0]?.path;

  if (!HaveValue(avatarLocalPath)) {
    throw new ApiError(400, userModelMessages?.avatar_file_required);
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
    throw new ApiError(400, userModelMessages?.failed_to_upload_file);
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
    new ApiError(500, userModelMessages?.failed_to_create_user);
  }

  // 6. check user created if create then return res
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        userModelMessages?.user_created_successfully,
        createdUser
      )
    );
});

export { userRegister };
