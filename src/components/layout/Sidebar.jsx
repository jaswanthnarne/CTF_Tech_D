import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  BarChart3, 
  Settings,
  LogOut,
  CheckCircle,
  FileText,
  Menu,
  X,
  Shield,
  TrendingUp,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard
    },
    { 
      name: 'CTF Management', 
      href: '/admin/ctfs', 
      icon: Flag
    },
    { 
      name: 'User Management', 
      href: '/admin/users', 
      icon: Users
    },
    { 
      name: 'All Submissions', 
      href: '/admin/submissions', 
      icon: ClipboardList
    },
    { 
      name: 'Pending Review', 
      href: '/admin/submissions/pending', 
      icon: UserCheck
    },
    { 
      name: 'Submission Analytics', 
      href: '/admin/submission-analytics', 
      icon: TrendingUp
    },
    { 
      name: 'Platform Analytics', 
      href: '/admin/analytics', 
      icon: BarChart3
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
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
        w-64 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen border-r border-gray-700
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary-400" />
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  transition-all duration-200 group relative overflow-hidden
                  ${active
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                )}
                
                <Icon className={`mr-3 h-5 w-5 ${
                  active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`} />
                <span>{item.name}</span>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0 relative">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-white">
                  {admin?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {admin?.fullName || 'Administrator'}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {admin?.role || 'Admin'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              closeMobileMenu();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-750 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200 border border-gray-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;