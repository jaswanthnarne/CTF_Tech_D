import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { analyticsAPI, ctfAPI, userAPI } from '../../services/admin';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  Flag, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Activity,
  Target,
  Award
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [realtimeStats, setRealtimeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    
    // Set up auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAnalytics, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      
      // Fetch comprehensive real-time data
      const [analyticsResponse, statsResponse, ctfsResponse] = await Promise.all([
        analyticsAPI.getComprehensiveAnalytics({ timeRange }),
        analyticsAPI.getDashboardStats(),
        ctfAPI.getAllCTFs({ limit: 100 })
      ]);

      const { analytics } = analyticsResponse.data;
      const { stats } = statsResponse.data;
      const ctfs = ctfsResponse.data.ctfs || [];

      // Calculate real-time CTF status
      const currentTime = new Date();
      const ctfStatusStats = {
        active: 0,
        upcoming: 0,
        ended: 0,
        inactive: 0
      };

      ctfs.forEach(ctf => {
        const startDate = new Date(ctf.schedule?.startDate);
        const endDate = new Date(ctf.schedule?.endDate);
        
        if (ctf.status === 'active') {
          if (currentTime >= startDate && currentTime <= endDate) {
            ctfStatusStats.active++;
          } else if (currentTime < startDate) {
            ctfStatusStats.upcoming++;
          } else {
            ctfStatusStats.ended++;
          }
        } else {
          ctfStatusStats.inactive++;
        }
      });

      // Transform data for charts
      const ctfStatusData = Object.entries(ctfStatusStats).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        count: value
      }));

      const userRoleData = analytics?.users?.roleStats?.map(stat => ({
        name: stat._id === 'admin' ? 'Administrators' : 'Students',
        value: stat.count,
        count: stat.count
      })) || [];

      setAnalytics({
        ...analytics,
        ctfStatusData,
        userRoleData,
        realtimeStats: stats
      });

      setRealtimeStats(stats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    await fetchAnalytics();
    toast.success('Analytics updated!');
  };

  const StatCard = ({ title, value, description, icon: Icon, color = 'blue' }) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      purple: 'text-purple-600 bg-purple-100',
    };

    return (
      <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colors[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg sm:text-xl font-bold text-gray-900">{value}</dd>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Pie chart colors
  const CTF_STATUS_COLORS = {
    Active: '#10B981',
    Upcoming: '#3B82F6',
    Ended: '#6B7280',
    Inactive: '#F59E0B'
  };

  const USER_ROLE_COLORS = {
    Administrators: '#8B5CF6',
    Students: '#3B82F6'
  };

  if (loading) {
    return (
      <Layout title="Analytics" subtitle="Detailed platform insights and statistics">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  const { users, ctfs, submissions, ctfStatusData = [], userRoleData = [] } = analytics || {};
  const totalSubmissions = submissions?.total || 0;
  const correctSubmissions = submissions?.correctSubmissions || 0;
  const successRate = totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0;

  return (
    <Layout title="Analytics" subtitle="Real-time platform insights and statistics">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
            <input
              type="checkbox"
              id="analyticsAutoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="analyticsAutoRefresh" className="text-xs sm:text-sm text-gray-600">
              Auto-refresh (30s)
            </label>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button 
            variant="outline" 
            onClick={refreshData} 
            loading={refreshing}
            className="flex items-center space-x-2 text-xs sm:text-sm px-3 py-2"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Users"
          value={users?.total || 0}
          description={`${users?.activeUsers || 0} active`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total CTFs"
          value={ctfs?.total || 0}
          description={`${ctfStatusData.find(d => d.name === 'Active')?.value || 0} active`}
          icon={Flag}
          color="green"
        />
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          description={`${correctSubmissions} correct`}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          description="Overall accuracy"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* CTF Status Distribution */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                CTF Status Distribution
              </h3>
              <span className="text-xs sm:text-sm text-gray-500">
                {ctfStatusData.reduce((sum, item) => sum + item.value, 0)} total
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ctfStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ctfStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CTF_STATUS_COLORS[entry.name] || '#6B7280'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} CTFs`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {ctfStatusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CTF_STATUS_COLORS[entry.name] }}
                  />
                  <span className="text-xs font-medium text-gray-700">{entry.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* User Role Distribution */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                User Role Distribution
              </h3>
              <span className="text-xs sm:text-sm text-gray-500">
                {userRoleData.reduce((sum, item) => sum + item.value, 0)} total
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={USER_ROLE_COLORS[entry.name] || '#6B7280'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Users`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {userRoleData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: USER_ROLE_COLORS[entry.name] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({Math.round((entry.value / userRoleData.reduce((sum, item) => sum + item.value, 0)) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Real-time Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <Target className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-blue-700">
            {realtimeStats?.activeUsers || 0}
          </div>
          <div className="text-xs sm:text-sm text-blue-600 font-medium">Active Users</div>
        </Card>

        <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <Award className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-green-700">
            {realtimeStats?.newUsersToday || 0}
          </div>
          <div className="text-xs sm:text-sm text-green-600 font-medium">New Users Today</div>
        </Card>

        <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 mx-auto mb-2" />
          <div className="text-xl sm:text-2xl font-bold text-purple-700">
            {realtimeStats?.pendingSubmissions || 0}
          </div>
          <div className="text-xs sm:text-sm text-purple-600 font-medium">Pending Submissions</div>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;