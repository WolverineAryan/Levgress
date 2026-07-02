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

export const getMasterSkills = () => {
  return api.get('/students/skills/master');
};

export const addSkill = (name, category) => {
  return api.post('/students/skills', { name, category });
};

export const deleteSkill = (name) => {
  return api.delete('/students/skills', { data: { name } });
};

export const getMyBadges = () => {
  return api.get('/students/badges');
};

export const getAIInsights = () => {
  return api.get('/students/ai-insights');
};

export const getStaffDashboard = (params = {}) => {
  return api.get('/students/staff-dashboard', { params });
};

export const getStudentProfile = (id) => {
  return api.get(`/students/profile/${id}`);
};

export const generateSkillQuestions = (skillName, tier) => {
  return api.get('/students/skills/test/generate', { params: { skillName, tier } });
};

export const submitSkillTest = (skillName, tier, passed) => {
  return api.post('/students/skills/test/submit', { skillName, tier, passed });
};

export const getAllStudents = (params = {}) => {
  return api.get('/students/roster', { params });
};

export const getStudentDetailedProfile = (id) => {
  return api.get(`/students/roster/${id}`);
};

export const getCohortAnalytics = (params = {}) => {
  return api.get('/students/cohort-analytics', { params });
};
