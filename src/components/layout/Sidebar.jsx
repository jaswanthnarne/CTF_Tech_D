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
      icon: LayoutDashboard,
      description: 'Overview & Stats'
    },
    { 
      name: 'CTF Management', 
      href: '/admin/ctfs', 
      icon: Flag,
      description: 'Manage Challenges'
    },
    { 
      name: 'User Management', 
      href: '/admin/users', 
      icon: Users,
      description: 'User Accounts'
    },
    { 
      name: 'All Submissions', 
      href: '/admin/submissions', 
      icon: ClipboardList,
      description: 'View All Submissions'
    },
    { 
      name: 'Pending Review', 
      href: '/admin/submissions/pending', 
      icon: UserCheck,
      description: 'Awaiting Approval'
    },
    { 
      name: 'Submission Analytics', 
      href: '/admin/submission-analytics', 
      icon: TrendingUp,
      description: 'Submission Insights'
    },
    { 
      name: 'Platform Analytics', 
      href: '/admin/analytics', 
      icon: BarChart3,
      description: 'Platform Stats'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      description: 'System Config'
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
          className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg"
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
        w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen shadow-2xl
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-red-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-gray-800"></div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <p className="text-xs text-gray-400">Control Center</p>
            </div>
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
                  block px-4 py-3 rounded-xl transition-all duration-200 group
                  border border-transparent
                  ${active
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/25 border-red-500'
                    : 'text-gray-300 hover:bg-gray-750 hover:text-white hover:shadow-md hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center">
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                    active ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  </div>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="ml-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-700 bg-gray-850">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {admin?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-850"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {admin?.fullName || 'Administrator'}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {admin?.role || 'Admin'} Account
              </p>
              <p className="text-xs text-red-300 font-medium">
                Last login: {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              closeMobileMenu();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-750 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 border border-gray-600 hover:border-red-500 group"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;