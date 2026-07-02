const authService = require('../services/auth.service');
const asyncHandler = require('../middleware/asyncHandler');
const { ForbiddenError } = require('../utils/AppError');

const register = asyncHandler(async (req, res) => {
  throw new ForbiddenError('Local registration is disabled. Please use Google or GitHub sign-up.');
});

const login = asyncHandler(async (req, res) => {
  throw new ForbiddenError('Local login is disabled. Please use Google or GitHub sign-in.');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;
  const result = await authService.firebaseLogin(idToken, role);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const onboard = asyncHandler(async (req, res) => {
  const user = await authService.onboardUser(req.user._id, req.body);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const checkUsername = asyncHandler(async (req, res) => {
  const result = await authService.checkUsernameAvailability(req.params.username);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.updatePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const toggle2FA = asyncHandler(async (req, res) => {
  const result = await authService.toggle2FA(req.user._id);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await authService.verify2FA(req.user._id, token);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteAccount(req.user._id);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const reportIssue = asyncHandler(async (req, res) => {
  const { category, description } = req.body;
  const report = await authService.reportIssue(req.user._id, category, description);
  res.status(201).json({
    status: 'success',
    data: { report },
  });
});

module.exports = {
  register,
  login,
  getMe,
  firebaseLogin,
  onboard,
  updateProfile,
  checkUsername,
  updatePassword,
  toggle2FA,
  verify2FA,
  deleteAccount,
  reportIssue,
};
