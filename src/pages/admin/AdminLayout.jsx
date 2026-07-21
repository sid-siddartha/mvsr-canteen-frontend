import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Warehouse,
  Receipt,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import mvsrecLogo from '../../assets/mvsrec_logo.png';

const sidebarItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
  { name: 'Categories', path: '/admin/categories', icon: Tags },
  { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  { name: 'Orders', path: '/admin/orders', icon: Receipt },
  { name: 'Sales Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Staff Management', path: '/admin/staff', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings }
];

const AdminLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin Manager');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if authenticated
    const token = localStorage.getItem('canteenease_admin_token');
    const userRole = localStorage.getItem('canteenease_admin_role');
    const name = localStorage.getItem('canteenease_admin_name');

    if (!token || userRole !== 'admin') {
      toast.error('Session expired or access denied.');
      localStorage.removeItem('canteenease_admin_token');
      localStorage.removeItem('canteenease_admin_role');
      navigate('/admin/login');
    }

    if (name) {
      setAdminName(name);
    }
  }, [navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem('canteenease_admin_token');
    localStorage.removeItem('canteenease_admin_role');
    localStorage.removeItem('canteenease_admin_name');
    toast.success('Logged out successfully.');
    navigate('/admin/login');
  };

  const getPageTitle = () => {
    const activeItem = sidebarItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'Admin Panel';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Header Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-slate-800 p-0.5">
          <img src={mvsrecLogo} alt="MVSREC Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-white">MVSREC Canteen</h1>
          <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Admin Control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-20 text-xs font-bold transition-all relative ${
                isActive
                  ? 'text-white'
                  : 'hover:text-white hover:bg-slate-800/40 text-slate-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="adminSidebarActive"
                  className="absolute inset-0 bg-indigo-600/90 rounded-20 shadow-md shadow-indigo-600/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={16} className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
            <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Canteen Owner</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-slate-800/40 hover:bg-red-950/20 hover:text-red-400 text-xs font-bold text-slate-400 py-3 px-4 rounded-20 border border-slate-800 hover:border-red-950/40 transition-colors"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-slate-200">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 md:px-8 flex items-center justify-between">
          {/* Page Title & Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">{getPageTitle()}</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">
                MVSREC Canteen Management
              </p>
            </div>
          </div>

          {/* Quick Actions / Notifications */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 border border-slate-200 bg-white relative">
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 border border-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 hidden sm:block">{adminName}</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-extrabold text-xs">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Slide-over */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-64 shadow-2xl lg:hidden"
            >
              <SidebarContent />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
              >
                <X size={16} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
