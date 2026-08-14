import api from './axios';

export const createCertificate = (certificateData) => {
  return api.post('/certificates', certificateData);
};

export const getMyCertificates = () => {
  return api.get('/certificates/my-certificates');
};

export const getCertificateById = (id) => {
  return api.get(`/certificates/${id}`);
};

export const updateCertificate = (id, certificateData) => {
  return api.put(`/certificates/${id}`, certificateData);
};

export const deleteCertificate = (id) => {
  return api.delete(`/certificates/${id}`);
};

export const getAllCertificates = (params = {}) => {
  return api.get('/certificates', { params });
};

export const reviewCertificate = (id, status, feedback = '') => {
  return api.patch(`/certificates/${id}/review`, { status, feedback });
};
