import api from './api';

export const ctfAPI = {
  // Public endpoints
  getPublicCTFs: (params) => api.get('/ctfs', { params }),
  getCTFDetail: (id) => api.get(`/ctfs/${id}`),
  getGlobalLeaderboard: (params) => api.get('/leaderboard/global', { params }),
  
  // Protected endpoints (for both admin and students)
  getCTFChallenges: (id) => api.get(`/ctfs/${id}/challenges`),
  getCTFLeaderboard: (id) => api.get(`/ctfs/${id}/leaderboard`),
};