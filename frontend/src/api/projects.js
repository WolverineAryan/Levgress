import api from './axios';

export const createProject = (projectData) => {
  return api.post('/projects', projectData);
};

export const getMyProjects = () => {
  return api.get('/projects/my-projects');
};

export const getProjectById = (id) => {
  return api.get(`/projects/${id}`);
};

export const updateProject = (id, projectData) => {
  return api.put(`/projects/${id}`, projectData);
};

export const deleteProject = (id) => {
  return api.delete(`/projects/${id}`);
};

export const addComment = (projectId, text, parent = null) => {
  return api.post(`/projects/${projectId}/comments`, { text, parent });
};

export const getComments = (projectId) => {
  return api.get(`/projects/${projectId}/comments`);
};

export const getAllProjects = (params = {}) => {
  return api.get('/projects', { params });
};

export const likeProject = (id) => {
  return api.post(`/projects/${id}/like`);
};
