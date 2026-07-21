import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Tags,
  Coffee,
  Pizza,
  Utensils,
  IceCream,
  Percent,
  Search,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import LoadingButton from '../../components/common/LoadingButton';

const ICON_OPTIONS = {
  Coffee: Coffee,
  Pizza: Pizza,
  Utensils: Utensils,
  IceCream: IceCream,
  Percent: Percent,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null for create
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Coffee');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete states
  const [deletingCategory, setDeletingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Coffee');
    setIsActive(true);
    setOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Coffee');
    setIsActive(cat.isActive);
    setOrder(cat.order || 0);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon,
        isActive,
        order: parseInt(order) || 0
      };

      if (editingCategory) {
        // Update
        await api.patch(`/categories/${editingCategory._id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        // Create
        await api.post('/categories', payload);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await api.delete(`/categories/${deletingCategory._id}`);
      toast.success('Category deleted successfully!');
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete category.');
    }
  };

  const toggleCategoryStatus = async (cat) => {
    try {
      await api.patch(`/categories/${cat._id}`, { isActive: !cat.isActive });
      toast.success(`Category ${cat.name} ${!cat.isActive ? 'enabled' : 'disabled'}!`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error('Failed to change status.');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Categories list</h3>
            <p className="text-xs text-slate-400 mt-1">Manage food groupings and active category filters.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-20 shadow-md shadow-indigo-600/10 transition-colors"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-white border border-slate-200 rounded-20 py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200/60 rounded-20 p-5 space-y-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-slate-100 skeleton-shimmer rounded-full" />
                    <div className="h-3 w-1/4 bg-slate-100 skeleton-shimmer rounded-full" />
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-50 skeleton-shimmer rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-20 border border-slate-200/60 p-12 text-center max-w-md mx-auto shadow-soft">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Tags size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No categories found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters or click Add Category to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const IconComponent = ICON_OPTIONS[cat.icon] || Coffee;
              return (
                <div
                  key={cat._id}
                  className={`bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft flex flex-col justify-between transition-opacity ${
                    !cat.isActive ? 'opacity-65' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row Icon & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-20 bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                          <IconComponent size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{cat.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            Order Weight: {cat.order}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 min-h-[32px]">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => toggleCategoryStatus(cat)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        cat.isActive ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          cat.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CRUD Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Category Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Desserts"
                    className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief details about items in category..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Icon Selection & Sort Weight Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600">Lucide Icon</label>
                    <div className="relative">
                      <select
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
                      >
                        {Object.keys(ICON_OPTIONS).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600">Sort Weight Order</label>
                    <input
                      type="number"
                      required
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Active Slider */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-bold text-slate-600">Category Active Status</span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      isActive ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
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
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </LoadingButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deletingCategory && (
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
                <h3 className="text-sm font-extrabold text-slate-800">Delete Category?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-700">{deletingCategory.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingCategory(null)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-full text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
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

export default AdminCategories;
