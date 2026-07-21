import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  ChevronRight,
  Plus,
  Users,
  UtensilsCrossed,
  Tags,
  Receipt
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { AnalyticsCardSkeleton } from '../../components/feedback/LoadingState';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const res = await api.get('/admin/analytics');
      setData(res.data);

      // Fetch recent 5 orders
      const ordersRes = await api.get('/admin/orders?limit=5');
      setRecentOrders(ordersRes.data?.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <AdminLayout>
        <AnalyticsCardSkeleton />
      </AdminLayout>
    );
  }

  const { summary, categoryBreakdown, dailySales, paymentBreakdown } = data;

  // Format payment breakdown for Pie Chart
  const pieData = paymentBreakdown.map(item => ({
    name: item._id === 'Online' ? 'Online Payments' : 'Counter Cash',
    value: item.amount
  }));

  // Quick Stats config
  const stats = [
    { name: 'Today\'s Revenue', value: `₹${summary.totalRevenue}`, icon: DollarSign, color: 'bg-indigo-500/10 text-indigo-600' },
    { name: 'Total Orders', value: summary.ordersCount, icon: ShoppingBag, color: 'bg-cyan-500/10 text-cyan-600' },
    { name: 'Avg. Ticket Value', value: `₹${summary.aov}`, icon: TrendingUp, color: 'bg-emerald-500/10 text-emerald-600' },
    { name: 'Preparing Orders', value: summary.preparingOrders, icon: Clock, color: 'bg-amber-500/10 text-amber-600' }
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Canteen Overview</h3>
            <p className="text-xs text-slate-400 mt-1">Here is what is happening in the canteen shift today.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/menu')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-20 shadow-md shadow-indigo-600/10 transition-colors"
            >
              <Plus size={14} /> Add Menu Item
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-20 transition-colors"
            >
              Manage Orders
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.name}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Status Breakdown Section */}
        <div className="bg-white rounded-20 border border-slate-200/60 p-5 shadow-soft">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Live Cooking Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-20 border border-slate-100 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
              <span className="text-xl font-black text-indigo-600 mt-1">{summary.pendingOrders}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-20 border border-slate-100 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Preparing</span>
              <span className="text-xl font-black text-amber-500 mt-1">{summary.preparingOrders}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-20 border border-slate-100 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ready</span>
              <span className="text-xl font-black text-emerald-600 mt-1">{summary.readyOrders}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-20 border border-slate-100 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Served</span>
              <span className="text-xl font-black text-slate-600 mt-1">{summary.deliveredOrders}</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Area Sales Chart */}
          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft md:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Weekly Revenue Curve</h3>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Sales (Paid)</span>
            </div>
            <div className="h-64">
              {dailySales && dailySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="_id" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No sales logged in the past week.
                </div>
              )}
            </div>
          </div>

          {/* Payment Type Distribution */}
          <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Payment Mode share</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">UPI online transactions vs counter cash.</p>
            </div>
            <div className="h-44 relative flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-400">No payment data</span>
              )}
            </div>
            <div className="space-y-1.5">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-slate-700">₹{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories breakdown Bar chart */}
        <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft space-y-4">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Sales Revenue by Category</h3>
          <div className="h-56">
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="_id" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorical breakdown available.
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-20 border border-slate-200/60 overflow-hidden shadow-soft">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Recent Orders</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No orders placed in this shift yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate('/admin/orders')}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-extrabold text-indigo-600">{order.orderId}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{order.customerName}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium truncate max-w-xs">
                        {order.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Item'}`).join(', ')}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-800">₹{order.totalAmount}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border ${
                          order.paymentStatus === 'Paid'
                            ? 'text-success bg-green-50 border-green-200/40'
                            : 'text-amber-600 bg-amber-50 border-amber-200/40'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border ${
                          order.orderStatus === 'Delivered'
                            ? 'text-slate-600 bg-slate-50 border-slate-200'
                            : order.orderStatus === 'Ready'
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                            : order.orderStatus === 'Preparing'
                            ? 'text-amber-600 bg-amber-50 border-amber-200'
                            : 'text-indigo-600 bg-indigo-50 border-indigo-200'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
