import axios from './axios';

export const getAnnouncements = async () => {
  return await axios.get('/announcements');
};

export const createAnnouncement = async (data) => {
  return await axios.post('/announcements', data);
};

export const deleteAnnouncement = async (id) => {
  return await axios.delete(`/announcements/${id}`);
};

export const toggleApplyAnnouncement = async (id) => {
  return await axios.post(`/announcements/${id}/toggle-apply`);
};

export const getAnnouncementApplicants = async (id) => {
  return await axios.get(`/announcements/${id}/applicants`);
};
