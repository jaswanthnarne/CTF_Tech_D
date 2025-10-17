import api from './api';

export const submissionAPI = {
  // Submit with screenshot - CORRECTED URL
  submitWithScreenshot: (ctfId, formData) => 
    api.post(`/ctfs/${ctfId}/submit-with-screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Edit submission screenshot - CORRECTED URL
  editSubmissionScreenshot: (submissionId, formData) =>
    api.put(`/submissions/${submissionId}/screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Get user's submission for a CTF - CORRECTED URL
  getMySubmission: (ctfId) => 
    api.get(`/ctfs/${ctfId}/my-submission`),
};