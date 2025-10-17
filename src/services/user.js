import api from './api';

// Student CTF endpoints
export const userCTFAPI = {
  // CTF listing and details
  getAllCTFs: (params) => api.get('/ctfs', { params }),
  getCTF: (id) => api.get(`/ctfs/${id}`),
  getAvailableCTFs: (params) => api.get('/user/ctfs/available', { params }),
  
  // CTF participation
  joinCTF: (id) => api.post(`/ctfs/${id}/join`),
  submitFlag: (id, data) => api.post(`/ctfs/${id}/submit`, data),
  getProgress: (id) => api.get(`/ctfs/${id}/progress`),
  checkJoined: (id) => api.get(`/ctfs/${id}/joined`),
  getJoinedCTFs: (params) => api.get('/user/ctfs/joined', { params }),
  
  // Leaderboards
  getLeaderboard: (id) => api.get(`/ctfs/${id}/leaderboard`),
  getGlobalLeaderboard: (params) => api.get('/leaderboard/global', { params }),
  
  // Submissions
  getMySubmission: (ctfId) => api.get(`/ctfs/${ctfId}/my-submission`),
  getMySubmissions: (params = {}) => api.get('/user/my-submissions', { params }),
};

// Student profile and stats
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  getDashboard: () => api.get('/user/dashboard'),
  getStats: () => api.get('/user/stats'),
  getRanking: () => api.get('/user/ranking'),
};