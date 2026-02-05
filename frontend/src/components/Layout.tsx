import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Book, Calendar, LogOut, User, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './ProfileModal';

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/notebooks', icon: Book, label: 'Notebooks' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/weekly-reflection', icon: Sparkles, label: 'Weekly Reflection' },
    { path: '/thought-dump', icon: Brain, label: 'Thought Dump' },
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
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-white border-r border-primary-100 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Moir Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-serif font-bold text-sage-800">Moir.</h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-primary-500 hover:bg-primary-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info (Mini Profile) */}
          <div className="p-6 pb-2">
             <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center space-x-3 p-3 bg-sage-50 rounded-xl cursor-pointer hover:bg-sage-100 transition-colors"
             >
                <div className="bg-sage-200 p-0.5 rounded-full text-sage-700 w-10 h-10 overflow-hidden flex-shrink-0">
                    {user?.avatar ? (
                        <img 
                            src={user.avatar} 
                            alt={user.username} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User size={20} />
                        </div>
                    )}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-primary-900 truncate">
                        {user?.first_name || user?.username || 'Guest'}
                    </p>
                    <p className="text-xs text-primary-500 truncate">
                        {user?.occupation || user?.email}
                    </p>
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

          <div className="flex items-center gap-2">
             <img src="/logo.png" alt="Moir Logo" className="w-8 h-8 object-contain" />
             <span className="text-lg font-serif font-bold text-sage-800">Moir.</span>
          </div>
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


      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};

export default Layout;
