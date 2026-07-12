import api from './axios';

export const createPost = (text, projectId = null) => {
  return api.post('/posts', { text, projectId });
};

export const getAllPosts = () => {
  return api.get('/posts');
};

export const likePost = (id) => {
  return api.post(`/posts/${id}/like`);
};

export const addComment = (postId, text) => {
  return api.post(`/posts/${postId}/comments`, { text });
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`);
};
