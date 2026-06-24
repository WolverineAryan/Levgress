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
