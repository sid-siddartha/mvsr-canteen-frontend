import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/exportUtils';
import { motion } from 'framer-motion';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Activity,
  Printer,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { AnalyticsCardSkeleton } from '../../components/feedback/LoadingState';

const BAR_COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve sales analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportSalesCSV = () => {
    if (!data || !data.dailySales) return;
    const formatted = data.dailySales.map(item => ({
      Date: item._id,
      'Revenue Generated (₹)': item.revenue,
      'Orders Received': item.count
    }));
    exportToCSV(formatted, `canteen_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Sales report exported!');
  };

  const handleExportTopFoodsCSV = () => {
    if (!data || !data.topFoods) return;
    const formatted = data.topFoods.map(item => ({
      'Food Item': item._id,
      'Quantity Sold': item.quantity,
      'Total Revenue (₹)': item.revenue
    }));
    exportToCSV(formatted, `canteen_top_selling_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Product sales report exported!');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <AdminLayout>
        <AnalyticsCardSkeleton />
      </AdminLayout>
    );
  }

  const { summary, dailySettle, categoryBreakdown, topFoods, hourlyTraffic, dailySales } = data;

  return (
    <AdminLayout>
      <div className="space-y-6 print:p-6 print:space-y-8">
        {/* Header Action row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Sales Analytics</h3>
            <p className="text-xs text-slate-400 mt-1">Detailed performance timelines, categorical sales, and report exports.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportSalesCSV}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-20 transition-colors"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" /> Export Sales CSV
            </button>
            <button
              onClick={handleExportTopFoodsCSV}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-20 transition-colors"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" /> Export Products CSV
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-20 shadow-md shadow-indigo-600/10 transition-colors"
            >
              <Printer size={14} /> Print PDF Report
            </button>
          </div>
        </div>

        {/* Analytics Summary Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Sales</span>
            <span className="text-xl font-black text-slate-800 mt-2 block">₹{summary.totalRevenue}</span>
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-3 inline-block">Shift Net</span>
          </div>

          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Orders Placed</span>
            <span className="text-xl font-black text-slate-800 mt-2 block">{summary.ordersCount}</span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-3 inline-block">Served total</span>
          </div>

          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unique Customers</span>
            <span className="text-xl font-black text-slate-800 mt-2 block">{summary.totalUniqueCustomers}</span>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-3 inline-block">Callout profiles</span>
          </div>

          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Repeat Customers</span>
            <span className="text-xl font-black text-slate-800 mt-2 block">{summary.repeatCustomers}</span>
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-3 inline-block">
              {summary.totalUniqueCustomers > 0
                ? `${Math.round((summary.repeatCustomers / summary.totalUniqueCustomers) * 100)}% ratio`
                : '0% ratio'}
            </span>
          </div>
        </div>

        {/* Dynamic charts grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline Curve */}
          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Revenue Timeline</h3>
            <div className="h-60">
              {dailySales && dailySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSalesAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="_id" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesAnalytics)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No timeline data.</div>
              )}
            </div>
          </div>

          {/* Peak Hours LineChart */}
          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Peak Ordering hours (24h)</h3>
            <div className="h-60">
              {hourlyTraffic && hourlyTraffic.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={9} tickLine={false} tickFormatter={(h) => `${h}:00`} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2.5} activeDot={{ r: 6 }} name="Orders Placed" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No hourly logs.</div>
              )}
            </div>
          </div>
        </div>

        {/* Product performance split table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top 10 Products table list */}
          <div className="bg-white rounded-20 border border-slate-200/60 shadow-soft md:col-span-2 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Top Selling Dishes</h3>
              </div>
              <div className="overflow-x-auto">
                {topFoods.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">No food sales registered yet.</p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-5">Dish</th>
                        <th className="py-3 px-5">Qty Sold</th>
                        <th className="py-3 px-5">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topFoods.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="py-3 px-5 font-extrabold text-slate-700">{item._id}</td>
                          <td className="py-3 px-5 font-bold text-slate-500">{item.quantity} units</td>
                          <td className="py-3 px-5 font-extrabold text-slate-800">₹{item.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Categories share stats list */}
          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Categorical share</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Split revenue shares by category.</p>
            </div>
            
            <div className="space-y-4">
              {categoryBreakdown.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No data</p>
              ) : (
                categoryBreakdown.map((item, idx) => {
                  const percentage = summary.totalRevenue > 0 ? Math.round((item.revenue / summary.totalRevenue) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>{item._id}</span>
                        <span className="text-slate-800">₹{item.revenue} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BAR_COLORS[idx % BAR_COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
