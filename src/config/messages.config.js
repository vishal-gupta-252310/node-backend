export const userModelMessages = {
  register: {
    all_fields_required: "All Fields required.",
    user_already_exist: "User with email or username already exist.",
    avatar_file_required: "Avatar file is required.",
    coverImage_file_required: "Cover image is required.",
    failed_to_upload_file:
      "Failed to upload avatar file please try again after some time.",
    failed_to_create_user: "Something went wrong while registering the user.",
    user_created_successfully: "User Registered Successfully.",
    email_validation_msg: "Email is not valid please try with different email.",
    username_required: "Username is required."
  },
  login: {
    email_or_username_required: "Email or username required.",
    password_field_required: "Password is required.",
    user_not_exist: "User with email or username is not exist",
    password_incorrect:
      "Password is incorrect please try with valid credentials.",
    common_error_msg_server: "Something went wrong.",
    logged_successfully: "Logged successfully."
  },
  logout: {
    unauthorized_msg: "Unauthorized access",
    invalid_token: "Invalid token",
    user_not_exist: "User is not exist in records",
    logout_msg: "Logout successfully"
  },
  refreshToken: {
    access_token_refreshed: "Access token refreshed successfully",
    refresh_token_expired_or_use: "Refresh token expired or used."
  },
  change_password: {
    change_password_msg:
      "The existing password and entered password does not match.",
    both_password_is_required: "Old and new password both is required.",
    password_changed_successfully: "Your password changed successfully."
  },
  logged_user_msg: "Current user fetched successfully",
  update: {
    required_fields: "Please provide email or full name.",
    user_updated: "User updated successfully.",
    avatar_updated_successfully: "Avatar updated successfully",
    cover_image_updated_successfully: "Cover image updated successfully"
  },
  channel: {
    channel_not_found: "Channel does not exist.",
    channel_details_fetched: "Channel details fetched successfully."
  },
  watch_history: {
    watch_history_msg: "User watch history fetched successfully."
  }
};
