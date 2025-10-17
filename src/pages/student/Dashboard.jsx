import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { userAPI, userCTFAPI } from '../../services/user';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  Flag,
  Users,
  Award,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeCTFs, setActiveCTFs] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userRanking, setUserRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel for real-time updates
      const [
        dashboardResponse, 
        ctfsResponse, 
        submissionsResponse,
        statsResponse,
        rankingResponse
      ] = await Promise.all([
        userAPI.getDashboard(),
        userCTFAPI.getJoinedCTFs({ status: 'active', limit: 3 }),
        userCTFAPI.getMySubmissions({ limit: 5 }),
        userAPI.getStats(),
        userAPI.getRanking()
      ]);
      
      setDashboardData(dashboardResponse.data);
      setActiveCTFs(ctfsResponse.data.ctfs || []);
      setRecentSubmissions(submissionsResponse.data.submissions || []);
      setUserStats(statsResponse.data.stats);
      setUserRanking(rankingResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success('Dashboard updated!');
  };

  const StatCard = ({ title, value, description, icon: Icon, color = 'blue' }) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      purple: 'text-purple-600 bg-purple-100',
      red: 'text-red-600 bg-red-100',
    };

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`p-3 rounded-lg ${colors[color]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-semibold text-gray-900">{value}</dd>
            </div>
          </div>
          {description && (
            <div className="text-right">
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Calculate real-time statistics from the data
  const calculateRealTimeStats = () => {
    if (!userStats) return null;

    const stats = userStats;
    
    return {
      totalPoints: stats.submissions?.totalPoints || 0,
      ctfsJoined: stats.ctfs?.totalCTFs || 0,
      challengesSolved: stats.ctfs?.solvedCTFs || 0,
      successRate: stats.accuracy || 0,
      totalSubmissions: stats.submissions?.totalSubmissions || 0,
      correctSubmissions: stats.submissions?.correctSubmissions || 0,
      globalRank: userRanking?.userRanking?.position || 'N/A',
      totalParticipants: userRanking?.userRanking?.totalParticipants || 0
    };
  };

  const realTimeStats = calculateRealTimeStats();

  if (loading || !dashboardData || !userStats) {
    return (
      <StudentLayout title="Dashboard" subtitle="Your CTF journey overview">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </StudentLayout>
    );
  }

  const { user } = dashboardData;

  return (
    <StudentLayout title="Dashboard" subtitle="Your CTF journey overview">
      {/* Header with Refresh Button */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time overview of your CTF progress and active challenges.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              loading={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Link to="/student/leaderboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Leaderboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Points"
          value={realTimeStats.totalPoints}
          description="Lifetime points earned"
          icon={Trophy}
          color="yellow"
        />
        <StatCard
          title="CTFs Joined"
          value={realTimeStats.ctfsJoined}
          description="Active participation"
          icon={Flag}
          color="blue"
        />
        <StatCard
          title="Challenges Solved"
          value={realTimeStats.challengesSolved}
          description="Successful submissions"
          icon={Target}
          color="green"
        />
        <StatCard
          title="Success Rate"
          value={`${realTimeStats.successRate}%`}
          description="Accuracy percentage"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Global Ranking Card */}
      {userRanking && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Global Ranking</h3>
                <p className="text-gray-600 mt-1">
                  Competing with {realTimeStats.totalParticipants} participants
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  #{realTimeStats.globalRank}
                </div>
                <p className="text-sm text-gray-500 mt-1">Your Position</p>
              </div>
            </div>
            {userRanking.topUsers && userRanking.topUsers.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Top Performers:</p>
                <div className="flex space-x-2 overflow-x-auto">
                  {userRanking.topUsers.slice(0, 5).map((user, index) => (
                    <div key={user._id} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 min-w-0 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                      <span className="text-sm text-gray-600 truncate max-w-24">
                        {user.user?.fullName || 'Anonymous'}
                      </span>
                      <span className="text-sm font-bold text-yellow-600">
                        {user.totalPoints}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active CTFs - Real-time */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active CTFs</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {activeCTFs.length} active
                </span>
                <Link to="/student/ctfs">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {activeCTFs.length > 0 ? (
                activeCTFs.map((ctf) => {
                  const isCurrentlyActive = () => {
                    const now = new Date();
                    const start = new Date(ctf.schedule?.startDate);
                    const end = new Date(ctf.schedule?.endDate);
                    return now >= start && now <= end;
                  };

                  return (
                    <div key={ctf._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{ctf.title}</h4>
                          {isCurrentlyActive() && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {ctf.activeHours?.startTime} - {ctf.activeHours?.endTime}
                          </span>
                          <span className="font-mono text-primary-600">{ctf.points} pts</span>
                          <span className="capitalize">{ctf.difficulty?.toLowerCase()}</span>
                        </div>
                      </div>
                      <Link to={`/student/ctf/${ctf._id}`}>
                        <Button size="sm">
                          {isCurrentlyActive() ? 'Continue' : 'View'}
                        </Button>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Flag className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No active CTFs</p>
                  <Link to="/student/ctfs">
                    <Button variant="outline" className="mt-4">Browse CTFs</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Recent Activity - Real-time */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <span className="text-sm text-gray-500">
                {recentSubmissions.length} submissions
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission) => {
                  const submissionTime = new Date(submission.submittedAt);
                  const now = new Date();
                  const timeDiff = Math.floor((now - submissionTime) / (1000 * 60)); // minutes ago
                  
                  let timeText = '';
                  if (timeDiff < 1) timeText = 'Just now';
                  else if (timeDiff < 60) timeText = `${timeDiff}m ago`;
                  else if (timeDiff < 1440) timeText = `${Math.floor(timeDiff / 60)}h ago`;
                  else timeText = submissionTime.toLocaleDateString();

                  return (
                    <div key={submission._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                        submission.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {submission.ctf?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {timeText}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          submission.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.isCorrect ? `+${submission.points}` : 'Failed'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No recent activity</p>
                  <p className="text-sm mt-1">Join a CTF to get started!</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {realTimeStats.challengesSolved}
          </div>
          <div className="text-sm text-gray-500">CTFs Solved</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {realTimeStats.correctSubmissions}
          </div>
          <div className="text-sm text-gray-500">Correct Submissions</div>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {realTimeStats.successRate}%
          </div>
          <div className="text-sm text-gray-500">Accuracy Rate</div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;