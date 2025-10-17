import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Flag, 
  Trophy, 
  User,
  LogOut,
  Award,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'CTF Challenges', href: '/student/ctfs', icon: Flag },
  { name: 'Leaderboard', href: '/student/leaderboard', icon: Trophy },
  { name: 'Profile', href: '/student/profile', icon: User },
];

const StudentSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CTF Platform
              </span>
              <p className="text-xs text-gray-400">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-300 hover:bg-gray-750 hover:text-white hover:shadow-md'
                  }
                `}
              >
                <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                {item.name}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-700 bg-gray-850">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {user?.fullName?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-850"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.fullName || 'Student'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.specialization || 'Cybersecurity'}
              </p>
              <p className="text-xs text-blue-300 font-medium">
                {user?.sem || 'Semester'} • {user?.expertiseLevel || 'Beginner'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              closeMobileMenu();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-750 hover:bg-gray-700 hover:text-white rounded-xl transition-all duration-200 border border-gray-600 hover:border-gray-500"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;