const Response = require("../middlewares/response");
const UserService = require("../services/userService");

async function registerClientUser(req, res) {
  try {
    const user = await UserService.registerClientUser(req.body);
    return Response.success(res, "User created successfully", user);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserService.loginByEmailPassword(email, password);
    return Response.success(res, "User logged in successfully", user);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function loginForSuperAdmin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserService.loginForSuperAdmin(email, password);
    return Response.success(res, "User logged in successfully", user);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function updatePassword(req, res) {
  try {
    const user = req.body;
    const updatedUser = await UserService.updatePassword(user);
    return Response.success(res, "Password updated successfully", updatedUser);
  } catch (error) {
    return Response.error(res, error);
  }
}
async function resetPassword(req, res) {
  try {
    const user = req.body;
    const updatedUser = await UserService.resetPassword(user);
    return Response.success(res, "OTP Sent", updatedUser);
  } catch (error) {
    return Response.error(res, error);
  }
}
async function verifyOtp(req, res) {
  try {
    const user = req.body;
    const updatedUser = await UserService.verifyOtp(user);
    return Response.success(res, "OTP verified", updatedUser);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function changePassword(req, res) {
  try {
    const user = req.body;
    const updatedUser = await UserService.changePassword(user);
    return Response.success(res, "Password Changed successfully", updatedUser);
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  login,
  registerClientUser,
  updatePassword,
  resetPassword,
  verifyOtp,
  changePassword,
  loginForSuperAdmin,
};
