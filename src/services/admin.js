import api from './api';

// Auth endpoints
export const adminAuth = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  getProfile: () => api.get('/admin/profile'),
  registerFirstAdmin: (data) => api.post('/admin/register-first-admin', data),
};

// User management
export const userAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users/create', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  getLoginHistory: (id) => api.get(`/admin/users/${id}/login-history`),
  exportUsers: () => api.get('/admin/export/users', { responseType: 'blob' }),
};

// CTF management
export const ctfAPI = {
  // Basic CRUD operations
  getAllCTFs: (params) => api.get('/admin/ctfs', { params }),
  getCTF: (id) => api.get(`/admin/ctfs/${id}`),
  createCTF: (data) => api.post('/admin/ctfs/create', data),
  updateCTF: (id, data) => api.put(`/admin/ctfs/${id}`, data),
  deleteCTF: (id) => api.delete(`/admin/ctfs/${id}`),
  
  // Publishing controls
  publishCTF: (ctfId) => api.post(`/admin/ctfs/${ctfId}/publish`),
  unpublishCTF: (ctfId) => api.post(`/admin/ctfs/${ctfId}/unpublish`),
  
  // Enhanced status controls
  toggleActivation: (ctfId) => api.put(`/admin/ctfs/${ctfId}/toggle-activation`),
  forceStatus: (ctfId, status) => api.put(`/admin/ctfs/${ctfId}/force-status`, { status }),
  bulkUpdateStatus: (ctfIds, status) => api.post('/admin/ctfs/bulk-status-update', { ctfIds, status }),
  
  // IST Status Management
  recalculateStatusesIST: () => api.post('/admin/ctfs/recalculate-statuses-ist'),
  updateAllStatuses: () => api.post('/admin/update-ctf-statuses'),
  
  // Analytics and participants
  getCTFParticipants: (id, params) => api.get(`/admin/ctfs/${id}/participants`, { params }),
  getCTFAnalytics: (id) => api.get(`/admin/ctf-analytics/${id}`),
  
  // Export features
  exportCTFs: () => api.get('/admin/export/ctfs', { responseType: 'blob' }),
  exportCTFSubmissions: (ctfId) => api.get(`/admin/export/ctfs/${ctfId}/submissions`, { responseType: 'blob' }),
  exportCTFParticipants: (ctfId) => api.get(`/admin/export/ctfs/${ctfId}/participants`, { responseType: 'blob' }),
};

// Analytics - Updated with submission analytics endpoints
export const analyticsAPI = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getComprehensiveAnalytics: (params) => api.get('/admin/analytics/comprehensive', { params }),
  getSubmissionAnalytics: (params) => api.get('/admin/analytics/submissions', { params }),
  getSubmissionStats: (params) => api.get('/admin/submissions/stats', { params }),
  updateCTFStatuses: () => api.post('/admin/update-ctf-statuses'),
  getRecentLogins: (params) => api.get('/admin/recent-logins', { params }),
  getRecentActivity: (params) => api.get('/admin/analytics/recent-activity', { params }),
};

// System
export const systemAPI = {
  getSystemHealth: () => api.get('/admin/system-health'),
  getSystemConfig: () => api.get('/admin/system/config'),
  bulkActivateUsers: (userIds) => api.post('/admin/bulk/users/activate', { userIds }),
  bulkDeactivateUsers: (userIds) => api.post('/admin/bulk/users/deactivate', { userIds }),
};

// Submissions
export const submissionAdminAPI = {
  getPendingSubmissions: (params) => api.get('/admin/submissions/pending', { params }),
  getAllSubmissions: (params) => api.get('/admin/submissions', { params }),
  getSubmission: (submissionId) => api.get(`/admin/submissions/${submissionId}`),
  getSubmissionScreenshot: (submissionId) => api.get(`/admin/submissions/${submissionId}/screenshot`),
  getUserSubmissions: (userId, params) => api.get(`/admin/users/${userId}/submissions`, { params }),
  approveSubmission: (submissionId, data) => api.post(`/admin/submissions/${submissionId}/approve`, data),
  rejectSubmission: (submissionId, data) => api.post(`/admin/submissions/${submissionId}/reject`, data),
  getSubmissionStats: (params) => api.get('/admin/submissions/stats', { params }),
  exportSubmissions: (ctfId) => api.get(`/admin/export/ctfs/${ctfId}/submissions`, { responseType: 'blob' }),
  exportParticipants: (ctfId) => api.get(`/admin/export/ctfs/${ctfId}/participants`, { responseType: 'blob' }),
};