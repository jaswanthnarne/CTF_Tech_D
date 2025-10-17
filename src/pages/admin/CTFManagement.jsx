import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import CTFForm from '../../components/forms/CTFForm';
import { ctfAPI } from '../../services/admin';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Search,
  Filter,
  Download,
  Upload,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Activity,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  FileText,
  UserCheck,
  RefreshCw,
  BarChart3,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const CTFManagement = () => {
  const [ctfs, setCtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCTF, setEditingCTF] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [viewCTF, setViewCTF] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(null);
  const [analyticsCTF, setAnalyticsCTF] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Update current time every minute for real-time status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCTFs();
  }, []);

  const fetchCTFs = async () => {
    try {
      setLoading(true);
      const response = await ctfAPI.getAllCTFs();
      console.log('Fetched CTFs:', response.data.ctfs); 
      setCtfs(response.data.ctfs);
    } catch (error) {
      console.error('Failed to fetch CTFs:', error);
      toast.error('Failed to fetch CTFs');
    } finally {
      setLoading(false);
    }
  };

  const refreshCTFs = () => {
    fetchCTFs();
  };

  // Use backend's calculated status instead of recalculating
  const getCTFStatus = (ctf) => {
    // Use backend calculated status and isCurrentlyActive
    return {
      status: ctf.status,
      isCurrentlyActive: ctf.isCurrentlyActive,
      canSubmit: ctf.canSubmit
    };
  };

  const handleCreateCTF = async (data) => {
    try {
      setActionLoading(true);
      await ctfAPI.createCTF(data);
      toast.success('CTF created successfully');
      setShowModal(false);
      fetchCTFs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create CTF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCTF = async (data) => {
    try {
      setActionLoading(true);
      await ctfAPI.updateCTF(editingCTF._id, data);
      toast.success('CTF updated successfully');
      setShowModal(false);
      setEditingCTF(null);
      fetchCTFs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update CTF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCTF = async (id) => {
    if (!window.confirm('Are you sure you want to delete this CTF? This action cannot be undone.')) return;
    
    try {
      await ctfAPI.deleteCTF(id);
      toast.success('CTF deleted successfully');
      fetchCTFs();
    } catch (error) {
      toast.error('Failed to delete CTF');
    }
  };

  const handleToggleActivation = async (ctf) => {
    try {
      await ctfAPI.toggleActivation(ctf._id);
      toast.success(`CTF ${ctf.isVisible ? 'deactivated' : 'activated'} successfully`);
      fetchCTFs();
    } catch (error) {
      toast.error('Failed to toggle CTF activation');
    }
  };

  const handlePublish = async (ctf) => {
    try {
      if (ctf.isPublished) {
        await ctfAPI.unpublishCTF(ctf._id);
        toast.success('CTF unpublished successfully');
      } else {
        await ctfAPI.publishCTF(ctf._id);
        toast.success('CTF published successfully');
      }
      fetchCTFs();
    } catch (error) {
      toast.error(`Failed to ${ctf.isPublished ? 'unpublish' : 'publish'} CTF`);
    }
  };

  const handleForceStatus = async (ctfId, newStatus) => {
    try {
      await ctfAPI.forceStatus(ctfId, newStatus);
      toast.success(`CTF status updated to ${newStatus}`);
      fetchCTFs();
    } catch (error) {
      toast.error('Failed to update CTF status');
    }
  };

  // Export functionality
  const handleExportCTFs = async () => {
    try {
      const response = await ctfAPI.exportCTFs();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ctfs-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CTFs exported successfully');
      setExportMenuOpen(null);
    } catch (error) {
      toast.error('Failed to export CTFs');
    }
  };

  const handleExportCTFSubmissions = async (ctfId, ctfTitle) => {
    try {
      const response = await ctfAPI.exportCTFSubmissions(ctfId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `submissions-${ctfTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Submissions exported successfully');
      setExportMenuOpen(null);
    } catch (error) {
      toast.error('Failed to export submissions');
    }
  };

  const handleExportCTFParticipants = async (ctfId, ctfTitle) => {
    try {
      const response = await ctfAPI.exportCTFParticipants(ctfId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `participants-${ctfTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Participants exported successfully');
      setExportMenuOpen(null);
    } catch (error) {
      toast.error('Failed to export participants');
    }
  };

  const handleViewAnalytics = async (ctf) => {
    try {
      const response = await ctfAPI.getCTFAnalytics(ctf._id);
      setAnalyticsCTF({
        ...ctf,
        analytics: response.data.analytics
      });
    } catch (error) {
      toast.error('Failed to fetch CTF analytics');
    }
  };

  const openEditModal = (ctf) => {
    setEditingCTF(ctf);
    setShowModal(true);
    setMobileMenuOpen(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCTF(null);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('CTF link copied to clipboard!');
  };

  const handleViewCTF = (ctf) => {
    setViewCTF(ctf);
  };

  const closeViewModal = () => {
    setViewCTF(null);
  };

  const closeAnalyticsModal = () => {
    setAnalyticsCTF(null);
  };

  const toggleRowExpansion = (ctfId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ctfId)) {
      newExpanded.delete(ctfId);
    } else {
      newExpanded.add(ctfId);
    }
    setExpandedRows(newExpanded);
  };

  // Enhanced status badge using backend calculated status
  const getStatusBadge = (ctf) => {
    const { status, isCurrentlyActive } = getCTFStatus(ctf);
    
    const statusConfig = {
      active: { 
        color: 'bg-green-50 text-green-700 border border-green-200',
        label: isCurrentlyActive ? 'Active Now' : 'Active (Outside Hours)',
        icon: CheckCircle,
        iconColor: isCurrentlyActive ? 'text-green-500' : 'text-yellow-500',
      },
      upcoming: { 
        color: 'bg-blue-50 text-blue-700 border border-blue-200',
        label: 'Upcoming',
        icon: Clock,
        iconColor: 'text-blue-500',
      },
      ended: { 
        color: 'bg-gray-50 text-gray-700 border border-gray-200',
        label: 'Ended',
        icon: AlertCircle,
        iconColor: 'text-gray-500',
      },
      inactive: { 
        color: 'bg-red-50 text-red-700 border border-red-200',
        label: !ctf.isVisible ? 'Hidden' : !ctf.isPublished ? 'Draft' : 'Inactive',
        icon: !ctf.isVisible ? EyeOff : !ctf.isPublished ? FileText : XCircle,
        iconColor: !ctf.isVisible ? 'text-red-500' : !ctf.isPublished ? 'text-yellow-500' : 'text-orange-500',
      },
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const IconComponent = config.icon;
    
    return (
      <div className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 ${config.color}`}>
        <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  // Improved visibility badge
  const getVisibilityBadge = (ctf) => {
    if (!ctf.isVisible) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <EyeOff className="h-3 w-3 mr-1" />
          Hidden
        </span>
      );
    } else if (!ctf.isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FileText className="h-3 w-3 mr-1" />
          Draft
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Eye className="h-3 w-3 mr-1" />
          Published
        </span>
      );
    }
  };

  // Enhanced RealTimeStatusControls component
  const RealTimeStatusControls = ({ ctf, onStatusChange }) => {
    const { status, isCurrentlyActive } = getCTFStatus(ctf);
    const [loading, setLoading] = useState(false);

    const handleForceStatus = async (newStatus) => {
      try {
        setLoading(true);
        await ctfAPI.forceStatus(ctf._id, newStatus);
        toast.success(`CTF status updated to ${newStatus}`);
        setStatusMenuOpen(false);
        if (onStatusChange) onStatusChange();
      } catch (error) {
        toast.error('Failed to update CTF status');
      } finally {
        setLoading(false);
      }
    };

    const handleToggleActivation = async () => {
      try {
        setLoading(true);
        await ctfAPI.toggleActivation(ctf._id);
        toast.success(`CTF ${ctf.isVisible ? 'deactivated' : 'activated'} successfully`);
        setStatusMenuOpen(false);
        if (onStatusChange) onStatusChange();
      } catch (error) {
        toast.error('Failed to toggle CTF activation');
      } finally {
        setLoading(false);
      }
    };

    const handlePublishToggle = async () => {
      try {
        setLoading(true);
        if (ctf.isPublished) {
          await ctfAPI.unpublishCTF(ctf._id);
          toast.success('CTF unpublished successfully');
        } else {
          await ctfAPI.publishCTF(ctf._id);
          toast.success('CTF published successfully');
        }
        setStatusMenuOpen(false);
        if (onStatusChange) onStatusChange();
      } catch (error) {
        toast.error(`Failed to ${ctf.isPublished ? 'unpublish' : 'publish'} CTF`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="relative">
        <button
          onClick={() => setStatusMenuOpen(statusMenuOpen === ctf._id ? null : ctf._id)}
          className={`p-2 rounded-lg transition-colors border ${
            loading 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200'
          }`}
          title="Manage CTF Status"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-4 w-4"></div>
          ) : (
            <Activity className="h-4 w-4" />
          )}
        </button>
        
        {statusMenuOpen === ctf._id && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Status Controls</p>
              <p className="text-xs text-gray-500 mt-1">Current: <span className="font-medium capitalize">{status}</span></p>
              {status === 'active' && (
                <p className="text-xs text-gray-500">Currently Active: {isCurrentlyActive ? 'Yes' : 'No'}</p>
              )}
            </div>
            
            <div className="p-2 space-y-1">
              <button
                onClick={handleToggleActivation}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                  ctf.isVisible 
                    ? 'text-orange-700 hover:bg-orange-50' 
                    : 'text-green-700 hover:bg-green-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {ctf.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{ctf.isVisible ? 'Hide from Users' : 'Show to Users'}</span>
              </button>
              
              <button
                onClick={handlePublishToggle}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                  ctf.isPublished 
                    ? 'text-yellow-700 hover:bg-yellow-50' 
                    : 'text-purple-700 hover:bg-purple-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {ctf.isPublished ? <FileText className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{ctf.isPublished ? 'Unpublish' : 'Publish'}</span>
              </button>
            </div>

            <div className="p-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2 px-2">Force Status</p>
              
              <button
                onClick={() => handleForceStatus('active')}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PlayCircle className="h-4 w-4" />
                <span>Set Active</span>
                {status === 'active' && <CheckCircle className="h-3 w-3 ml-auto text-green-500" />}
              </button>
              
              <button
                onClick={() => handleForceStatus('upcoming')}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Set Upcoming</span>
                {status === 'upcoming' && <CheckCircle className="h-3 w-3 ml-auto text-blue-500" />}
              </button>
              
              <button
                onClick={() => handleForceStatus('ended')}
                disabled={loading}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span>Set Ended</span>
                {status === 'ended' && <CheckCircle className="h-3 w-3 ml-auto text-gray-500" />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Export controls component
  const ExportControls = ({ ctf }) => {
    return (
      <div className="relative">
        <button
          onClick={() => setExportMenuOpen(exportMenuOpen === ctf._id ? null : ctf._id)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
          title="Export Data"
        >
          <Download className="h-4 w-4" />
        </button>
        
        {exportMenuOpen === ctf._id && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Export Data</p>
            </div>
            <button
              onClick={() => {
                handleExportCTFSubmissions(ctf._id, ctf.title);
                setExportMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Submissions</span>
            </button>
            <button
              onClick={() => {
                handleExportCTFParticipants(ctf._id, ctf.title);
                setExportMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors rounded-b-lg"
            >
              <UserCheck className="h-4 w-4" />
              <span>Participants</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      Easy: { color: 'bg-green-100 text-green-800 border border-green-200', label: 'Easy' },
      Medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', label: 'Medium' },
      Hard: { color: 'bg-orange-100 text-orange-800 border border-orange-200', label: 'Hard' },
      Expert: { color: 'bg-red-100 text-red-800 border border-red-200', label: 'Expert' },
    };
    
    const config = difficultyConfig[difficulty] || difficultyConfig.Easy;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter CTFs based on search and filters
  const filteredCTFs = ctfs.filter(ctf => {
    const { status } = getCTFStatus(ctf);
    const matchesSearch = ctf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ctf.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ctf.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(ctfs.map(ctf => ctf.category))];
  const statuses = ['all', 'active', 'upcoming', 'ended', 'inactive'];

  // Calculate stats for summary with real-time status
  const stats = {
    total: ctfs.length,
    active: ctfs.filter(ctf => {
      const { status, isCurrentlyActive } = getCTFStatus(ctf);
      return status === 'active' && isCurrentlyActive;
    }).length,
    upcoming: ctfs.filter(ctf => {
      const { status } = getCTFStatus(ctf);
      return status === 'upcoming';
    }).length,
    ended: ctfs.filter(ctf => {
      const { status } = getCTFStatus(ctf);
      return status === 'ended';
    }).length,
    inactive: ctfs.filter(ctf => {
      const { status } = getCTFStatus(ctf);
      return status === 'inactive';
    }).length,
    published: ctfs.filter(ctf => ctf.isPublished).length,
    visible: ctfs.filter(ctf => ctf.isVisible).length,
    totalParticipants: ctfs.reduce((total, ctf) => total + (ctf.participants?.length || 0), 0),
  };

  // Enhanced Analytics Modal
  const AnalyticsModal = ({ ctf, onClose }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchAnalytics = async () => {
        try {
          setLoading(true);
          const response = await ctfAPI.getCTFAnalytics(ctf._id);
          setAnalytics(response.data.analytics);
        } catch (error) {
          toast.error('Failed to fetch CTF analytics');
        } finally {
          setLoading(false);
        }
      };

      if (ctf) {
        fetchAnalytics();
      }
    }, [ctf]);

    if (!ctf) return null;

    return (
      <Modal
        isOpen={!!ctf}
        onClose={onClose}
        title={`${ctf.title} - Analytics`}
        size="2xl"
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border border-gray-200">
                <Card.Content className="p-4 text-center">
                  <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.basic.totalParticipants}</p>
                  <p className="text-sm text-gray-600">Participants</p>
                </Card.Content>
              </Card>
              
              <Card className="border border-gray-200">
                <Card.Content className="p-4 text-center">
                  <FileText className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.basic.totalSubmissions}</p>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                </Card.Content>
              </Card>
              
              <Card className="border border-gray-200">
                <Card.Content className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.basic.correctSubmissions}</p>
                  <p className="text-sm text-gray-600">Correct</p>
                </Card.Content>
              </Card>
              
              <Card className="border border-gray-200">
                <Card.Content className="p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.basic.successRate}%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </Card.Content>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <Card.Content className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">CTF Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium text-gray-900">{analytics.basic.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <span className="text-sm font-medium text-gray-900">{analytics.basic.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Points:</span>
                      <span className="text-sm font-medium text-gray-900">{analytics.basic.points}</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card className="border border-gray-200">
                <Card.Content className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completion Rate:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.performance?.completionRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Attempts:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.basic.averageAttempts}
                      </span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => {
                  handleExportCTFSubmissions(ctf._id, ctf.title);
                }}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300"
              >
                <Download className="h-4 w-4" />
                <span>Export Submissions</span>
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                className="border-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
            <p className="text-gray-500">Please try again later</p>
          </div>
        )}
      </Modal>
    );
  };

  return (
    <Layout title="CTF Management" subtitle="Create and manage CTF challenges">
      {/* Header Actions */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CTF Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your CTF challenges and their visibility</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Button 
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
                onClick={() => setExportMenuOpen('bulk')}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              
              {exportMenuOpen === 'bulk' && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Export Data</p>
                  </div>
                  <button
                    onClick={handleExportCTFs}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors rounded-b-lg"
                  >
                    <FileText className="h-4 w-4" />
                    <span>All CTFs</span>
                  </button>
                </div>
              )}
            </div>
            <Button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create CTF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <Card.Content className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search CTFs by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                {statuses.slice(1).map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <Button 
                variant="outline" 
                onClick={fetchCTFs}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total CTFs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active CTFs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <PlayCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visible</p>
                <p className="text-2xl font-bold text-gray-900">{stats.visible}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* CTFs Table - Desktop View */}
      <Card className="border border-gray-200 shadow-sm">
        <Card.Content className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTF Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8"></div>
                        <span className="ml-3 text-gray-600">Loading CTFs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCTFs.length > 0 ? (
                  filteredCTFs.map((ctf) => (
                    <React.Fragment key={ctf._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => toggleRowExpansion(ctf._id)}
                              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {expandedRows.has(ctf._id) ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-gray-900 truncate">{ctf.title}</h3>
                                {getVisibilityBadge(ctf)}
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-2">{ctf.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {ctf.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {getDifficultyBadge(ctf.difficulty)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono font-medium text-gray-900">{ctf.points}</span>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(ctf)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {ctf.participants?.length || 0}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleViewCTF(ctf)}
                              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                              title="View CTF"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewAnalytics(ctf)}
                              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                              title="View Analytics"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(ctf)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                              title="Edit CTF"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <RealTimeStatusControls 
                              ctf={ctf} 
                              onStatusChange={refreshCTFs}
                            />

                            <ExportControls ctf={ctf} />
                            
                            <button
                              onClick={() => handleDeleteCTF(ctf._id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              title="Delete CTF"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(ctf._id) && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Schedule Information</h4>
                                <div className="space-y-1">
                                  <p><span className="text-gray-600">Start:</span> {new Date(ctf.schedule.startDate).toLocaleString()}</p>
                                  <p><span className="text-gray-600">End:</span> {new Date(ctf.schedule.endDate).toLocaleString()}</p>
                                  <p><span className="text-gray-600">Active Hours:</span> {ctf.activeHours.startTime} - {ctf.activeHours.endTime} IST</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                                <div className="flex flex-wrap gap-2">
                                  {ctf.ctfLink && (
                                    <button
                                      onClick={() => handleCopyLink(ctf.ctfLink)}
                                      className="inline-flex items-center px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy Link
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleToggleActivation(ctf)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                                  >
                                    {ctf.isVisible ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                    {ctf.isVisible ? 'Hide' : 'Show'}
                                  </button>
                                  <button
                                    onClick={() => handlePublish(ctf)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                                  >
                                    {ctf.isPublished ? <FileText className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                    {ctf.isPublished ? 'Unpublish' : 'Publish'}
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
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No CTFs Found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first CTF challenge'
                        }
                      </p>
                      <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create CTF
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
      <div className="lg:hidden space-y-4 mt-6">
        {loading ? (
          <Card className="border border-gray-200 shadow-sm">
            <Card.Content className="p-6 text-center">
              <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading CTFs...</p>
            </Card.Content>
          </Card>
        ) : filteredCTFs.length > 0 ? (
          filteredCTFs.map((ctf) => (
            <Card key={ctf._id} className="hover:shadow-lg transition-shadow border border-gray-200">
              <Card.Content className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{ctf.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ctf.description}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMobileMenuOpen(mobileMenuOpen === ctf._id ? null : ctf._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {mobileMenuOpen === ctf._id && (
                      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48">
                        <button
                          onClick={() => {
                            handleViewCTF(ctf);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-t-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View CTF</span>
                        </button>
                        <button
                          onClick={() => {
                            handleViewAnalytics(ctf);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition-colors"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Analytics</span>
                        </button>
                        <button
                          onClick={() => {
                            openEditModal(ctf);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit CTF</span>
                        </button>
                        <button
                          onClick={() => {
                            handleExportCTFSubmissions(ctf._id, ctf.title);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Export Submissions</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteCTF(ctf._id);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-b-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {ctf.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                    {getDifficultyBadge(ctf.difficulty)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Points</p>
                    <p className="font-mono font-medium text-gray-900">{ctf.points}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {getStatusBadge(ctf)}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {ctf.participants?.length || 0} participants
                  </div>
                  <div>
                    {getVisibilityBadge(ctf)}
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card className="border border-gray-200 shadow-sm">
            <Card.Content className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No CTFs Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first CTF challenge'
                }
              </p>
              <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create CTF
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCTF ? 'Edit CTF' : 'Create New CTF'}
        size="xl"
      >
        <CTFForm
          ctf={editingCTF}
          onSubmit={editingCTF ? handleUpdateCTF : handleCreateCTF}
          onCancel={closeModal}
          loading={actionLoading}
        />
      </Modal>

      {viewCTF && (
        <Modal
          isOpen={!!viewCTF}
          onClose={closeViewModal}
          title="CTF Details"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <p className="mt-1 text-sm text-gray-900">{viewCTF.title}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{viewCTF.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1 text-sm text-gray-900">{viewCTF.category}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <p className="mt-1 text-sm text-gray-900">{viewCTF.difficulty}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Points</label>
                <p className="mt-1 text-sm text-gray-900">{viewCTF.points}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  {getStatusBadge(viewCTF)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <div className="mt-1">
                  {getVisibilityBadge(viewCTF)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Participants</label>
                <p className="mt-1 text-sm text-gray-900">{viewCTF.participants?.length || 0}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-3">
              <Button onClick={closeViewModal} variant="outline" className="border-gray-300">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {analyticsCTF && (
        <AnalyticsModal 
          ctf={analyticsCTF}
          onClose={closeAnalyticsModal}
        />
      )}
    </Layout>
  );
};

export default CTFManagement;