import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Lock, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import LoadingButton from '../../components/common/LoadingButton';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem('canteenease_admin_token');
    const role = localStorage.getItem('canteenease_admin_role');
    if (token && role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', {
        username: username.toLowerCase().trim(),
        password
      });

      const { role, token, name } = res.data || res;

      if (role !== 'admin') {
        toast.error('Access Denied: Only administrators have access.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('canteenease_admin_token', token);
      localStorage.setItem('canteenease_admin_role', role);
      localStorage.setItem('canteenease_admin_name', name);
      
      // Also sync standard canteen ease token just in case
      localStorage.setItem('canteenease_token', token);

      toast.success(`Welcome back, Admin ${name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Page Entry Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl p-8 relative overflow-hidden">
          {/* Subtle top indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-20 bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto mb-4 border border-indigo-500/25">
              <ShieldCheck size={24} className="stroke-[2]" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">MVSREC Canteen Admin Console</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
              Please enter your administrator credentials to manage your canteen operations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="block text-xs font-bold text-slate-400">
                Administrator Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User size={16} />
                </span>
                <input
                  id="admin-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-20 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-bold text-slate-400">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-20 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Authorizing Admin..."
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-20 py-3.5 px-4 text-xs shadow-md shadow-indigo-600/20 mt-8"
            >
              Sign In to Dashboard
            </LoadingButton>
          </form>

          <div className="mt-8 text-center border-t border-slate-900 pt-5">
            <button
              onClick={() => navigate('/')}
              className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold transition-colors"
            >
              ← Back to Digital Menu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
