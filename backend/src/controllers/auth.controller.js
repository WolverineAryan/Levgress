const authService = require('../services/auth.service');
const asyncHandler = require('../middleware/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.status(200).json({
    status: 'success',
    data: result,
  });
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

const checkUsername = asyncHandler(async (req, res) => {
  const result = await authService.checkUsernameAvailability(req.params.username);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  register,
  login,
  getMe,
  firebaseLogin,
  onboard,
  checkUsername,
};
