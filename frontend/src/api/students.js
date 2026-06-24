import api from './axios';

export const getStudentDashboard = () => {
  return api.get('/students/dashboard');
};

export const getLeaderboard = () => {
  return api.get('/students/leaderboard');
};

export const getMySkills = () => {
  return api.get('/students/skills');
};

export const addSkill = (name, category) => {
  return api.post('/students/skills', { name, category });
};

export const getMyBadges = () => {
  return api.get('/students/badges');
};

export const getAIInsights = () => {
  return api.get('/students/ai-insights');
};

export const getStaffDashboard = () => {
  return api.get('/students/staff-dashboard');
};
