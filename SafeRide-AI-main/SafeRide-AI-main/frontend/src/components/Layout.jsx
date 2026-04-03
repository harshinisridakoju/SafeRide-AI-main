import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import { 
  Home, 
  Scan, 
  Map, 
  AlertTriangle, 
  User, 
  Settings,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  LogOut,
  Wrench,
  BarChart3,
  Users,
  FileText
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, connected } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'provider') {
      return [
        { name: 'Dashboard', href: '/app/provider/dashboard', icon: Home },
        { name: 'Requests', href: '/app/provider/requests', icon: FileText },
        { name: 'Profile', href: '/app/provider/profile', icon: User },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/app/admin/dashboard', icon: BarChart3 },
        { name: 'Users', href: '/app/admin/users', icon: Users },
        { name: 'Requests', href: '/app/admin/requests', icon: FileText },
        { name: 'Analytics', href: '/app/admin/analytics', icon: BarChart3 },
      ];
    }

    // Default user navigation
    return [
      { name: 'Home', href: '/app/home', icon: Home },
      { name: 'Scan', href: '/app/scan', icon: Scan },
      { name: 'Emergency', href: '/app/emergency', icon: AlertTriangle },
      { name: 'Requests', href: '/app/requests', icon: FileText },
      { name: 'Profile', href: '/app/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Wrench className="w-8 h-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">DriveGuardian</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Connection status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationDropdown(!notificationDropdown)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {notificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {new Date(notification.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
