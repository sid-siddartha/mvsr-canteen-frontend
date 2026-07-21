import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Coffee, LogOut, RefreshCw, QrCode, ClipboardList, Check, User, Clock, Trash2, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import LoadingButton from '../components/common/LoadingButton';

// Skeletons import
import { DashboardTicketsSkeleton, AnalyticsCardSkeleton } from '../components/feedback/LoadingState';

const StaffDashboard = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [isLoadingScanned, setIsLoadingScanned] = useState(false);
  const [scannedHistory, setScannedHistory] = useState([]);
  const [deliveringOrderId, setDeliveringOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [slowLoadingText, setSlowLoadingText] = useState('');

  const scannerRef = useRef(null);
  const navigate = useNavigate();

  // Load scanned history on user change
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`canteenease_scanned_${user.username}`);
      if (saved) {
        setScannedHistory(JSON.parse(saved));
      }
    }
  }, [user]);

  // Helper to add order to scanned history
  const addToHistory = (order) => {
    if (!order) return;
    setScannedHistory((prev) => {
      const filtered = prev.filter((o) => o._id !== order._id);
      const updated = [order, ...filtered].slice(0, 10); // Limit to last 10 tickets
      if (user) {
        localStorage.setItem(`canteenease_scanned_${user.username}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/staff/login');
    }
  }, [user, authLoading, navigate]);

  const [isServerOffline, setIsServerOffline] = useState(false);

  // Fetch pending orders
  const fetchPendingOrders = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await api.get('/orders/pending');
      setOrders(res.data);
      setIsServerOffline(false); // Reset offline status on success
    } catch (err) {
      console.error(err);
      if (err.isNetworkError) {
        setIsServerOffline(true);
      } else {
        toast.error(err.message || 'Failed to load pending orders.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingOrders();
      // Set up polling to check for new orders every 10 seconds
      const interval = setInterval(() => {
        fetchPendingOrders();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Set up slow network response warnings (2s and 5s marks)
  useEffect(() => {
    let timer2, timer5;
    if (loading) {
      timer2 = setTimeout(() => {
        setSlowLoadingText('Fetching the latest information...');
      }, 2000);
      timer5 = setTimeout(() => {
        setSlowLoadingText('This is taking longer than expected...');
      }, 5000);
    } else {
      setSlowLoadingText('');
    }
    return () => {
      clearTimeout(timer2);
      clearTimeout(timer5);
    };
  }, [loading]);

  // Mark an order as delivered
  const markAsDelivered = async (orderId) => {
    setDeliveringOrderId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/deliver`);
      toast.success('Order marked as delivered!');
      fetchPendingOrders();
      setScannedOrder(null); // Close detail modal if open
      addToHistory(res.data); // Add manually processed order to history
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status.');
    } finally {
      setDeliveringOrderId(null);
    }
  };

  // Handle successful QR scan
  const handleScanSuccess = async (decodedText) => {
    // The scanned text should be the orderId (token)
    if (!decodedText) return;
    
    // Play a beep sound if possible
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 1000;
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio feedback not supported');
    }

    setIsScannerOpen(false);
    setIsLoadingScanned(true);

    try {
      const res = await api.post('/orders/scan', { code: decodedText });
      setScannedOrder(res.data);
      addToHistory(res.data); // Add to history
      toast.success(`Success: Ticket ${decodedText} processed!`);
      fetchPendingOrders(); // Refresh order queue
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Scanned order details could not be found.';
      toast.error(message, { duration: 5000 });
    } finally {
      setIsLoadingScanned(false);
    }
  };

  // Initialize and clean up scanner
  useEffect(() => {
    if (isScannerOpen) {
      // Delay scanner setup slightly to ensure container is rendered
      const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          'qr-reader-element',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            handleScanSuccess(decodedText);
            scanner.clear().catch(err => console.error('Failed to clear scanner', err));
          },
          (error) => {
            // Quietly ignore scan failures (common when search has no QR in frame)
          }
        );

        scannerRef.current = scanner;
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error('Failed to clear scanner on unmount', err));
        }
      };
    }
  }, [isScannerOpen]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-secondary-text">Checking authentication...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Staff Header */}
      <header className="sticky top-0 z-40 glass-header px-4 py-3 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-20 bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardList size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-primary-text">Staff Dashboard</h1>
              <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">
                Logged in as: {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchPendingOrders(true)}
              className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-secondary-text relative"
              title="Refresh"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-extrabold text-error border border-error/15 bg-error/5 py-2 px-3 rounded-full hover:bg-error hover:text-white transition-all"
              title="Sign Out"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Connection State Alert Bar */}
      {isServerOffline && (
        <div className="bg-amber-500 text-white text-[11px] font-bold py-2.5 px-4 text-center animate-pulse flex items-center justify-center gap-1.5 z-50">
          <span>⚠️ Connection to canteen server lost. Trying to reconnect...</span>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-20 p-4 border border-slate-100 shadow-soft">
            <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">Pending Orders</p>
            <p className="text-xl font-extrabold text-primary mt-1">{orders.length}</p>
          </div>
          <div className="bg-white rounded-20 p-4 border border-slate-100 shadow-soft">
            <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">Kitchen Status</p>
            <p className="text-xl font-extrabold text-success mt-1">Online</p>
          </div>
          <div className="bg-white rounded-20 p-4 border border-slate-100 shadow-soft">
            <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">Payment Mode</p>
            <p className="text-xl font-extrabold text-amber-500 mt-1">Cash Only</p>
          </div>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="col-span-2 md:col-span-1 bg-slate-900 border border-slate-800 text-white rounded-20 p-4 flex items-center justify-between shadow-soft hover:bg-slate-850 transition-colors text-left"
          >
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Action</p>
              <p className="text-sm font-extrabold mt-1">Scan Customer QR</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center text-slate-400 border border-slate-800">
              <QrCode size={20} />
            </div>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 relative">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative transition-colors ${
              activeTab === 'tickets' ? 'text-primary' : 'text-slate-500 hover:text-primary-text'
            }`}
          >
            Pending Tickets ({orders.length})
            {activeTab === 'tickets' && (
              <motion.div
                layoutId="dashboardTabLine"
                className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"
              />
            )}
          </button>
          
          <button
            onClick={() => {
              setActiveTab('analytics');
              setAnalyticsLoading(true);
              const timer = setTimeout(() => {
                setAnalyticsLoading(false);
              }, 800);
              return () => clearTimeout(timer);
            }}
            className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative transition-colors ${
              activeTab === 'analytics' ? 'text-primary' : 'text-slate-500 hover:text-primary-text'
            }`}
          >
            Shift Analytics
            {activeTab === 'analytics' && (
              <motion.div
                layoutId="dashboardTabLine"
                className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>

        {activeTab === 'tickets' ? (
          <>
            {/* Pending Orders Section */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-primary-text uppercase tracking-wider">
                Pending Tickets ({orders.length})
              </h2>
              <span className="text-[10px] text-secondary-text font-medium bg-slate-100 py-1 px-3 rounded-full">
                Auto-refresh active (10s)
              </span>
            </div>

            {slowLoadingText && (
              <div className="mb-6 text-center py-2.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-full animate-pulse border border-slate-200/40 max-w-sm mx-auto">
                {slowLoadingText}
              </div>
            )}

            {loading ? (
              <DashboardTicketsSkeleton />
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-20 border border-slate-100 p-12 text-center max-w-md mx-auto shadow-soft mt-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-secondary-text mb-4">
                  <ClipboardList size={28} />
                </div>
                <h3 className="text-base font-bold text-primary-text mb-1">All caught up!</h3>
                <p className="text-xs text-secondary-text">
                  There are currently no pending orders. New student orders will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {orders.map((order) => {
                  const minutesAgo = Math.floor(
                    (new Date() - new Date(order.createdAt)) / 60000
                  );
                  return (
                    <motion.div
                      layout
                      key={order._id}
                      className="bg-white rounded-20 p-5 border border-slate-100 hover:border-slate-200 shadow-soft flex flex-col justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-primary">{order.orderId}</span>
                            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-secondary-text">
                              Unpaid
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-secondary-text">
                            <Clock size={12} />
                            <span>{minutesAgo <= 0 ? 'Just now' : `${minutesAgo}m ago`}</span>
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="flex items-center gap-2 text-xs font-bold text-primary-text mb-3">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={12} />
                          </div>
                          <span>{order.customerName}</span>
                        </div>

                        {/* Item list */}
                        <div className="space-y-1.5 pl-8 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-xs text-secondary-text flex justify-between font-medium">
                              <span>
                                {item.quantity}x {item.menuItem?.name || 'Deleted Item'}
                              </span>
                              <span className="text-primary-text font-bold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                        <div>
                          <p className="text-[9px] text-secondary-text uppercase font-bold tracking-wider">Amount Due</p>
                          <p className="text-sm font-extrabold text-primary-text">₹{order.totalAmount}</p>
                        </div>

                        <LoadingButton
                          onClick={() => markAsDelivered(order._id)}
                          loading={deliveringOrderId === order._id}
                          loadingText="Updating..."
                          icon={Check}
                          className="bg-success hover:bg-green-600 text-white text-xs py-2.5 px-4 rounded-full shadow-sm shadow-success/15"
                        >
                          Deliver & Pay
                        </LoadingButton>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Shift Analytics View */
          analyticsLoading ? (
            <AnalyticsCardSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats metric boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-20 p-5 border border-slate-100 shadow-soft">
                  <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">Today's Shift Sales</p>
                  <p className="text-2xl font-black text-primary-text mt-1.5">₹12,450</p>
                  <p className="text-[10px] text-success font-bold mt-1.5 flex items-center gap-1">
                    <span>↑ +12.4%</span>
                    <span className="text-slate-400 font-medium">vs yesterday</span>
                  </p>
                </div>
                <div className="bg-white rounded-20 p-5 border border-slate-100 shadow-soft">
                  <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">Orders Processed</p>
                  <p className="text-2xl font-black text-primary-text mt-1.5">84</p>
                  <p className="text-[10px] text-success font-bold mt-1.5 flex items-center gap-1">
                    <span>↑ +8.2%</span>
                    <span className="text-slate-400 font-medium">vs yesterday</span>
                  </p>
                </div>
                <div className="bg-white rounded-20 p-5 border border-slate-100 shadow-soft">
                  <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">Avg. Serving Time</p>
                  <p className="text-2xl font-black text-primary-text mt-1.5">8.4 min</p>
                  <p className="text-[10px] text-success font-bold mt-1.5 flex items-center gap-1">
                    <span>↓ -1.5m</span>
                    <span className="text-slate-400 font-medium">better served</span>
                  </p>
                </div>
              </div>

              {/* Flex Chart */}
              <div className="bg-white rounded-20 p-6 border border-slate-100 shadow-soft">
                <h3 className="text-xs font-extrabold text-primary-text uppercase tracking-wider mb-4">Hourly Order Load</h3>
                <div className="h-48 flex items-end gap-3 pt-6 px-4">
                  {[35, 60, 45, 80, 50, 95, 70, 40, 85, 65, 55, 90].map((height, i) => (
                    <div key={i} className="flex-1 bg-slate-100 hover:bg-primary/20 rounded-t-lg transition-colors flex flex-col justify-end h-full relative group cursor-pointer">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold pointer-events-none z-10 whitespace-nowrap">
                        {Math.floor(height / 4)} orders
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.03, duration: 0.45, ease: 'easeOut' }}
                        className="w-full bg-primary rounded-t-lg group-hover:bg-indigo-600"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-50 mt-2 text-[9px] font-bold text-secondary-text uppercase tracking-widest px-2">
                  <span>9 AM</span>
                  <span>11 AM</span>
                  <span>1 PM</span>
                  <span>3 PM</span>
                  <span>5 PM</span>
                  <span>7 PM</span>
                </div>
              </div>

              {/* Lists and payment gauges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-20 p-5 border border-slate-100 shadow-soft space-y-4">
                  <h3 className="text-xs font-extrabold text-primary-text uppercase tracking-wider">Top Items Sold</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Vanilla Ice Cream Coffee', qty: 32 },
                      { name: 'Crispy Veg Burger', qty: 24 },
                      { name: 'French Fries Extra Crispy', qty: 18 },
                      { name: 'Fresh Mint Mojito', qty: 10 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">
                          <span className="text-primary font-bold mr-1">{idx+1}.</span> {item.name}
                        </span>
                        <span className="font-bold text-primary-text">{item.qty} units</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-20 p-5 border border-slate-100 shadow-soft space-y-4">
                  <h3 className="text-xs font-extrabold text-primary-text uppercase tracking-wider">Payment Mode Breakdown</h3>
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Online UPI Payments</span>
                        <span className="font-bold text-primary">65% (₹8,092)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '65%' }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Counter Cash Payments</span>
                        <span className="font-bold text-slate-700">35% (₹4,358)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '35%' }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="h-full bg-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}

        {/* Recently Scanned Tickets History Section */}
        <div className="mt-12 pt-8 border-t border-slate-200/60">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-primary-text uppercase tracking-wider">
              Recent Scanned Tickets ({scannedHistory.length})
            </h2>
            {scannedHistory.length > 0 && (
              <button
                onClick={() => {
                  setScannedHistory([]);
                  if (user) {
                    localStorage.removeItem(`canteenease_scanned_${user.username}`);
                  }
                }}
                className="text-[10px] text-error font-bold flex items-center gap-1 hover:underline"
              >
                <Trash2 size={12} /> Clear History
              </button>
            )}
          </div>

          {scannedHistory.length === 0 ? (
            <div className="bg-white rounded-20 border border-slate-100 p-8 text-center max-w-sm mx-auto shadow-soft">
              <p className="text-xs text-secondary-text">
                No tickets processed in this shift yet. Scanned or completed orders will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {scannedHistory.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setScannedOrder(order)}
                  className="bg-white rounded-20 p-4 border border-slate-100 hover:border-primary/25 cursor-pointer shadow-soft transition-all flex items-center justify-between hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-success border border-green-200/40">
                      <Check size={16} className="stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-primary-text">{order.orderId}</p>
                      <p className="text-[10px] text-secondary-text font-semibold line-clamp-1">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-primary-text">₹{order.totalAmount}</p>
                    <p className="text-[9px] text-success font-bold uppercase tracking-wider mt-0.5">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Scanner Modal Overlay */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-20 max-w-sm w-full overflow-hidden shadow-2xl relative border border-slate-200"
            >
              {/* Scanner Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-primary" />
                  <span className="text-xs font-extrabold text-primary-text">Scan Student Token</span>
                </div>
                <button
                  onClick={() => setIsScannerOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-secondary-text"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Reader viewport */}
              <div className="p-6 flex flex-col items-center">
                <div className="w-full aspect-square bg-slate-100 rounded-20 overflow-hidden border border-slate-200 relative mb-4">
                  {/* Camera feed placeholder style container */}
                  <div id="qr-reader-element" className="w-full h-full" />
                </div>
                <p className="text-[10px] text-secondary-text text-center leading-relaxed max-w-[250px]">
                  Place the order's QR code on the student's screen in front of the camera viewport.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Scanned Overlay */}
      {isLoadingScanned && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-20 p-6 flex flex-col items-center justify-center shadow-lg border border-slate-100">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-primary-text">Fetching order details...</p>
          </div>
        </div>
      )}

      {/* Scanned Order Details Modal */}
      <AnimatePresence>
        {scannedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 15, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-premium max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/40">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                    Ticket Scan Result
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-black text-primary-text tracking-wider">
                      {scannedOrder.orderId}
                    </span>
                    <span className="text-[10px] text-secondary-text font-bold">
                      • {new Date(scannedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setScannedOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-secondary-text"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                
                {/* Status Badges Row */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full border ${
                    scannedOrder.orderStatus === 'Delivered'
                      ? 'text-success bg-green-50 border-green-200/30'
                      : scannedOrder.orderStatus === 'Ready'
                      ? 'text-primary bg-indigo-50 border-indigo-200/30'
                      : 'text-amber-600 bg-amber-50 border-amber-200/30'
                  }`}>
                    Order: {scannedOrder.orderStatus}
                  </span>
                  
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full border ${
                    scannedOrder.paymentMethod === 'Online'
                      ? 'text-indigo-600 bg-indigo-50 border-indigo-200/30'
                      : 'text-emerald-600 bg-emerald-50 border-emerald-200/30'
                  }`}>
                    Method: {scannedOrder.paymentMethod === 'Online' ? 'Online' : 'Cash'}
                  </span>

                  <span className={`text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full border ${
                    scannedOrder.paymentStatus === 'Paid'
                      ? 'text-success bg-green-50 border-green-200/30'
                      : 'text-amber-600 bg-amber-50 border-amber-200/30'
                  }`}>
                    Payment: {scannedOrder.paymentStatus}
                  </span>
                </div>

                {/* Dynamic Staff Instructions Callout */}
                {scannedOrder.orderStatus === 'Delivered' ? (
                  <div className="bg-green-50 border border-green-200/40 rounded-20 p-4 flex gap-3 text-green-950 text-xs font-semibold leading-relaxed shadow-sm">
                    <Check size={18} className="text-success flex-shrink-0 mt-0.5 stroke-[3]" />
                    <div>
                      <p className="font-extrabold">Order Already Served</p>
                      <p className="text-[10px] text-green-700 mt-0.5">This food token has been processed and finalized.</p>
                    </div>
                  </div>
                ) : scannedOrder.paymentMethod === 'Cash' ? (
                  <div className="bg-amber-50 border border-amber-200/40 rounded-20 p-4 flex gap-3 text-amber-950 text-xs font-semibold leading-relaxed shadow-sm">
                    <DollarSign size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold">Collect Cash Payment</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">
                        Please collect <span className="font-bold text-amber-900">₹{scannedOrder.totalAmount}</span> cash at the counter before handing over the meal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200/40 rounded-20 p-4 flex gap-3 text-green-950 text-xs font-semibold leading-relaxed shadow-sm">
                    <Check size={18} className="text-success flex-shrink-0 mt-0.5 stroke-[3]" />
                    <div>
                      <p className="font-extrabold">Online Payment Verified</p>
                      <p className="text-[10px] text-green-700 mt-0.5">
                        Student paid via Razorpay online. No cash collection needed. Serve the meal!
                      </p>
                    </div>
                  </div>
                )}

                {/* Details Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Student Name</span>
                    <span className="text-primary-text font-extrabold">{scannedOrder.customerName}</span>
                  </div>

                  {/* Items Ordered List */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Items to Serve
                    </span>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {scannedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-xs items-center">
                          <span className="text-slate-700 font-semibold">
                            <span className="font-black text-primary mr-1.5">{item.quantity}x</span>
                            {item.menuItem?.name || 'Deleted Item'}
                          </span>
                          <span className="text-slate-500 font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grand Total Footer */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-700">Total Bill Amount</span>
                  <span className="text-base font-black text-primary">₹{scannedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  onClick={() => setScannedOrder(null)}
                  className="flex-1 bg-white hover:bg-slate-150 text-slate-700 rounded-full py-3 px-4 text-xs font-extrabold border border-slate-200 transition-colors active:scale-98"
                >
                  Dismiss
                </button>
                {scannedOrder.orderStatus !== 'Delivered' && (
                  <LoadingButton
                    onClick={() => {
                      markAsDelivered(scannedOrder._id);
                    }}
                    loading={deliveringOrderId === scannedOrder._id}
                    loadingText="Updating..."
                    icon={Check}
                    className="flex-1 bg-success hover:bg-green-600 text-white rounded-full py-3 px-4 text-xs shadow-md shadow-success/15"
                  >
                    {scannedOrder.paymentMethod === 'Cash' ? 'Collect & Deliver' : 'Deliver Meal'}
                  </LoadingButton>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StaffDashboard;
