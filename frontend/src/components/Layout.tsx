import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Book, Calendar, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/notebooks', icon: Book, label: 'Notebooks' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-primary-100 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-primary-100 flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold text-sage-800">Moir.</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-primary-500 hover:bg-primary-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info (Mini Profile) */}
          <div className="p-6 pb-2">
             <div className="flex items-center space-x-3 p-3 bg-sage-50 rounded-xl">
                <div className="bg-sage-200 p-2 rounded-full text-sage-700">
                    <User size={20} />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-primary-900 truncate">{user?.username || 'Guest'}</p>
                    <p className="text-xs text-primary-500 truncate">{user?.email}</p>
                </div>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-sage-600 text-white shadow-md shadow-sage-200'
                      : 'text-primary-600 hover:bg-sage-50 hover:text-sage-700'
                  }`
                }
              >
                <item.icon
                  size={20}
                  className={`mr-3 transition-colors ${
                     location.pathname === item.path ? 'text-white' : 'text-primary-400 group-hover:text-sage-600'
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-primary-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-primary-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors duration-200"
            >
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-primary-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-primary-500 hover:bg-primary-50 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-serif font-bold text-sage-800">Moir.</span>
          <div className="w-8" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
           <AnimatePresence mode='wait'>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto"
            >
                <Outlet />
            </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
