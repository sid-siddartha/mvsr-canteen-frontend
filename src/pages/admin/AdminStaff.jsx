import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  Search,
  UserPlus,
  X,
  Lock,
  User
} from 'lucide-react';
import LoadingButton from '../../components/common/LoadingButton';
import { TableRowSkeleton } from '../../components/feedback/LoadingState';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion confirm states
  const [deletingStaff, setDeletingStaff] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/staff');
      setStaff(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve staff listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setName('');
    setUsername('');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      toast.error('Please enter name, username, and password.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/staff', {
        name: name.trim(),
        username: username.toLowerCase().trim(),
        password
      });
      toast.success('Staff account created successfully!');
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create staff account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    try {
      await api.delete(`/admin/staff/${deletingStaff._id}`);
      toast.success('Staff account deleted successfully!');
      setDeletingStaff(null);
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete staff account.');
    }
  };

  const filteredStaff = staff.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Staff Management</h3>
            <p className="text-xs text-slate-400 mt-1">Manage kitchen operators, desk cashiers, and login permissions.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-20 shadow-md shadow-indigo-600/10 transition-colors"
          >
            <UserPlus size={14} /> Add Staff Account
          </button>
        </div>

        {/* Filters Panel */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff accounts..."
            className="w-full bg-white border border-slate-200 rounded-20 py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        {/* Staff Table Grid */}
        <div className="bg-white rounded-20 border border-slate-200/60 overflow-hidden shadow-soft">
          {loading ? (
            <div className="p-6">
              <TableRowSkeleton />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No staff accounts registered.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Username</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Created On</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50/20">
                      <td className="py-4 px-6 font-extrabold text-slate-800">{user.name}</td>
                      <td className="py-4 px-6 font-bold text-slate-500">{user.username}</td>
                      <td className="py-4 px-6">
                        <span className="text-[9px] font-bold py-1 px-2.5 rounded-full border text-indigo-600 bg-indigo-50 border-indigo-200/40">
                          Kitchen Staff
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-medium">
                        {new Date(user.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setDeletingStaff(user)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors inline-flex"
                          title="Remove staff account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Create Staff Account
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="p-5 space-y-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Employee Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-10 pr-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Login username */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Login Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. rahul123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-10 pr-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Temporary Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-10 pr-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-full text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-3 text-xs shadow-md shadow-indigo-600/10"
                  >
                    Create Account
                  </LoadingButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Staff Confirmation Modal */}
      <AnimatePresence>
        {deletingStaff && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto border border-red-100">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Delete Staff Account?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to remove <span className="font-bold text-slate-700">{deletingStaff.name}</span>? They will lose access to the kitchen dashboard instantly.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingStaff(null)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-full text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStaff}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full text-xs font-bold transition-all shadow-md shadow-red-600/10"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminStaff;
