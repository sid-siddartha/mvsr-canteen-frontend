import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse,
  Search,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import LoadingButton from '../../components/common/LoadingButton';
import { TableRowSkeleton } from '../../components/feedback/LoadingState';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    try {
      const menuRes = await api.get('/menu');
      setItems(menuRes.data || []);

      const catRes = await api.get('/categories');
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve inventory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = !item.isAvailable;
      await api.patch(`/menu/${item._id}`, { isAvailable: newStatus });
      toast.success(`${item.name} is now ${newStatus ? 'Available' : 'Unavailable'}`);
      
      // Update local state directly to prevent full loader blink
      setItems(prev =>
        prev.map(i => i._id === item._id ? { ...i, isAvailable: newStatus } : i)
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update item availability.');
    }
  };

  const handleResetAllInventory = async () => {
    setIsResetting(true);
    try {
      const itemIds = items.map(i => i._id);
      if (itemIds.length > 0) {
        await api.patch('/menu/bulk-toggle', { ids: itemIds, isAvailable: true });
        toast.success('Successfully marked all menu items as Available!');
        setShowResetConfirm(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to reset inventory.');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    let matchesAvailability = true;
    if (availabilityFilter === 'Available') matchesAvailability = item.isAvailable;
    if (availabilityFilter === 'Unavailable') matchesAvailability = !item.isAvailable;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Canteen Inventory</h3>
            <p className="text-xs text-slate-400 mt-1">Live toggle food stock levels. Mark dishes as sold-out instantly.</p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-4 rounded-20 shadow-md shadow-amber-600/10 transition-colors"
          >
            <RefreshCw size={13} className="animate-spin-slow" /> Reset All Available
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu items..."
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-9 pr-4 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Category selection */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Availability filter */}
            <div className="relative">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="All">All Stock Levels</option>
                <option value="Available">Available items</option>
                <option value="Unavailable">Sold Out / Unavailable</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Inventory Table Grid */}
        <div className="bg-white rounded-20 border border-slate-200/60 overflow-hidden shadow-soft">
          {loading ? (
            <div className="p-6">
              <TableRowSkeleton />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No items match current search or filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Food Name</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6">Live Status</th>
                    <th className="py-3.5 px-6 text-center">Availability Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/40 transition-colors ${
                        !item.isAvailable ? 'opacity-70 bg-slate-50/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-extrabold text-slate-800">{item.name}</td>
                      <td className="py-4 px-6 font-bold text-slate-500">{item.category}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-800">₹{item.price}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border ${
                          item.isAvailable
                            ? 'text-success bg-green-50 border-green-200/40'
                            : 'text-red-600 bg-red-50 border-red-200/40'
                        }`}>
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`py-1.5 px-4 rounded-full text-[10px] font-extrabold transition-all border ${
                            item.isAvailable
                              ? 'text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200/60 bg-white'
                              : 'text-indigo-600 hover:text-indigo-700 bg-indigo-50 border-indigo-200/40'
                          }`}
                        >
                          {item.isAvailable ? 'Mark as Out of Stock' : 'Mark as Available'}
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

      {/* Safety Reset Confirm Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mx-auto border border-amber-100">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Reset Canteen Inventory?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This will bulk toggle <span className="font-bold text-slate-700">every single item</span> on the digital menu to <span className="font-bold text-slate-700">Available (In Stock)</span>. Use this to prepare for new canteen shifts.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-full text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleResetAllInventory}
                  loading={isResetting}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-full py-2.5 text-xs font-bold transition-all"
                >
                  Reset Stock Levels
                </LoadingButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminInventory;
