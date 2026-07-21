import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Search,
  ChevronDown,
  Printer,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import LoadingButton from '../../components/common/LoadingButton';
import { TableRowSkeleton } from '../../components/feedback/LoadingState';

const STATUS_OPTIONS = ['Pending', 'Preparing', 'Ready', 'Delivered'];
const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Failed', 'Cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Details popover
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/admin/orders?page=${currentPage}&limit=10`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (statusFilter) url += `&orderStatus=${statusFilter}`;
      if (paymentFilter) url += `&paymentStatus=${paymentFilter}`;
      if (paymentMethodFilter) url += `&paymentMethod=${paymentMethodFilter}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await api.get(url);
      const { orders: ordersList, total, pages } = res.data || res;
      setOrders(ordersList || []);
      setTotalOrders(total || 0);
      setTotalPages(pages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, paymentFilter, paymentMethodFilter, startDate, endDate]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/admin/orders/${orderId}`, { orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}!`);
      
      // Update local states
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      if (viewingOrder && viewingOrder._id === orderId) {
        setViewingOrder(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/admin/orders/${orderId}`, { paymentStatus: newPaymentStatus });
      toast.success(`Payment updated to ${newPaymentStatus}!`);
      
      // Update local states
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      if (viewingOrder && viewingOrder._id === orderId) {
        setViewingOrder(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payment status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrintReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Token ${order.orderId}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 320px; margin: 0 auto; color: #1e293b; background-color: #ffffff; }
            .header { text-align: center; border-bottom: 2px dashed #94a3b8; padding-bottom: 12px; margin-bottom: 12px; }
            .header h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: bold; letter-spacing: 1px; }
            .header p { margin: 4px 0; font-size: 11px; color: #64748b; }
            .meta { margin-bottom: 12px; font-size: 11px; line-height: 1.5; color: #334155; }
            .item-list { border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
            .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; padding-top: 4px; color: #0f172a; }
            .footer { text-align: center; font-size: 10px; color: #64748b; margin-top: 24px; border-top: 2px dashed #94a3b8; padding-top: 12px; }
            .footer p { margin: 2px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>CanteenEase</h3>
            <p>COLLEGE DIGITAL CANTEEN</p>
            <p>Date: ${new Date(order.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', dateStyle: 'short' })}</p>
          </div>
          <div class="meta">
            <div><strong>Token No:</strong> ${order.orderId}</div>
            <div><strong>Customer:</strong> ${order.customerName}</div>
            <div><strong>Method:</strong> ${order.paymentMethod === 'Online' ? 'Online Paid' : 'Cash Counter'}</div>
            <div><strong>Status:</strong> ${order.paymentStatus}</div>
          </div>
          <div class="item-list">
            ${order.items.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.menuItem?.name || 'Food item'}</span>
                <span>₹${item.price * item.quantity}</span>
              </div>
            `).join('')}
          </div>
          <div class="total">
            <span>Grand Total</span>
            <span>₹${order.totalAmount}</span>
          </div>
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>Show token at pickup counter.</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Orders Panel</h3>
          <p className="text-xs text-slate-400 mt-1">Supervise incoming transactions, update kitchen staging, and print invoices.</p>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-20 p-5 border border-slate-200/60 shadow-soft space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* Search */}
            <div className="relative md:col-span-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Order ID, Customer Name..."
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-10 pr-4 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">All Order Statuses</option>
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
              <select
                value={paymentFilter}
                onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">All Payment Statuses</option>
                {PAYMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Payment Method Filter */}
            <div className="relative">
              <select
                value={paymentMethodFilter}
                onChange={(e) => { setPaymentMethodFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-20 py-2.5 pl-4 pr-10 text-xs font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">All Methods</option>
                <option value="Cash">Counter Cash</option>
                <option value="Online">Online Payments</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date range row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
              <Calendar size={13} /> Filter Dates:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200/60 rounded-lg p-1.5 focus:outline-none text-[11px] font-bold"
              />
              <span className="font-medium text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200/60 rounded-lg p-1.5 focus:outline-none text-[11px] font-bold"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
                className="text-indigo-600 hover:text-indigo-700 font-bold ml-auto hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-20 border border-slate-200/60 overflow-hidden shadow-soft">
          {loading ? (
            <div className="p-6">
              <TableRowSkeleton />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No orders matched the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Method</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6">Order Status</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/30 cursor-pointer"
                      onClick={() => setViewingOrder(order)}
                    >
                      <td className="py-4 px-6 font-extrabold text-indigo-600">{order.orderId}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(order.createdAt).toLocaleDateString([], { dateStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">{order.customerName}</td>
                      <td className="py-4 px-6 text-slate-500 font-semibold">
                        {order.paymentMethod === 'Online' ? 'UPI' : 'Cash'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border ${
                          order.paymentStatus === 'Paid'
                            ? 'text-success bg-green-50 border-green-200/40'
                            : order.paymentStatus === 'Cancelled'
                            ? 'text-red-600 bg-red-50 border-red-200/40'
                            : 'text-amber-600 bg-amber-50 border-amber-200/40'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[9px] font-bold py-1 px-2.5 rounded-full border ${
                          order.orderStatus === 'Delivered'
                            ? 'text-slate-500 bg-slate-50 border-slate-200'
                            : order.orderStatus === 'Ready'
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                            : order.orderStatus === 'Preparing'
                            ? 'text-amber-600 bg-amber-50 border-amber-200'
                            : 'text-indigo-600 bg-indigo-50 border-indigo-200'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePrintReceipt(order)}
                            className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
                            title="Print thermal receipt"
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Orders: {totalOrders}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 rounded-full bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-bold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 rounded-full bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Slideover Panel */}
      <AnimatePresence>
        {viewingOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingOrder(null)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Slide Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Order: {viewingOrder.orderId}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Order Detail Pane</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Meta details */}
                <div className="bg-slate-50 rounded-20 p-4 border border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Customer:</span>
                    <span className="text-slate-800 font-bold flex items-center gap-1"><User size={12} /> {viewingOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Timestamp:</span>
                    <span className="text-slate-800 font-semibold">{new Date(viewingOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Payment Mode:</span>
                    <span className="text-slate-800 font-bold">{viewingOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                    Items List
                  </span>
                  <div className="space-y-3">
                    {viewingOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs items-center">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-800">{item.menuItem?.name || 'Food item'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Qty: {item.quantity} x ₹{item.price}</p>
                        </div>
                        <span className="font-extrabold text-slate-800">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-black text-slate-800">
                    <span>Grand Total</span>
                    <span className="text-indigo-600 text-base">₹{viewingOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Staging actions */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {/* Order Stage controls */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Kitchen Preparation Status</label>
                    <div className="grid grid-cols-4 gap-1.5 bg-slate-50 border border-slate-200/40 p-1 rounded-full">
                      {STATUS_OPTIONS.map(status => {
                        const isActive = viewingOrder.orderStatus === status;
                        return (
                          <button
                            key={status}
                            disabled={isUpdatingStatus}
                            onClick={() => handleUpdateOrderStatus(viewingOrder._id, status)}
                            className={`py-1.5 rounded-full text-[9px] font-bold transition-all ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment stage controls */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Payment Collection Status</label>
                    <div className="grid grid-cols-4 gap-1.5 bg-slate-50 border border-slate-200/40 p-1 rounded-full">
                      {PAYMENT_STATUS_OPTIONS.map(status => {
                        const isActive = viewingOrder.paymentStatus === status;
                        return (
                          <button
                            key={status}
                            disabled={isUpdatingStatus}
                            onClick={() => handleUpdatePaymentStatus(viewingOrder._id, status)}
                            className={`py-1.5 rounded-full text-[9px] font-bold transition-all ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Print in pane */}
              <div className="p-5 border-t border-slate-100">
                <button
                  onClick={() => handlePrintReceipt(viewingOrder)}
                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-3 px-4 text-xs font-bold shadow-md shadow-indigo-600/10 transition-colors"
                >
                  <Printer size={14} /> Print Thermal Receipt
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminOrders;
