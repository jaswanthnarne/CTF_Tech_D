// Student CTF endpoints - CORRECTED#
import api from './api';
export const userCTFAPI = {
  // CTF listing and details
  getAllCTFs: (params) => api.get('/ctfs', { params }),
  getCTF: (id) => api.get(`/ctfs/${id}`),
  getAvailableCTFs: (params) => api.get('/user/ctfs/available', { params }), // ✅ CORRECT
  
  // CTF participation
  joinCTF: (id) => api.post(`/user/ctfs/${id}/join`), // ✅ CORRECT
  submitFlag: (id, data) => api.post(`/ctfs/${id}/submit`, data), // ✅ CORRECT
  getProgress: (id) => api.get(`/user/ctfs/${id}/progress`), // ✅ CORRECT
  checkJoined: (id) => api.get(`/user/ctfs/${id}/joined`), // ✅ CORRECT
  getJoinedCTFs: (params) => api.get('/user/ctfs/joined', { params }), // ✅ CORRECT
  
  // Leaderboards
  getLeaderboard: (id) => api.get(`/ctfs/${id}/leaderboard`), // ✅ CORRECT
  getGlobalLeaderboard: (params) => api.get('/leaderboard/global', { params }), // ✅ CORRECT
  
  // Submissions
  getMySubmission: (ctfId) => api.get(`/user/ctfs/${ctfId}/my-submission`), // ✅ CORRECT
  getMySubmissions: (params = {}) => api.get('/user/my-submissions', { params }), // ✅ CORRECT
};

// Student profile and stats - CORRECTED
export const userAPI = {
  getProfile: () => api.get('/user/profile'), // ✅ CORRECT
  updateProfile: (data) => api.patch('/user/profile', data), // ✅ CORRECT
  getDashboard: () => api.get('/user/dashboard'), // ✅ CORRECT
  getStats: () => api.get('/user/stats'), // ✅ CORRECT
  getRanking: () => api.get('/user/ranking'), // ✅ CORRECT
};