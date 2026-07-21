import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Coffee, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingButton from '../components/common/LoadingButton';

const StaffLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/staff/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    const res = await login(username, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/staff/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border border-slate-100 shadow-premium rounded-20 p-6 md:p-8 relative"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-20 bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
            <Coffee size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-extrabold text-primary-text">MVSREC Canteen Staff Portal</h2>
          <p className="text-xs text-secondary-text mt-1">
            Sign in to process pending student orders and scan checkout codes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-xs font-bold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-secondary-text">
                <User size={16} />
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. staff)"
                className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-secondary-text">
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Login Button */}
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Logging in..."
            className="w-full bg-primary hover:bg-indigo-700 text-white rounded-20 py-3 px-4 text-xs shadow-md shadow-primary/20 mt-6"
          >
            Sign In
          </LoadingButton>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-5">
          <button
            onClick={() => navigate('/')}
            className="text-[11px] text-secondary-text hover:text-primary font-bold transition-colors"
          >
            ← Back to Digital Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StaffLogin;
