import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Upload,
  Clock,
  Sparkles,
  Award,
  Flame,
  Check,
  X
} from 'lucide-react';
import LoadingButton from '../../components/common/LoadingButton';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { TableRowSkeleton } from '../../components/feedback/LoadingState';

const SORT_OPTIONS = [
  { label: 'Alphabetical (A-Z)', value: 'alpha' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'By Preparation Time', value: 'prep' }
];

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [vegFilter, setVegFilter] = useState('All');
  const [sortBy, setSortBy] = useState('alpha');

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means creating new

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState(10);
  const [isPopular, setIsPopular] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Deletion confirm states
  const [deletingItem, setDeletingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const menuRes = await api.get('/menu');
      setMenuItems(menuRes.data || []);

      const catRes = await api.get('/categories');
      setCategories(catRes.data || []);
      if (catRes.data?.length > 0 && !category) {
        setCategory(catRes.data[0].name);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync default category inside form when categories resolve
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories]);

  // Image compression utility
  const compressAndGetBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 480;
          const MAX_HEIGHT = 320;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setUploadProgress(10);
    try {
      // 1. Compress image locally
      const compressedBase64 = await compressAndGetBase64(file);
      setUploadProgress(40);

      // 2. Read presets from settings
      const cloudName = localStorage.getItem('canteenease_cloudinary_cloud_name');
      const preset = localStorage.getItem('canteenease_cloudinary_preset');

      if (cloudName && preset) {
        // Upload to Cloudinary
        setUploadProgress(60);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(60 + progress * 0.35); // map to 60-95% range
            }
          }
        );
        setImage(res.data.secure_url);
        toast.success('Image uploaded to Cloudinary successfully!');
      } else {
        // Fallback to storing compressed base64 directly
        setUploadProgress(85);
        setImage(compressedBase64);
        toast.success('Compressed image generated successfully (Local Storage mode).');
      }
      setUploadProgress(100);
    } catch (err) {
      console.error(err);
      toast.error('Image compression or upload failed.');
    } finally {
      setTimeout(() => {
        setUploadingImage(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice(0);
    if (categories.length > 0) setCategory(categories[0].name);
    setImage('');
    setIsVeg(true);
    setIsAvailable(true);
    setPrepTime(10);
    setIsPopular(false);
    setIsBestSeller(false);
    setIsChefSpecial(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setCategory(item.category);
    setImage(item.image);
    setIsVeg(item.isVeg);
    setIsAvailable(item.isAvailable);
    setPrepTime(item.prepTime || 10);
    setIsPopular(item.isPopular || false);
    setIsBestSeller(item.isBestSeller || false);
    setIsChefSpecial(item.isChefSpecial || false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !category || !image) {
      toast.error('Please fill in name, description, category, and upload an image.');
      return;
    }

    if (price < 0) {
      toast.error('Price cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        category,
        image,
        isVeg,
        isAvailable,
        prepTime: parseInt(prepTime) || 10,
        isPopular,
        isBestSeller,
        isChefSpecial
      };

      if (editingItem) {
        await api.patch(`/menu/${editingItem._id}`, payload);
        toast.success('Food item updated successfully!');
      } else {
        await api.post('/menu', payload);
        toast.success('Food item added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (item) => {
    try {
      const duplicatedItem = {
        name: `${item.name} (Copy)`,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        prepTime: item.prepTime || 10,
        isPopular: item.isPopular,
        isBestSeller: item.isBestSeller,
        isChefSpecial: item.isChefSpecial
      };
      await api.post('/menu', duplicatedItem);
      toast.success('Item duplicated successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate item.');
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      await api.delete(`/menu/${deletingItem._id}`);
      toast.success('Food item deleted successfully!');
      setDeletingItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete item.');
    }
  };

  // Bulk Actions
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredItems) => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item._id));
    }
  };

  const handleBulkToggle = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await api.patch('/menu/bulk-toggle', { ids: selectedIds, isAvailable: status });
      toast.success(`Bulk updated ${selectedIds.length} items to ${status ? 'Available' : 'Unavailable'}`);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Bulk status update failed.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected items?`)) {
      return;
    }
    try {
      await api.post('/menu/bulk-delete', { ids: selectedIds });
      toast.success(`Bulk deleted ${selectedIds.length} items successfully.`);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Bulk delete failed.');
    }
  };

  // Filtering & Sorting logic
  let filtered = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    let matchesAvailability = true;
    if (availabilityFilter === 'Available') matchesAvailability = item.isAvailable;
    if (availabilityFilter === 'Unavailable') matchesAvailability = !item.isAvailable;

    let matchesVeg = true;
    if (vegFilter === 'Veg') matchesVeg = item.isVeg;
    if (vegFilter === 'NonVeg') matchesVeg = !item.isVeg;

    return matchesSearch && matchesCategory && matchesAvailability && matchesVeg;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'alpha') return a.name.localeCompare(b.name);
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'prep') return (a.prepTime || 10) - (b.prepTime || 10);
    return 0;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Menu Management</h3>
            <p className="text-xs text-slate-400 mt-1">Configure dishes, pricing, promotional badges, and availability.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-20 shadow-md shadow-indigo-600/10 transition-colors"
          >
            <Plus size={14} /> Add Food Item
          </button>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search food by name..."
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-10 pr-4 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Category selection dropdown */}
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

            {/* Veg filter dropdown */}
            <div className="relative">
              <select
                value={vegFilter}
                onChange={(e) => setVegFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="All">Veg / Non-Veg</option>
                <option value="Veg">Veg only</option>
                <option value="NonVeg">Non-Veg only</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort options dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Bulk Actions Panel */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-20 p-3.5">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                {selectedIds.length} items selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkToggle(true)}
                  className="bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 font-bold text-xs py-1.5 px-3 rounded-full transition-colors"
                >
                  Enable Availability
                </button>
                <button
                  onClick={() => handleBulkToggle(false)}
                  className="bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 font-bold text-xs py-1.5 px-3 rounded-full transition-colors"
                >
                  Disable Availability
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-3 rounded-full transition-colors shadow-sm shadow-red-600/10"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-20 border border-slate-200/60 overflow-hidden shadow-soft">
          {loading ? (
            <div className="p-6">
              <TableRowSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No menu items match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                        onChange={() => toggleSelectAll(filtered)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="py-3.5 px-6">Food Details</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6">Prep. Time</th>
                    <th className="py-3.5 px-6">Promo Tags</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/40 transition-colors ${
                        !item.isAvailable ? 'bg-slate-50/20 opacity-70' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => toggleSelect(item._id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-20 border border-slate-200/60 overflow-hidden flex-shrink-0">
                            <ImageWithFallback src={item.image} alt={item.name} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800">{item.name}</span>
                              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                item.isVeg ? 'bg-green-600 border border-green-700' : 'bg-red-600 border border-red-700'
                              }`} title={item.isVeg ? 'Veg' : 'Non-Veg'} />
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-600">{item.category}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-800">₹{item.price}</td>
                      <td className="py-4 px-6 font-bold text-slate-500 flex items-center gap-1 mt-4">
                        <Clock size={12} className="text-slate-400" /> {item.prepTime || 10} min
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {item.isPopular && (
                            <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 py-0.5 px-1.5 rounded flex items-center gap-0.5">
                              <Sparkles size={8} /> Popular
                            </span>
                          )}
                          {item.isBestSeller && (
                            <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 py-0.5 px-1.5 rounded flex items-center gap-0.5">
                              <Award size={8} /> Best Seller
                            </span>
                          )}
                          {item.isChefSpecial && (
                            <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-50 py-0.5 px-1.5 rounded flex items-center gap-0.5">
                              <Flame size={8} /> Chef Special
                            </span>
                          )}
                          {!item.isPopular && !item.isBestSeller && !item.isChefSpecial && (
                            <span className="text-[9px] font-bold text-slate-300">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border ${
                          item.isAvailable
                            ? 'text-success bg-green-50 border-green-200/40'
                            : 'text-slate-500 bg-slate-50 border-slate-200'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(item)}
                            className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
                            title="Duplicate"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Food Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl my-8"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {editingItem ? 'Edit Food Item' : 'Add Food Item'}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Form Info */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600">Item Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Garlic Naan"
                        className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                      />
                    </div>

                    {/* Price & Prep Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600">Prep. Time (min)</label>
                        <input
                          type="number"
                          required
                          value={prepTime}
                          onChange={(e) => setPrepTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600">Category</label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
                        >
                          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600">Description</label>
                      <textarea
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details about taste, spices..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Image and Badges */}
                  <div className="space-y-4">
                    {/* Drag-n-drop Dropzone */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600">Food Image</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-20 p-5 text-center flex flex-col items-center justify-center min-h-[140px] cursor-pointer transition-colors ${
                          isDragOver ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-slate-50'
                        }`}
                        onClick={() => document.getElementById('food-img-input').click()}
                      >
                        <input
                          id="food-img-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.length > 0) handleImageUpload(e.target.files[0]);
                          }}
                        />

                        {image ? (
                          <div className="relative group w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                            <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[10px] text-white font-bold bg-slate-900/80 px-2 py-1 rounded">Replace Image</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} className="text-slate-400 mb-1.5" />
                            <span className="text-[10px] font-bold text-slate-500">Drag image here or click</span>
                            <span className="text-[8px] text-slate-400 mt-0.5">Supports PNG, JPG (compressed locally)</span>
                          </>
                        )}

                        {uploadingImage && (
                          <div className="w-full bg-slate-200 rounded-full h-1 mt-2.5 overflow-hidden">
                            <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Veg toggle & Available toggle */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-3 rounded-20">
                      <div className="flex flex-col gap-1 text-center justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Veg Status</span>
                        <button
                          type="button"
                          onClick={() => setIsVeg(!isVeg)}
                          className={`mt-1 py-1 px-3 text-[10px] font-black rounded-full border transition-all ${
                            isVeg
                              ? 'text-green-700 bg-green-50 border-green-200'
                              : 'text-red-700 bg-red-50 border-red-200'
                          }`}
                        >
                          {isVeg ? 'Vegetarian' : 'Non-Veg'}
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 text-center justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</span>
                        <button
                          type="button"
                          onClick={() => setIsAvailable(!isAvailable)}
                          className={`mt-1 py-1 px-3 text-[10px] font-black rounded-full border transition-all ${
                            isAvailable
                              ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                              : 'text-slate-500 bg-slate-100 border-slate-200'
                          }`}
                        >
                          {isAvailable ? 'Available' : 'Disabled'}
                        </button>
                      </div>
                    </div>

                    {/* Promotional badging checks */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promotional badges</span>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2.5 text-xs text-slate-600 font-bold select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPopular}
                            onChange={(e) => setIsPopular(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="flex items-center gap-1"><Sparkles size={12} className="text-indigo-500" /> Mark as Popular</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs text-slate-600 font-bold select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isBestSeller}
                            onChange={(e) => setIsBestSeller(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="flex items-center gap-1"><Award size={12} className="text-amber-500" /> Mark as Best Seller</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs text-slate-600 font-bold select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChefSpecial}
                            onChange={(e) => setIsChefSpecial(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="flex items-center gap-1"><Flame size={12} className="text-rose-500" /> Mark as Chef Special</span>
                        </label>
                      </div>
                    </div>
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
                    {editingItem ? 'Save Changes' : 'Add Food Item'}
                  </LoadingButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Item Confirmation Modal */}
      <AnimatePresence>
        {deletingItem && (
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
                <h3 className="text-sm font-extrabold text-slate-800">Delete Food Item?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-700">{deletingItem.name}</span>? This item will be permanently removed from the digital menu.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingItem(null)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-full text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
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

export default AdminMenu;
