import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Settings,
  Cloud,
  Store,
  RefreshCw,
  Clock,
  ShieldAlert
} from 'lucide-react';
import LoadingButton from '../../components/common/LoadingButton';

const AdminSettings = () => {
  // Cloudinary Settings
  const [cloudName, setCloudName] = useState(() => localStorage.getItem('canteenease_cloudinary_cloud_name') || '');
  const [preset, setPreset] = useState(() => localStorage.getItem('canteenease_cloudinary_preset') || '');

  // Business Settings
  const [canteenName, setCanteenName] = useState(() => localStorage.getItem('canteenease_name') || 'CanteenEase');
  const [shiftHours, setShiftHours] = useState(() => localStorage.getItem('canteenease_shift_hours') || '08:00 AM - 08:00 PM');
  const [refreshInterval, setRefreshInterval] = useState(() => localStorage.getItem('canteenease_refresh_interval') || '15');

  const [savingCloud, setSavingCloud] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);

  const handleSaveCloudinary = () => {
    setSavingCloud(true);
    setTimeout(() => {
      localStorage.setItem('canteenease_cloudinary_cloud_name', cloudName.trim());
      localStorage.setItem('canteenease_cloudinary_preset', preset.trim());
      setSavingCloud(false);
      toast.success('Cloudinary credentials updated!');
    }, 600);
  };

  const handleSaveBusiness = () => {
    setSavingBusiness(true);
    setTimeout(() => {
      localStorage.setItem('canteenease_name', canteenName.trim());
      localStorage.setItem('canteenease_shift_hours', shiftHours.trim());
      localStorage.setItem('canteenease_refresh_interval', refreshInterval.trim());
      setSavingBusiness(false);
      toast.success('Business parameters updated!');
    }, 600);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Title */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Canteen Settings</h3>
          <p className="text-xs text-slate-400 mt-1">Configure business operating parameters, shifts, and image upload servers.</p>
        </div>

        {/* Cloudinary Config Card */}
        <div className="bg-white rounded-20 border border-slate-200/60 p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-20 bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Cloud size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800">Cloudinary Image Server</h4>
              <p className="text-[10px] text-slate-400">Configure remote upload server for food/category media files.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Cloud Name</label>
                <input
                  type="text"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  placeholder="e.g. dxyz12345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Unsigned Upload Preset</label>
                <input
                  type="text"
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  placeholder="e.g. canteenease_preset"
                  className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-20 p-4 border border-slate-200/40 flex gap-3 items-start">
              <ShieldAlert size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                <strong>Configuring uploads:</strong> If left blank, CanteenEase falls back to locally compressing images and storing base64 URLs in MongoDB. Fill these in if you want high-performance hosting on Cloudinary.
              </p>
            </div>

            <div className="pt-2">
              <LoadingButton
                onClick={handleSaveCloudinary}
                loading={savingCloud}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-2.5 px-6 text-xs font-bold shadow-md shadow-indigo-600/10 transition-colors"
              >
                Save Cloudinary Settings
              </LoadingButton>
            </div>
          </div>
        </div>

        {/* Business Operating Config Card */}
        <div className="bg-white rounded-20 border border-slate-200/60 p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-20 bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Store size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800">Business Parameters</h4>
              <p className="text-[10px] text-slate-400">Configure operating variables for the student ordering system.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">Canteen Name</label>
              <input
                type="text"
                value={canteenName}
                onChange={(e) => setCanteenName(e.target.value)}
                placeholder="e.g. CanteenEase Main"
                className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Operating Shift Hours</label>
                <input
                  type="text"
                  value={shiftHours}
                  onChange={(e) => setShiftHours(e.target.value)}
                  placeholder="e.g. 08:00 AM - 08:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Auto-refresh Orders Interval (seconds)</label>
                <input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-semibold focus:bg-white focus:outline-none transition-all focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <LoadingButton
                onClick={handleSaveBusiness}
                loading={savingBusiness}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-2.5 px-6 text-xs font-bold shadow-md shadow-indigo-600/10 transition-colors"
              >
                Save Business Settings
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
