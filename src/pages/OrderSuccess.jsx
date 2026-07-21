import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, CheckCircle, Share2, Clipboard, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import ServerOffline from '../components/feedback/ServerOffline';
import ErrorScreen from '../components/feedback/ErrorScreen';
import { QRCodePlaceholderSkeleton } from '../components/feedback/LoadingState';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isQrLoaded, setIsQrLoaded] = useState(false);
  const navigate = useNavigate();

  const fetchOrderDetails = async () => {
    setLoading(true);
    setIsOffline(false);
    setErrorMsg(null);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      if (err.isNetworkError) {
        setIsOffline(true);
      } else {
        setErrorMsg(err.message || "We couldn't retrieve details for this order.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderId);
    toast.success('Order ID copied to clipboard!');
  };

  if (isOffline) {
    return <ServerOffline onRetry={fetchOrderDetails} />;
  }

  if (errorMsg) {
    return (
      <ErrorScreen
        title="Order Not Found"
        message={errorMsg}
        onRetry={fetchOrderDetails}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-secondary-text">Loading order confirmation...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="min-h-screen bg-background py-10 px-4"
    >
      <div className="max-w-md mx-auto">
        {/* Back Link & Progress Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-bold text-secondary-text hover:text-primary-text transition-colors"
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-secondary-text font-bold">
              <span className="w-5 h-5 rounded-full bg-success/15 text-success flex items-center justify-center text-[10px]">✓</span>
              <span>Cart</span>
            </div>
            <div className="h-0.5 w-6 bg-success/50" />
            <div className="flex items-center gap-1.5 text-xs text-secondary-text font-bold">
              <span className="w-5 h-5 rounded-full bg-success/15 text-success flex items-center justify-center text-[10px]">✓</span>
              <span>Payment</span>
            </div>
            <div className="h-0.5 w-6 bg-success/50" />
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">3</span>
              <span>Success</span>
            </div>
          </div>
        </div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-20 border border-slate-100 shadow-premium overflow-hidden"
        >
          {/* Top Banner Accent */}
          <div className="h-2.5 bg-gradient-to-r from-success to-emerald-500" />

          {/* Success Banner */}
          <div className="p-6 text-center border-b border-slate-100 bg-slate-50/40">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-block mb-3 text-success"
            >
              <CheckCircle size={52} className="fill-success/10 stroke-[2]" />
            </motion.div>
            <h2 className="text-lg font-extrabold text-primary-text">
              {order.paymentMethod === 'Online' && order.paymentStatus === 'Paid'
                ? 'Payment Successful!'
                : 'Order Placed Successfully!'}
            </h2>
            <p className="text-[11px] text-secondary-text mt-1">
              {order.paymentMethod === 'Online' && order.paymentStatus === 'Paid'
                ? 'Your transaction was verified. Preparation started.'
                : 'Your cash token has been registered in the kitchen queue.'}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-6 text-center bg-white flex flex-col items-center border-b border-slate-100">
            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest mb-1.5">
              Pickup QR Code
            </span>
            
            {/* The actual QR Code Image */}
            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-20 shadow-inner mb-4 relative overflow-hidden w-48 h-48 flex items-center justify-center">
              {!isQrLoaded && (
                <div className="absolute inset-0">
                  <QRCodePlaceholderSkeleton />
                </div>
              )}
              <img
                src={order.qrCodeData}
                alt="Order QR Code"
                onLoad={() => setIsQrLoaded(true)}
                className={`w-44 h-44 object-contain transition-opacity duration-500 ${
                  isQrLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* Short Order Code Display */}
            <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/40 py-1.5 px-4 rounded-full">
              <span className="text-xs text-secondary-text font-bold uppercase">Token Code:</span>
              <span className="text-sm font-extrabold text-primary-text tracking-wider">{order.orderId}</span>
              <button
                onClick={copyToClipboard}
                className="text-slate-400 hover:text-primary transition-colors p-1"
                title="Copy Token"
              >
                <Clipboard size={14} />
              </button>
            </div>
          </div>

          {/* Order Processing Progress steps */}
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-3.5">
            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest text-center">
              Order Preparation Stage
            </span>
            
            <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400 relative px-2">
              {/* Connector line */}
              <div className="absolute top-3 inset-x-8 h-0.5 bg-slate-200 -z-0" />
              <div className="absolute top-3 left-8 h-0.5 bg-primary -z-0 transition-all duration-500" style={{
                width: order.orderStatus === 'Delivered' ? '100%' : order.orderStatus === 'Ready' ? '66%' : order.orderStatus === 'Preparing' ? '33%' : '0%'
              }} />

              {/* Steps */}
              {[
                { label: 'Pending', status: 'Pending' },
                { label: 'Preparing', status: 'Preparing' },
                { label: 'Ready', status: 'Ready' },
                { label: 'Delivered', status: 'Delivered' }
              ].map((step, idx) => {
                const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];
                const currentIdx = statuses.indexOf(order.orderStatus);
                const stepIdx = statuses.indexOf(step.status);
                const isCompleted = stepIdx < currentIdx;
                const isActive = stepIdx === currentIdx;
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-success border-success text-white shadow-sm shadow-success/15'
                        : isActive
                        ? 'bg-primary border-primary text-white shadow-sm shadow-primary/15 scale-110'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className={isActive ? 'text-primary font-bold' : isCompleted ? 'text-success' : 'text-slate-400'}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details list */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Receipt Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-secondary-text font-medium">Customer:</span>
                <span className="text-primary-text font-bold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text font-medium">Order Status:</span>
                <span className="text-primary-text font-semibold uppercase tracking-wider text-[10px] bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full">
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text font-medium">Payment Method:</span>
                <span className="text-primary-text font-bold">
                  {order.paymentMethod === 'Online' ? 'Pay Online' : 'Cash at Counter'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text font-medium">Payment Status:</span>
                <span className={`font-extrabold uppercase tracking-wider text-[10px] border px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'Paid'
                    ? 'text-success bg-green-50 border-green-200/40'
                    : 'text-amber-600 bg-amber-50 border-amber-200/40'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentMethod === 'Online' && order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-secondary-text font-medium">Transaction ID:</span>
                  <span className="text-primary-text font-semibold tracking-wider font-mono text-[10px]">
                    {order.razorpayPaymentId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-secondary-text font-medium">Date & Time:</span>
                <span className="text-primary-text font-semibold">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Items Purchased */}
            <div className="pt-3 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Items ordered
              </span>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-xs items-center">
                    <div className="flex gap-1.5 items-center">
                      <span className="font-extrabold text-primary-text">{item.quantity}x</span>
                      <span className="text-slate-700 font-medium">{item.menuItem?.name}</span>
                    </div>
                    <span className="text-slate-700 font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-primary-text">Total Amount</span>
              <span className="text-base font-extrabold text-primary">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Conditional Instructions Callout */}
          {order.paymentMethod === 'Cash' ? (
            <div className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-200/60 rounded-20 flex flex-col gap-1.5">
              <h4 className="text-xs font-extrabold text-amber-950">Cash Collection at Counter</h4>
              <ol className="list-decimal list-inside text-[10px] text-amber-800 space-y-1 leading-relaxed font-medium">
                <li>Head over to the cashier counter.</li>
                <li>Display this pickup token code/QR Code.</li>
                <li>Pay the total cash of <span className="font-bold">₹{order.totalAmount}</span>.</li>
                <li>The staff will prepare and call out your order!</li>
              </ol>
            </div>
          ) : (
            <div className="mx-6 mb-6 p-4 bg-green-50 border border-green-200/50 rounded-20 flex flex-col gap-1.5">
              <h4 className="text-xs font-extrabold text-green-950">Payment Verified – What next?</h4>
              <ol className="list-decimal list-inside text-[10px] text-green-800 space-y-1 leading-relaxed font-medium">
                <li>Your order has entered preparation mode.</li>
                <li>Wait for your token ID <span className="font-bold">{order.orderId}</span> to be called.</li>
                <li>Display this QR Code screen to collect your fresh items.</li>
                <li>Enjoy your meal!</li>
              </ol>
            </div>
          )}
        </motion.div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-primary hover:bg-indigo-700 text-white rounded-20 py-3.5 px-4 text-xs font-bold shadow-md shadow-primary/20 mt-6 text-center hover:scale-[1.01] active:scale-98 transition-all"
        >
          Order Something Else
        </button>
      </div>
    </motion.div>
  );
};

export default OrderSuccess;
