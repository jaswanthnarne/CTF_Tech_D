import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import UserForm from '../../components/forms/UserFrom'
import { userAPI, submissionAdminAPI } from '../../services/admin';
import { 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Shield,
  FileText,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Target,
  User,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced function to fetch user submissions and calculate stats
 // Replace the fetchUserSubmissions function with better error handling
const fetchUserSubmissions = async (userId) => {
  try {
    setSubmissionsLoading(true);
    
    // Use getAllSubmissions with user filter instead of getUserSubmissions
    const response = await submissionAdminAPI.getAllSubmissions({ 
      userId, 
      limit: 100 
    });
    
    const submissions = response.data.submissions || [];
    const user = users.find(u => u._id === userId); // Get user from existing data
    
    setUserSubmissions(submissions);
    setSelectedUser(user);
    
    // Calculate user statistics
    const stats = calculateUserStats(submissions, user);
    setUserStats(stats);
  } catch (error) {
    console.error('Failed to fetch user submissions:', error);
    toast.error('Failed to fetch user submissions');
    // Fallback: filter from existing submissions data if available
    const userSubs = userSubmissions.filter(sub => sub.user?._id === userId);
    if (userSubs.length > 0) {
      setUserSubmissions(userSubs);
      const stats = calculateUserStats(userSubs, selectedUser);
      setUserStats(stats);
    }
  } finally {
    setSubmissionsLoading(false);
  }
};

// Fix CSV export to handle special characters
const exportUserSubmissions = () => {
  if (!selectedUser || userSubmissions.length === 0) return;
  
  try {
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    const headers = ['CTF Title', 'Category', 'Submitted At', 'Status', 'Points', 'Flag', 'Screenshot URL', 'Attempt Number', 'Reviewed By', 'Reviewed At', 'Admin Feedback'];
    
    const csvContent = [
      headers.join(','),
      ...userSubmissions.map(sub => [
        escapeCsv(sub.ctf?.title),
        escapeCsv(sub.ctf?.category),
        escapeCsv(new Date(sub.submittedAt).toLocaleString()),
        escapeCsv(sub.submissionStatus),
        escapeCsv(sub.points || 0),
        escapeCsv(sub.flag),
        escapeCsv(sub.screenshot?.url),
        escapeCsv(sub.attemptNumber || 1),
        escapeCsv(sub.reviewedBy?.fullName),
        escapeCsv(sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleString() : ''),
        escapeCsv(sub.adminFeedback)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedUser.fullName.replace(/[^a-z0-9]/gi, '_')}-submissions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Submissions exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export submissions');
  }
};

  // Calculate user statistics from submissions
  const calculateUserStats = (submissions, user) => {
    const totalSubmissions = submissions.length;
    const approvedSubmissions = submissions.filter(sub => sub.submissionStatus === 'approved').length;
    const pendingSubmissions = submissions.filter(sub => sub.submissionStatus === 'pending').length;
    const rejectedSubmissions = submissions.filter(sub => sub.submissionStatus === 'rejected').length;
    
    const totalPoints = submissions.reduce((sum, sub) => sum + (sub.points || 0), 0);
    const averagePoints = totalSubmissions > 0 ? Math.round(totalPoints / totalSubmissions) : 0;
    const successRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;
    
    // Find recent activity
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5);

    return {
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
      rejectedSubmissions,
      totalPoints,
      averagePoints,
      successRate,
      recentSubmissions,
      user
    };
  };

  const handleCreateUser = async (data) => {
    try {
      setActionLoading(true);
      await userAPI.createUser(data);
      toast.success('User created successfully');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (data) => {
    try {
      setActionLoading(true);
      await userAPI.updateUser(editingUser._id, data);
      toast.success('User updated successfully');
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userAPI.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleResetPassword = async (id) => {
    if (!confirm('Reset password for this user? They will receive an email with temporary password.')) return;
    
    try {
      const response = await userAPI.resetPassword(id);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const closeSubmissionsModal = () => {
    setSelectedUser(null);
    setUserSubmissions([]);
    setUserStats(null);
  };

  const toggleRowExpansion = (userId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const getRoleBadge = (role) => {
    const isAdmin = role === 'admin';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isAdmin 
          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
          : 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        <Shield className={`h-3 w-3 mr-1 ${isAdmin ? 'text-purple-600' : 'text-gray-600'}`} />
        {isAdmin ? 'Admin' : 'Student'}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isActive 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-red-100 text-red-800 border-red-200'
      }`}>
        {isActive ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </>
        )}
      </span>
    );
  };

  const getSubmissionStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Rejected' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats for summary
  const stats = {
    total: users.length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length,
    admins: users.filter(user => user.role === 'admin').length,
    students: users.filter(user => user.role === 'student').length,
    verified: users.filter(user => user.isVerified).length,
    totalSubmissions: users.reduce((total, user) => total + (user.submissionsCount || 0), 0),
  };

  return (
    <Layout title="User Management" subtitle="Manage platform users and their access">
      {/* Header Actions */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage user accounts, permissions, and access</p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <Card.Content className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button 
                variant="outline" 
                onClick={fetchUsers}
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Users Table - Desktop View */}
      <Card className="hidden lg:block border border-gray-200 shadow-sm">
        <Card.Content className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
                        <span className="ml-3 text-gray-600">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => toggleRowExpansion(user._id)}
                              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {expandedRows.has(user._id) ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <button
                                onClick={() => fetchUserSubmissions(user._id)}
                                className="text-left hover:text-blue-700 transition-colors group"
                              >
                                <div className="flex items-center space-x-3 mb-1">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-105 transition-transform">
                                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                      {user.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-500 group-hover:text-blue-600 truncate">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {user.contactNumber && (
                              <div className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                {user.contactNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            {user.specialization || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {user.expertiseLevel || 'Beginner'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(user.isActive)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            {user.lastLogin 
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-2 rounded-lg transition-colors border border-transparent hover:border-yellow-200 ${
                                user.isActive 
                                  ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" 
                                  : "text-green-600 hover:text-green-800 hover:bg-green-50"
                              }`}
                              title={user.isActive ? "Deactivate" : "Activate"}
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            
                            <button
                              onClick={() => handleResetPassword(user._id)}
                              className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                              title="Reset Password"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(user._id) && (
                        <tr className="bg-gray-50">
                          <td colSpan="8" className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                                <div className="space-y-1">
                                  <p><span className="text-gray-600">Semester:</span> {user.Sem || 'N/A'}</p>
                                  <p><span className="text-gray-600">Verified:</span> {user.isVerified ? 'Yes' : 'No'}</p>
                                  <p><span className="text-gray-600">Joined:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => fetchUserSubmissions(user._id)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors border border-purple-200"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    View Activity
                                  </button>
                                  <button
                                    onClick={() => handleResetPassword(user._id)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors border border-orange-200"
                                  >
                                    <Mail className="h-3 w-3 mr-1" />
                                    Reset Password
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first user'
                        }
                      </p>
                      <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* Mobile View - Cards */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <Card className="border border-gray-200 shadow-sm">
            <Card.Content className="p-6 text-center">
              <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading users...</p>
            </Card.Content>
          </Card>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow border border-gray-200">
              <Card.Content className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <button
                      onClick={() => fetchUserSubmissions(user._id)}
                      className="text-left hover:text-blue-700 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-105 transition-transform">
                          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 text-lg">
                            {user.fullName}
                          </h3>
                          <p className="text-sm text-gray-500 group-hover:text-blue-600 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMobileMenuOpen(mobileMenuOpen === user._id ? null : user._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {mobileMenuOpen === user._id && (
                      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48">
                        <button
                          onClick={() => {
                            openEditModal(user);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-t-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit User</span>
                        </button>
                        <button
                          onClick={() => {
                            handleToggleStatus(user);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                        <button
                          onClick={() => {
                            handleResetPassword(user._id);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Reset Password</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteUser(user._id);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-b-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete User</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    {getRoleBadge(user.role)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {getStatusBadge(user.isActive)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expertise</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {user.expertiseLevel}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Specialization</p>
                    <span className="text-xs text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                      {user.specialization || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </div>
                  {user.contactNumber && (
                    <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                      <Phone className="h-3 w-3 mr-1" />
                      {user.contactNumber}
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card className="border border-gray-200 shadow-sm">
            <Card.Content className="p-6 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first user'
                }
              </p>
              <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={closeModal}
          loading={actionLoading}
        />
      </Modal>

      {/* Enhanced User Submissions Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={closeSubmissionsModal}
        title={`${selectedUser?.fullName}'s Activity & Submissions`}
        size="4xl"
      >
        <div className="space-y-6">
          {/* User Profile Header */}
          {console.log("User data",selectedUser)}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {selectedUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser?.fullName}</h3>
                    <p className="text-gray-600">{selectedUser?.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300">
                        <User className="h-3 w-3 mr-1" />
                        {selectedUser?.role}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300">
                        <Award className="h-3 w-3 mr-1" />
                        {selectedUser?.expertiseLevel}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300">
                        {selectedUser?.Sem}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300">
                        {selectedUser?.contactNumber || 'No Contact'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300">
                        {selectedUser?.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300">
                        {selectedUser?.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {userStats?.totalPoints || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Statistics Cards */}
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Card.Content className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-bold text-gray-900">{userStats.totalSubmissions}</span>
                  </div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </Card.Content>
              </Card>

              <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Card.Content className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-bold text-gray-900">{userStats.approvedSubmissions}</span>
                  </div>
                  <div className="text-sm text-gray-600">Approved</div>
                </Card.Content>
              </Card>

              <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Card.Content className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-lg font-bold text-gray-900">{userStats.successRate}%</span>
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </Card.Content>
              </Card>

              <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Card.Content className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span className="text-lg font-bold text-gray-900">{userStats.averagePoints}</span>
                  </div>
                  <div className="text-sm text-gray-600">Avg Points</div>
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Submissions Table */}
          <Card className="border border-gray-200">
            <Card.Header className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Submission History</h4>
                {userSubmissions.length > 0 && (
                  <Button
                    onClick={exportUserSubmissions}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 border-gray-300"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Content className="p-0">
              {submissionsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
                  <span className="ml-3 text-gray-600">Loading submissions...</span>
                </div>
              ) : userSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CTF Challenge
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Flag
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Evidence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userSubmissions.map((submission) => (
                        <tr 
                          key={submission._id} 
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.ctf?.title || 'Unknown CTF'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.ctf?.category || 'No category'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(submission.submittedAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getSubmissionStatusBadge(submission.submissionStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                              submission.points > 0 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {submission.points || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono border border-gray-200">
                              {submission.flag}
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {submission.screenshot?.url ? (
                              <a
                                href={submission.screenshot.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Screenshot
                              </a>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 text-sm text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                                <FileText className="h-4 w-4 mr-1" />
                                No screenshot
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {selectedUser?.fullName} hasn't made any submissions yet. 
                    Their submission history will appear here once they start participating in CTF challenges.
                  </p>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Modal Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button 
              onClick={closeSubmissionsModal} 
              variant="outline" 
              className="border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default UserManagement;