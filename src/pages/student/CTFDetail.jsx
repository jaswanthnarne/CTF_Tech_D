import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/layout/StudentLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { userCTFAPI } from '../../services/user';
import { 
  Clock, 
  Users, 
  Trophy, 
  Calendar,
  Flag,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  BarChart3,
  Upload,
  ExternalLink
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const CTFDetail = () => {
  const { id } = useParams();
  const [ctf, setCtf] = useState(null);
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCTFData();
    }
  }, [id]);

  const fetchCTFData = async () => {
    try {
      setLoading(true);
      const [ctfResponse, progressResponse, submissionsResponse] = await Promise.all([
        userCTFAPI.getCTF(id),
        userCTFAPI.getProgress(id),
        userCTFAPI.getMySubmissions({ ctfId: id })
      ]);

      console.log('CTF Detail Data:', ctfResponse.data.ctf);
      setCtf(ctfResponse.data.ctf);
      setProgress(progressResponse.data.progress);
      setSubmissions(submissionsResponse.data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch CTF data:', error);
      toast.error('Failed to load CTF details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    if (!flag.trim()) return;

    try {
      setSubmitting(true);
      const response = await userCTFAPI.submitFlag(id, { flag: flag.trim() });
      
      if (response.data.solved) {
        toast.success(`Correct! You earned ${response.data.points} points!`);
        setShowSubmitModal(false);
        setFlag('');
        fetchCTFData(); // Refresh data
      } else {
        toast.error('Incorrect flag. Try again!');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisitCTF = (ctfLink, ctfTitle) => {
    if (!ctfLink) {
      toast.error('No CTF link available');
      return;
    }
    
    // Validate URL format
    let url = ctfLink;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Use backend calculated status
  const getStatusBadge = () => {
    if (!ctf) return null;

    const statusConfig = {
      active: { 
        color: ctf.isCurrentlyActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800', 
        label: ctf.isCurrentlyActive ? 'Active Now' : 'Inactive Hours',
        icon: ctf.isCurrentlyActive ? CheckCircle : EyeOff
      },
      upcoming: { color: 'bg-blue-100 text-blue-800', label: 'Upcoming', icon: Calendar },
      ended: { color: 'bg-gray-100 text-gray-800', label: 'Ended', icon: XCircle },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactive', icon: EyeOff },
    };
    
    const config = statusConfig[ctf.status] || statusConfig.upcoming;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout title="CTF Details" subtitle="Loading challenge...">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  if (!ctf) {
    return (
      <Layout title="CTF Not Found" subtitle="Challenge not available">
        <Card>
          <Card.Content className="text-center py-12">
            <XCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">CTF Not Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The requested CTF challenge could not be found or you don't have access to it.
            </p>
            <Link to="/student/ctfs">
              <Button className="mt-4">Back to CTFs</Button>
            </Link>
          </Card.Content>
        </Card>
      </Layout>
    );
  }

  const canSubmit = progress?.canSubmit && !progress?.isSolved;
  const hasCTFLink = ctf.ctfLink && ctf.ctfLink.trim() !== '';

  return (
    <Layout title={ctf.title} subtitle={ctf.category}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{ctf.title}</h1>
                  {getStatusBadge()}
                </div>
                
                <p className="text-gray-600 mb-4">{ctf.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="font-semibold">{ctf.points} points</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(ctf.schedule.startDate).toLocaleDateString()} - {new Date(ctf.schedule.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{ctf.activeHours.startTime} - {ctf.activeHours.endTime} IST</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                {progress?.isSolved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-800 font-medium">Challenge Solved!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      You earned {progress.pointsEarned} points
                    </p>
                  </div>
                )}
                
                {/* CTF Link Button - Always show if link exists */}
                {hasCTFLink && (
                  <Button 
                    onClick={() => handleVisitCTF(ctf.ctfLink, ctf.title)}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Visit Challenge Site</span>
                  </Button>
                )}
                
                {canSubmit && (
                  <Button 
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Submit Flag</span>
                  </Button>
                )}

                <Link to={`/student/ctf/${id}/leaderboard`}>
                  <Button variant="outline" className="flex items-center space-x-2 w-full">
                    <BarChart3 className="h-4 w-4" />
                    <span>View Leaderboard</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Progress and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <Card.Content className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{progress?.attempts || 0}</div>
              <div className="text-sm text-gray-500">Attempts Made</div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{ctf.maxAttempts}</div>
              <div className="text-sm text-gray-500">Max Attempts</div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {progress?.isSolved ? progress.pointsEarned : 0}
              </div>
              <div className="text-sm text-gray-500">Points Earned</div>
            </Card.Content>
          </Card>
        </div>

        {/* CTF Link Section - Show if link exists */}
        {hasCTFLink && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExternalLink className="h-5 w-5 mr-2 text-purple-600" />
                Challenge Resources
              </h3>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Visit the challenge website to access the actual CTF environment and resources:
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {ctf.ctfLink}
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleVisitCTF(ctf.ctfLink, ctf.title)}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Challenge</span>
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Submission History */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Submission History</h3>
          </Card.Header>
          <Card.Content>
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((submission, index) => (
                  <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        submission.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {submission.isCorrect ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Attempt #{submissions.length - index}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        submission.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {submission.isCorrect ? `+${submission.points} points` : 'Failed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Flag className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No submissions yet</p>
                {canSubmit && (
                  <Button 
                    onClick={() => setShowSubmitModal(true)}
                    className="mt-4"
                  >
                    Make First Submission
                  </Button>
                )}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Submit Flag Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Flag"
      >
        <form onSubmit={handleSubmitFlag} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter the flag
            </label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="CTF{...}"
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <Eye className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Remaining Attempts</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  You have {ctf.maxAttempts - (progress?.attempts || 0)} attempts remaining
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={!flag.trim()}
            >
              Submit Flag
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default CTFDetail;