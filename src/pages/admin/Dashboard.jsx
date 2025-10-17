import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

import { 
  Users, 
  Flag, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  LogIn,
  UserCheck,
  Activity,
  Eye,
  EyeOff,
  PlayCircle,
  PauseCircle,
  RefreshCw
} from 'lucide-react';
import { analyticsAPI, ctfAPI, userAPI } from '../../services/admin';
import toast from 'react-hot-toast';

// StatCard is your custom component - NOT from lucide-react
const StatCard = ({ title, value, description, icon: Icon, color = 'blue', onClick, clickable = false }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
  };

  const cardClasses = `p-4 sm:p-6 min-h-[120px] flex flex-col justify-center ${
    clickable ? 'cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1' : ''
  }`;

  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-2 sm:p-3 rounded-lg ${colors[color]}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="ml-3 sm:ml-4 flex-1 min-w-0">
            <dl>
              <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg sm:text-xl font-bold text-gray-900">{value}</div>
                {description && (
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                    {description}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        {clickable && (
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
        )}
      </div>
      {description && (
        <div className="sm:hidden mt-2">
          <div className="text-xs text-gray-500">
            {description}
          </div>
        </div>
      )}
    </Card>
  );
};

// Recent Login Card Component
const RecentLoginCard = ({ user, index }) => {
  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      superadmin: 'bg-red-100 text-red-800',
      student: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.fullName || 'Unknown User'}
          </p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)} mt-1 sm:mt-0`}>
            {user?.role || 'user'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email || 'No email'}</p>
        <p className="text-xs text-gray-400 mt-1">
          Last login: {getTimeAgo(user?.lastLogin)}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user?.isActive)}`}>
          {user?.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

// Fixed Recent Activity Card Component
const RecentActivityCard = ({ activity, index }) => {
  // Safe type handling with default
  const activityType = activity?.type || 'unknown';
  const isCorrect = activity?.isCorrect || false;

  const getActivityIcon = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 
        <CheckCircle className="h-4 w-4 text-green-600" /> : 
        <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (type === 'ctf_published') {
      return <Eye className="h-4 w-4 text-blue-600" />;
    } else if (type === 'ctf_unpublished') {
      return <EyeOff className="h-4 w-4 text-yellow-600" />;
    } else if (type === 'ctf_activated') {
      return <PlayCircle className="h-4 w-4 text-green-600" />;
    } else if (type === 'ctf_deactivated') {
      return <PauseCircle className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getActivityMessage = (activity) => {
    const type = activity?.type || 'unknown';
    
    if (type === 'submission') {
      return `${activity.user?.fullName || 'Unknown user'} submitted to ${activity.ctf?.title || 'Unknown CTF'}`;
    } else if (type === 'ctf_published') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was published`;
    } else if (type === 'ctf_unpublished') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was unpublished`;
    } else if (type === 'ctf_activated') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was activated`;
    } else if (type === 'ctf_deactivated') {
      return `CTF "${activity.ctfTitle || 'Unknown CTF'}" was deactivated`;
    } else if (type === 'login') {
      return `${activity.user?.fullName || 'Unknown user'} logged in`;
    }
    return 'Unknown activity';
  };

  const getActivityStatus = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 'Solved' : 'Failed';
    } else if (type.startsWith('ctf_')) {
      return type.replace('ctf_', '').charAt(0).toUpperCase() + type.replace('ctf_', '').slice(1);
    } else if (type === 'login') {
      return 'Login';
    }
    return 'Activity';
  };

  const getStatusColor = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else if (type.startsWith('ctf_')) {
      return 'bg-blue-100 text-blue-800';
    } else if (type === 'login') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getIconColor = (type, isCorrect) => {
    if (type === 'submission') {
      return isCorrect ? 'bg-green-100' : 'bg-red-100';
    } else if (type.startsWith('ctf_')) {
      return 'bg-blue-100';
    } else if (type === 'login') {
      return 'bg-purple-100';
    }
    return 'bg-gray-100';
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className={`p-2 rounded-full ${getIconColor(activityType, isCorrect)}`}>
          {getActivityIcon(activityType, isCorrect)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getActivityMessage(activity)}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(activity?.timestamp || activity?.submittedAt || Date.now()).toLocaleString()}
        </p>
        {activity?.points && (
          <p className="text-xs text-gray-400">
            {isCorrect ? `+${activity.points} points` : 'No points awarded'}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activityType, isCorrect)}`}>
          {getActivityStatus(activityType, isCorrect)}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [comprehensiveAnalytics, setComprehensiveAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [ctfStatus, setCtfStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ctfs, setCtfs] = useState([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setRefreshLoading(true);
      
      // Fetch comprehensive analytics for real-time data
      const [statsResponse, analyticsResponse, loginsResponse, ctfsResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getComprehensiveAnalytics({ timeRange: '24h' }),
        analyticsAPI.getRecentLogins({ limit: 8 }),
        ctfAPI.getAllCTFs({ limit: 50, page: 1 })
      ]);
      
      const { stats, recentActivity } = statsResponse.data;
      const { analytics } = analyticsResponse.data;
      
      // Calculate real-time CTF status from actual CTF data
      const currentTime = new Date();
      const ctfStatusBreakdown = {
        active: { count: 0 },
        upcoming: { count: 0 },
        ended: { count: 0 },
        inactive: { count: 0 }
      };

      ctfsResponse.data.ctfs.forEach(ctf => {
        const startDate = new Date(ctf.schedule?.startDate);
        const endDate = new Date(ctf.schedule?.endDate);
        
        if (ctf.status === 'active') {
          if (currentTime >= startDate && currentTime <= endDate) {
            ctfStatusBreakdown.active.count++;
          } else if (currentTime < startDate) {
            ctfStatusBreakdown.upcoming.count++;
          } else {
            ctfStatusBreakdown.ended.count++;
          }
        } else {
          ctfStatusBreakdown.inactive.count++;
        }
      });

      // Ensure recentActivity has proper types
      const safeRecentActivity = Array.isArray(recentActivity) 
        ? recentActivity.map(activity => ({
            ...activity,
            type: activity.type || 'unknown',
            isCorrect: activity.isCorrect || false
          }))
        : [];
      
      setStats(stats || {});
      setComprehensiveAnalytics(analytics || {});
      setRecentActivity(safeRecentActivity);
      setRecentLogins(loginsResponse.data?.recentLogins || []);
      setCtfStatus(ctfStatusBreakdown);
      setCtfs(ctfsResponse.data.ctfs || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      
      // Set safe defaults on error
      setStats({});
      setComprehensiveAnalytics({});
      setRecentActivity([]);
      setRecentLogins([]);
      setCtfStatus({});
      setCtfs([]);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshLoading(true);
    await fetchDashboardData();
    toast.success('Dashboard updated with real-time data!');
  };

  // Calculate real-time statistics
  const calculateRealTimeStats = () => {
    if (!stats && !comprehensiveAnalytics) return null;

    const totalSubmissions = stats?.totalSubmissions || 0;
    const correctSubmissions = stats?.correctSubmissions || 0;
    const successRate = totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0;

    // Calculate real-time changes from analytics
    const submissionStats = comprehensiveAnalytics?.submissions;
    const userStats = comprehensiveAnalytics?.users;
    
    return {
      // User Statistics
      totalUsers: stats?.totalUsers || 0,
      activeUsers: stats?.activeUsers || 0,
      newUsersToday: stats?.newUsersToday || 0,
      
      // CTF Statistics
      totalCTFs: stats?.totalCTFs || 0,
      publishedCTFs: stats?.publishedCTFs || 0,
      visibleCTFs: stats?.visibleCTFs || 0,
      
      // Submission Statistics
      totalSubmissions,
      correctSubmissions,
      pendingSubmissions: stats?.pendingSubmissions || 0,
      successRate,
      
      // Real-time CTF Status
      activeCTFs: ctfStatus.active?.count || 0,
      upcomingCTFs: ctfStatus.upcoming?.count || 0,
      endedCTFs: ctfStatus.ended?.count || 0,
      inactiveCTFs: ctfStatus.inactive?.count || 0,
      
      // Currently active CTFs (real-time calculation)
      currentlyRunningCTFs: ctfs.filter(ctf => {
        const now = new Date();
        const start = new Date(ctf.schedule?.startDate);
        const end = new Date(ctf.schedule?.endDate);
        return ctf.status === 'active' && now >= start && now <= end;
      }).length
    };
  };

  const realTimeStats = calculateRealTimeStats();

  // Navigation handlers
  const handleUsersClick = () => {
    navigate('/admin/users');
  };

  const handleCTFsClick = () => {
    navigate('/admin/ctfs');
  };

  const handleAnalyticsClick = () => {
    navigate('/admin/analytics');
  };

  const handleSubmissionsClick = () => {
    navigate('/admin/submissions');
  };

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Overview of your CTF platform">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Real-time overview of your CTF platform">
      {/* Header with Refresh Controls */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Platform Overview
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Real-time monitoring and analytics dashboard
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="autoRefresh" className="text-xs sm:text-sm text-gray-600">
                Auto-refresh (30s)
              </label>
            </div>
            <Button 
              variant="outline" 
              onClick={refreshData}
              loading={refreshLoading}
              className="flex items-center space-x-2 text-xs sm:text-sm px-3 py-2"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Refresh Data</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Users"
          value={realTimeStats.totalUsers}
          description={`${realTimeStats.activeUsers} active`}
          icon={Users}
          color="blue"
          onClick={handleUsersClick}
          clickable
        />
        <StatCard
          title="Total CTFs"
          value={realTimeStats.totalCTFs}
          description={`${realTimeStats.publishedCTFs} published`}
          icon={Flag}
          color="green"
          onClick={handleCTFsClick}
          clickable
        />
        <StatCard
          title="Success Rate"
          value={`${realTimeStats.successRate}%`}
          description={`${realTimeStats.correctSubmissions}/${realTimeStats.totalSubmissions}`}
          icon={TrendingUp}
          color="yellow"
          onClick={handleAnalyticsClick}
          clickable
        />
        <StatCard
          title="Active CTFs"
          value={realTimeStats.currentlyRunningCTFs}
          description={`${realTimeStats.upcomingCTFs} upcoming`}
          icon={Activity}
          color="red"
          onClick={handleCTFsClick}
          clickable
        />
      </div>

      {/* CTF Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-lg sm:text-xl font-bold text-green-700">{realTimeStats.activeCTFs}</div>
          <div className="text-xs sm:text-sm text-green-600">Active Now</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-lg sm:text-xl font-bold text-blue-700">{realTimeStats.upcomingCTFs}</div>
          <div className="text-xs sm:text-sm text-blue-600">Upcoming</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="text-lg sm:text-xl font-bold text-gray-700">{realTimeStats.endedCTFs}</div>
          <div className="text-xs sm:text-sm text-gray-600">Ended</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="text-lg sm:text-xl font-bold text-red-700">{realTimeStats.inactiveCTFs}</div>
          <div className="text-xs sm:text-sm text-red-600">Inactive</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Logins */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <LogIn className="h-5 w-5 mr-2 text-blue-600" />
                Recent Logins
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-500">
                  {recentLogins.length} users
                </span>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleUsersClick}>
                  View All
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentLogins.length > 0 ? (
                recentLogins.map((user, index) => (
                  <RecentLoginCard key={user._id || index} user={user} index={index} />
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <UserCheck className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <p className="mt-2 text-sm sm:text-base">No recent logins</p>
                  <p className="text-xs sm:text-sm mt-1">User login activity will appear here</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Recent Activity
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-500">
                  {recentActivity.length} activities
                </span>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleAnalyticsClick}>
                  View All
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <RecentActivityCard key={activity._id || index} activity={activity} index={index} />
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Clock className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <p className="mt-2 text-sm sm:text-base">No recent activity</p>
                  <p className="text-xs sm:text-sm mt-1">Platform activity will appear here</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/users')} className="flex flex-col items-center p-4 h-auto">
          <Users className="h-6 w-6 mb-2 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium">Manage Users</span>
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/ctfs')} className="flex flex-col items-center p-4 h-auto">
          <Flag className="h-6 w-6 mb-2 text-green-600" />
          <span className="text-xs sm:text-sm font-medium">Manage CTFs</span>
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/submissions')} className="flex flex-col items-center p-4 h-auto">
          <CheckCircle className="h-6 w-6 mb-2 text-yellow-600" />
          <span className="text-xs sm:text-sm font-medium">Submissions</span>
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/analytics')} className="flex flex-col items-center p-4 h-auto">
          <TrendingUp className="h-6 w-6 mb-2 text-purple-600" />
          <span className="text-xs sm:text-sm font-medium">Analytics</span>
        </Button>
      </div>
    </Layout>
  );
};

export default Dashboard;