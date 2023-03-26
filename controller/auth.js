const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const CustomError = require("../helpers/error/CustomError");
const { sendJwtToClient } = require("../helpers/auth/tokenHelpser");
const {
  validateUserInput,
  comparePassword,
} = require("../helpers/input/inputHelpser");
const sendEmail = require("../helpers/libraries/sendEmail");

// Register
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
  });

  sendJwtToClient(user, res);
});

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!validateUserInput(email, password)) {
    return next(new CustomError("Please check your inputs", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Please check your credentials", 400));
  }
  sendJwtToClient(user, res);
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const resetEmail = req.body.email;

  const user = await User.findOne({ email: resetEmail });

  if (!user) {
    return next(new CustomError("There is no user with that email", 400));
  }
  const resetPasswordToken = user.getResetPasswordTokenFromUser();

  await user.save();

  const resePasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

  const emailTemplate = `
  <h3>Reset Your Password</h3>
  <p> This is <a href ='${resePasswordUrl}' target='_blank'>Link</a> will expire 1 hour </p>
  `;
  try {
    await sendEmail({
      from: process.env.SMTP_USER,
      to: resetEmail,
      subject: "Reset Your Password",
      html: emailTemplate,
    });
    return res.status(200).json({
      success: true,
      message: "Token Sent To Your Email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(CustomError("Email Could Not Be Sent", 500));
  }
});
// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.query;
  const { password } = req.body;

  if (!resetPasswordToken) {
    return next(new CustomError("Please provide a valid token", 400));
  }
  let user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Invalid token or session expired", 404));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Reset password process succesful",
  });
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
