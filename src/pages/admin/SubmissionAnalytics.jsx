import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { submissionAdminAPI, analyticsAPI } from '../../services/admin';
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
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  RefreshCw,
  Activity
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const SubmissionAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      
      // Fetch comprehensive submission data
      const [statsResponse, submissionsResponse, analyticsResponse] = await Promise.all([
        submissionAdminAPI.getSubmissionStats({ timeRange }),
        submissionAdminAPI.getAllSubmissions({ 
          limit: 1000,
          timeRange 
        }),
        analyticsAPI.getComprehensiveAnalytics({ timeRange })
      ]);

      const submissions = submissionsResponse.data.submissions || [];
      const analytics = analyticsResponse.data.analytics || {};

      // Calculate real-time submission statistics
      const currentTime = new Date();
      const last24Hours = new Date(currentTime.getTime() - (24 * 60 * 60 * 1000));
      
      const recentSubmissions = submissions.filter(sub => 
        new Date(sub.submittedAt || sub.createdAt) > last24Hours
      );

      const statusCounts = {
        approved: 0,
        pending: 0,
        rejected: 0
      };

      submissions.forEach(sub => {
        const status = sub.submissionStatus || sub.status;
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });

      // Prepare data for charts
      const statusData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        count: value
      }));

      // Daily submission trend (last 7 days)
      const dailyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySubmissions = submissions.filter(sub => {
          const subDate = new Date(sub.submittedAt || sub.createdAt);
          return subDate.toISOString().split('T')[0] === dateStr;
        });

        dailyTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          submissions: daySubmissions.length,
          approved: daySubmissions.filter(s => (s.submissionStatus || s.status) === 'approved').length,
          pending: daySubmissions.filter(s => (s.submissionStatus || s.status) === 'pending').length
        });
      }

      setStats({
        ...statsResponse.data,
        statusData,
        dailyTrend,
        recentSubmissions: recentSubmissions.slice(0, 10),
        totalStats: {
          totalSubmissions: submissions.length,
          approvedSubmissions: statusCounts.approved,
          pendingSubmissions: statusCounts.pending,
          rejectedSubmissions: statusCounts.rejected,
          successRate: submissions.length > 0 ? 
            Math.round((statusCounts.approved / submissions.length) * 100) : 0
        }
      });

      setRealtimeData(analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load submission analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    await fetchAnalytics();
    toast.success('Submission analytics updated!');
  };

  const handleExport = async (type) => {
    try {
      // Implementation for exporting data
      toast.success(`Exporting ${type} data...`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const StatCard = ({ title, value, description, icon: Icon, color = 'blue' }) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100',
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

  // Chart colors
  const STATUS_COLORS = {
    Approved: '#10B981',
    Pending: '#F59E0B',
    Rejected: '#EF4444'
  };

  if (loading || !stats) {
    return (
      <Layout title="Submission Analytics" subtitle="Detailed submission insights">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  const { totalStats, statusData = [], dailyTrend = [], recentSubmissions = [] } = stats;

  return (
    <Layout title="Submission Analytics" subtitle="Real-time submission insights and statistics">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Submission Analytics</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Comprehensive insights into CTF submissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
            <input
              type="checkbox"
              id="submissionAutoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="submissionAutoRefresh" className="text-xs sm:text-sm text-gray-600">
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
          <Button 
            variant="outline"
            onClick={() => handleExport('submissions')}
            className="flex items-center space-x-2 text-xs sm:text-sm px-3 py-2"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Submissions"
          value={totalStats.totalSubmissions}
          description="All time submissions"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Approved"
          value={totalStats.approvedSubmissions}
          description="Successfully solved"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending"
          value={totalStats.pendingSubmissions}
          description="Awaiting review"
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Rejected"
          value={totalStats.rejectedSubmissions}
          description="Incorrect submissions"
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* Submission Status Distribution */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Submission Status Distribution
              </h3>
              <span className="text-xs sm:text-sm text-gray-500">
                {totalStats.totalSubmissions} total
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
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
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name] || '#6B7280'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Submissions`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({Math.round((entry.value / totalStats.totalSubmissions) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Daily Submission Trend */}
        <Card className="h-full">
          <Card.Header className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Daily Submission Trend
              </h3>
              <span className="text-xs sm:text-sm text-gray-500">
                Last 7 days
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submissions" fill="#3B82F6" name="Total Submissions" />
                  <Bar dataKey="approved" fill="#10B981" name="Approved" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Recent Submissions
            </h3>
            <span className="text-xs sm:text-sm text-gray-500">
              Last 24 hours
            </span>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => {
                const submissionTime = new Date(submission.submittedAt || submission.createdAt);
                const now = new Date();
                const timeDiff = Math.floor((now - submissionTime) / (1000 * 60)); // minutes ago
                
                let timeText = '';
                if (timeDiff < 1) timeText = 'Just now';
                else if (timeDiff < 60) timeText = `${timeDiff}m ago`;
                else if (timeDiff < 1440) timeText = `${Math.floor(timeDiff / 60)}h ago`;
                else timeText = submissionTime.toLocaleDateString();

                const status = submission.submissionStatus || submission.status;

                return (
                  <div key={submission._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      status === 'approved' ? 'bg-green-500' :
                      status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {submission.user?.fullName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {submission.ctf?.title || 'Unknown CTF'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {timeText}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        status === 'approved' ? 'bg-green-100 text-green-800' :
                        status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                <p className="mt-2 text-sm sm:text-base">No recent submissions</p>
                <p className="text-xs sm:text-sm mt-1">Submissions from the last 24 hours will appear here</p>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </Layout>
  );
};

export default SubmissionAnalytics;