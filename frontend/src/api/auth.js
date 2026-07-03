import api from './axios';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (name, email, password, role) => {
  return api.post('/auth/register', { name, email, password, role });
};

export const getMe = () => {
  return api.get('/auth/me');
};

export const onboard = (onboardingData) => {
  return api.put('/auth/onboard', onboardingData);
};

export const updateProfile = (profileData) => {
  return api.put('/auth/update-profile', profileData);
};

export const updatePassword = (passwords) => {
  return api.put('/auth/update-password', passwords);
};


export const deleteAccount = () => {
  return api.delete('/auth/delete-account');
};

export const reportIssue = (issueData) => {
  return api.post('/auth/report-issue', issueData);
};
