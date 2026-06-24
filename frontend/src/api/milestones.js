import api from './axios';

export const submitEvidence = (milestoneId, evidenceData) => {
  return api.post(`/milestones/${milestoneId}/submit`, evidenceData);
};

export const staffApproveMilestone = (milestoneId, feedback) => {
  return api.post(`/milestones/${milestoneId}/approve`, { feedback });
};

export const staffRejectMilestone = (milestoneId, feedback) => {
  return api.post(`/milestones/${milestoneId}/reject`, { feedback });
};
