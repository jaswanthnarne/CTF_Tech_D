import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { userCTFAPI } from '../../services/user';
// this is the lastest commit 
import { 
  Clock, 
  Users, 
  Trophy, 
  Calendar,
  Play,
  Eye,
  Filter,
  Search,
  Award,
  ExternalLink
} from 'lucide-react';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const CTFs = () => {
  const [ctfs, setCtfs] = useState([]);
  const [joinedCTFs, setJoinedCTFs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date()); // For real-time updates

  // Update current time every minute for real-time status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCTFs();
  }, [filter, search, category]);

  const fetchCTFs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      if (category !== 'all') params.category = category;

      const response = await userCTFAPI.getAllCTFs(params);
      console.log('Fetched CTFs with links:', response.data.ctfs);
      setCtfs(response.data.ctfs);

      // Fetch joined status for each CTF
      const joined = new Set();
      for (const ctf of response.data.ctfs) {
        try {
          const joinedResponse = await userCTFAPI.checkJoined(ctf._id);
          if (joinedResponse.data.joined) {
            joined.add(ctf._id);
          }
        } catch (error) {
          console.error(`Failed to check joined status for CTF ${ctf._id}:`, error);
        }
      }
      setJoinedCTFs(joined);
    } catch (error) {
      console.error('Failed to fetch CTFs:', error);
      toast.error('Failed to load CTFs');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCTF = async (ctfId) => {
    try {
      await userCTFAPI.joinCTF(ctfId);
      setJoinedCTFs(prev => new Set([...prev, ctfId]));
      toast.success('Successfully joined CTF!');
      fetchCTFs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join CTF');
    }
  };

  const handleVisitCTF = (ctfLink, ctfTitle) => {
    if (!ctfLink) {
      toast.error('No CTF link available');
      return;
    }
    
    let url = ctfLink;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

 // In CTFs.jsx - Fix all time calculations to use IST
const isWithinActiveHours = (ctf) => {
  if (!ctf.activeHours || !ctf.activeHours.startTime || !ctf.activeHours.endTime) {
    return true;
  }

  // Convert to IST
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  
  const [startHours, startMinutes] = ctf.activeHours.startTime.split(':').map(Number);
  const [endHours, endMinutes] = ctf.activeHours.endTime.split(':').map(Number);

  const currentMinutes = istTime.getUTCHours() * 60 + istTime.getUTCMinutes();
  const startMinutesTotal = startHours * 60 + startMinutes;
  const endMinutesTotal = endHours * 60 + endMinutes;

  console.log('🕒 Frontend IST Time Check:', {
    currentIST: `${istTime.getUTCHours().toString().padStart(2, '0')}:${istTime.getUTCMinutes().toString().padStart(2, '0')}`,
    activeHours: `${ctf.activeHours.startTime} - ${ctf.activeHours.endTime}`,
    currentMinutes,
    startMinutesTotal,
    endMinutesTotal
  });

  // Handle case where active hours cross midnight
  if (endMinutesTotal < startMinutesTotal) {
    return currentMinutes >= startMinutesTotal || currentMinutes <= endMinutesTotal;
  } else {
    return currentMinutes >= startMinutesTotal && currentMinutes <= endMinutesTotal;
  }
};

// Real-time status calculation
// Status calculation based purely on active hours
const calculateCurrentStatus = (ctf) => {
  // If CTF is not visible or not published
  if (!ctf.isVisible || !ctf.isPublished) {
    return { status: 'inactive', isCurrentlyActive: false };
  }
  
  // Check if within active hours
  const withinActiveHours = isWithinActiveHours(ctf);
  
  if (withinActiveHours) {
    return { status: 'active', isCurrentlyActive: true };
  } else {
    return { status: 'inactive', isCurrentlyActive: false };
  }
};

  // Check if join button should be enabled
  const isJoinButtonEnabled = (ctf) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
    console.log(`CTF ${ctf._id} - Status: ${status}, Currently Active: ${isCurrentlyActive}, Joined: ${joinedCTFs.has(ctf._id)}`);
    return status === 'active' && isCurrentlyActive && !joinedCTFs.has(ctf._id);
  };

  // Check if continue button should be shown
  const shouldShowContinueButton = (ctf) => {
    return joinedCTFs.has(ctf._id);
  };

  // Check if external link button should be enabled
  const isExternalLinkEnabled = (ctf) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
    const hasCTFLink = ctf.ctfLink && ctf.ctfLink.trim() !== '';
    return hasCTFLink && status === 'active' && isCurrentlyActive;
  };

  const getStatusBadge = (ctf) => {
    const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
    
    const statusConfig = {
      active: { 
        color: isCurrentlyActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800', 
        label: isCurrentlyActive ? 'Active Now' : 'Inactive Hours',
        description: isCurrentlyActive ? 'Ready to play!' : `Active ${ctf.activeHours.startTime}-${ctf.activeHours.endTime}`
      },
      upcoming: { 
        color: 'bg-blue-100 text-blue-800', 
        label: 'Upcoming',
        description: `Starts ${new Date(ctf.schedule.startDate).toLocaleDateString()}`
      },
      ended: { 
        color: 'bg-gray-100 text-gray-800', 
        label: 'Ended',
        description: 'Challenge has ended'
      },
      inactive: { 
        color: 'bg-red-100 text-red-800', 
        label: 'Not Available',
        description: 'CTF is not currently available'
      },
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <div className={`px-3 py-2 rounded-lg text-sm flex flex-col ${config.color}`}>
        <span className="font-medium">{config.label}</span>
        <span className="text-xs opacity-75">{config.description}</span>
      </div>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {category}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      Easy: { color: 'bg-green-100 text-green-800', label: 'Easy' },
      Medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      Hard: { color: 'bg-orange-100 text-orange-800', label: 'Hard' },
      Expert: { color: 'bg-red-100 text-red-800', label: 'Expert' },
    };
    
    const config = difficultyConfig[difficulty] || difficultyConfig.Easy;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const categories = ['all', 'Web Security', 'Cryptography', 'Forensics', 'Reverse Engineering', 'Pwn', 'Misc'];
  
  // Filter CTFs based on real-time status
  const filteredCTFs = ctfs.filter(ctf => {
    const { status } = calculateCurrentStatus(ctf);
    
    if (filter !== 'all' && status !== filter) return false;
    if (search && !ctf.title.toLowerCase().includes(search.toLowerCase()) && 
        !ctf.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && ctf.category !== category) return false;
    return true;
  });

  return (
    <StudentLayout title="CTF Challenges" subtitle="Browse and join available challenges">
      {/* Header and Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CTF Challenges</h2>
          <p className="text-gray-600 mt-2">
            Test your cybersecurity skills with these challenges
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search CTFs by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <Button 
              variant="outline" 
              onClick={fetchCTFs}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* CTF Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCTFs.map((ctf) => {
            const { status, isCurrentlyActive } = calculateCurrentStatus(ctf);
            const hasCTFLink = ctf.ctfLink && ctf.ctfLink.trim() !== '';
            const joinEnabled = isJoinButtonEnabled(ctf);
            const externalLinkEnabled = isExternalLinkEnabled(ctf);
            const showContinueButton = shouldShowContinueButton(ctf);
            
            return (
              <Card key={ctf._id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Card.Content className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{ctf.title}</h3>
                      <div className="flex items-center space-x-2">
                        {getCategoryBadge(ctf.category)}
                        {getDifficultyBadge(ctf.difficulty)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-yellow-600 font-semibold">
                        <Trophy className="h-4 w-4 mr-1" />
                        {ctf.points}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ctf.description}</p>

                  {/* Schedule Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(ctf.schedule.startDate).toLocaleDateString()} - {new Date(ctf.schedule.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {ctf.activeHours.startTime} - {ctf.activeHours.endTime} ({ctf.activeHours.timezone})
                        {ctf.activeHours.days && ctf.activeHours.days.length > 0 && (
                          <span className="ml-1">({ctf.activeHours.days.join(', ')})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{ctf.participants?.length || 0} participants</span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    {getStatusBadge(ctf)}
                    
                    <div className="flex flex-col space-y-2">
                      {/* External CTF Link Button */}
                      {hasCTFLink && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVisitCTF(ctf.ctfLink, ctf.title)}
                          disabled={!externalLinkEnabled}
                          className="flex items-center space-x-2 w-full"
                          title={
                            externalLinkEnabled 
                              ? `Visit ${ctf.title} challenge` 
                              : 'Challenge link only available during active hours'
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>
                            {externalLinkEnabled ? 'Visit Challenge' : 'Link Unavailable'}
                          </span>
                        </Button>
                      )}
                      
                      {/* Continue Button (for joined CTFs) */}
                      {showContinueButton ? (
                        <Link to={`/student/ctf/${ctf._id}`} className="w-full">
                          <Button size="sm" className="flex items-center space-x-2 w-full">
                            <Play className="h-4 w-4" />
                            <span>Continue</span>
                          </Button>
                        </Link>
                      ) : (
                        /* Join Button (for non-joined CTFs) */
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinCTF(ctf._id)}
                          disabled={!joinEnabled}
                          title={
                            joinEnabled 
                              ? 'Join CTF' 
                              : status !== 'active' 
                                ? `CTF is ${status}` 
                                : !isCurrentlyActive 
                                ? 'CTF is not currently active' 
                                : 'Already joined'
                          }
                          className="w-full"
                        >
                          {joinEnabled ? 'Join Challenge' : 'Not Available'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCTFs.length === 0 && (
        <Card>
          <Card.Content className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No CTFs found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {search || filter !== 'all' || category !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No CTFs are currently available. Check back later!'
              }
            </p>
          </Card.Content>
        </Card>
      )}
    </StudentLayout>
  );
};

export default CTFs;