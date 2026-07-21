import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../utils/api';
import { loadRazorpay } from '../utils/loadRazorpay';
import { ArrowLeft, CreditCard, DollarSign, Percent, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import LoadingButton from '../components/common/LoadingButton';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('canteenease_profile_name') || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash or Online
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  const [razorpayKey, setRazorpayKey] = useState('');

  const navigate = useNavigate();

  const saveOrderToHistory = (orderDatabaseId) => {
    try {
      const saved = localStorage.getItem('canteenease_orders_history');
      const list = saved ? JSON.parse(saved) : [];
      const updated = [orderDatabaseId, ...list.filter((id) => id !== orderDatabaseId)].slice(0, 10);
      localStorage.setItem('canteenease_orders_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write local orders history:', e);
    }
  };

  // Load backend payment configurations on mount
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const res = await api.get('/payment/config');
        setRazorpayKey(res.data.keyId);
      } catch (err) {
        console.error('Failed to load Razorpay configurations', err);
      }
    };
    fetchPaymentConfig();
  }, []);

  // Redirect if cart is empty on mount (and order is not completed yet)
  useEffect(() => {
    if (cartItems.length === 0 && !isOrderCompleted) {
      navigate('/');
    }
  }, [cartItems, navigate, isOrderCompleted]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'FIRSTEATS') {
      setCouponApplied(true);
      toast.success('Coupon FIRSTEATS applied! (Simulated)');
    } else {
      toast.error('Invalid coupon code.');
    }
  };

  const handlePlaceOrderCash = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        items: cartItems.map((item) => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          price: item.menuItem.price,
        })),
        totalAmount: getCartTotal(),
        paymentMethod: 'Cash',
      };

      const res = await api.post('/orders', orderPayload);
      console.log('Cash Checkout API Response:', res);
      
      const orderDoc = res.data || res;
      const successId = orderDoc.orderId || orderDoc._id || (orderDoc.order && (orderDoc.order.orderId || orderDoc.order._id));
      
      if (successId) {
        setIsOrderCompleted(true);
        
        // Save Database ID to local storage history
        const dbId = orderDoc._id || (orderDoc.order && orderDoc.order._id);
        if (dbId) saveOrderToHistory(dbId);
        
        toast.success('Order placed! Pay at counter.');
        clearCart();
        navigate(`/order-success/${successId}`);
      } else {
        console.error('Failed to extract order id from:', res);
        toast.error('Order placed, but redirection parameters are invalid.');
      }
    } catch (err) {
      console.error('Cash checkout error:', err);
      toast.error(err.message || 'Unable to place your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayOnline = async () => {
    // 1. Dynamic Script Injection
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error('Failed to load Razorpay SDK. Please check your network.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Create the Local Order & Razorpay Order in the Backend
      const orderPayload = {
        customerName: customerName.trim(),
        items: cartItems.map((item) => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          price: item.menuItem.price,
        })),
        totalAmount: getCartTotal(),
        paymentMethod: 'Online',
      };

      const res = await api.post('/orders', orderPayload);
      const { order, razorpayOrder } = res.data;

      // 3. Configure Razorpay Popup Options
      const options = {
        key: razorpayKey || 'dummy_key_id',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'MVSREC Canteen',
        description: 'Payment for your digital food order',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          // Trigger signature verification on backend
          setIsLoadingVerification(true);
          try {
            const verificationPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            };

            const verificationRes = await api.post('/payment/verify', verificationPayload);
            console.log('Online Verification API Response:', verificationRes);
            
            const orderDoc = verificationRes.data || verificationRes;
            const successId = orderDoc.orderId || orderDoc._id || (orderDoc.order && (orderDoc.order.orderId || orderDoc.order._id));
            
            if (successId) {
              setIsOrderCompleted(true);
              
              // Save Database ID to local storage history
              const dbId = orderDoc._id || (orderDoc.order && orderDoc.order._id);
              if (dbId) saveOrderToHistory(dbId);
              
              toast.success('Payment verified successfully!');
              clearCart();
              navigate(`/order-success/${successId}`);
            } else {
              console.error('Failed to extract order id from verify response:', verificationRes);
              toast.error('Payment verified, but redirection parameters are invalid.');
            }
          } catch (verificationError) {
            console.error('Payment verification catch error:', verificationError);
            toast.error(verificationError.message || "We couldn't verify your payment. If money was deducted, please contact support.");
          } finally {
            setIsLoadingVerification(false);
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: customerName,
        },
        theme: {
          color: '#4F46E5', // Indigo theme color
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.error('Payment was cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Unable to place your order.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (paymentMethod === 'Online') {
      handlePayOnline();
    } else {
      handlePlaceOrderCash();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="min-h-screen bg-background py-8 px-4"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Back Link */}
        <div className="col-span-1 md:col-span-5 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-bold text-secondary-text hover:text-primary-text transition-colors"
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-secondary-text font-bold">
              <span className="w-5 h-5 rounded-full bg-success/15 text-success flex items-center justify-center text-[10px]">✓</span>
              <span>Cart</span>
            </div>
            <div className="h-0.5 w-6 bg-success/50" />
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">2</span>
              <span>Payment</span>
            </div>
            <div className="h-0.5 w-6 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">3</span>
              <span>Success</span>
            </div>
          </div>
        </div>

        {/* Left Side: Name and Payment Selection */}
        <div className="md:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-20 border border-slate-100 p-5 md:p-6 shadow-soft space-y-5"
          >
            <h2 className="text-base font-extrabold text-primary-text mb-2">Checkout Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label htmlFor="customer-name" className="block text-xs font-bold text-slate-700">
                  Your Full Name (For pickup calling)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-secondary-text">
                    <User size={16} />
                  </span>
                  <input
                    id="customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Payment selector cards */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-700">Choose Payment Method</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Cash */}
                  <div
                    onClick={() => setPaymentMethod('Cash')}
                    className={`rounded-20 border p-4 cursor-pointer flex flex-col justify-between h-28 hover:scale-[1.01] transition-all relative ${
                      paymentMethod === 'Cash'
                        ? 'border-primary bg-primary/5 shadow-soft'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200/50 flex items-center justify-center text-success">
                        <DollarSign size={18} />
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'Cash'}
                        readOnly
                        className="accent-primary"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-primary-text">Cash at Counter</p>
                      <p className="text-[10px] text-secondary-text mt-0.5">Pay cash when picking up</p>
                    </div>
                  </div>

                  {/* Option 2: Razorpay */}
                  <div
                    onClick={() => setPaymentMethod('Online')}
                    className={`rounded-20 border p-4 cursor-pointer flex flex-col justify-between h-28 hover:scale-[1.01] transition-all relative ${
                      paymentMethod === 'Online'
                        ? 'border-primary bg-primary/5 shadow-soft'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200/50 flex items-center justify-center text-primary">
                        <CreditCard size={18} />
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'Online'}
                        readOnly
                        className="accent-primary"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-primary-text">Pay Online</p>
                      <p className="text-[10px] text-secondary-text mt-0.5">UPI, Debit/Credit Card, Net Banking</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Checkout Button */}
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText={paymentMethod === 'Online' ? 'Redirecting...' : 'Placing Order...'}
                className="w-full bg-primary hover:bg-indigo-700 text-white rounded-20 py-3.5 px-4 text-xs font-bold shadow-md shadow-primary/20 mt-6 flex items-center justify-center gap-2"
              >  {paymentMethod === 'Online' ? (
                  <>💳 Pay Securely with Razorpay (₹{getCartTotal()})</>
                ) : (
                  <>💵 Place Order (Cash at Counter)</>
                )}
              </LoadingButton>
            </form>
          </motion.div>
        </div>

        {/* Right Side: Order Summary & Coupons */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-20 border border-slate-100 p-5 md:p-6 shadow-soft space-y-5"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShoppingBag size={18} className="text-primary" />
              <h2 className="text-xs font-extrabold text-primary-text uppercase tracking-wider">Order Summary</h2>
            </div>

            {/* Item list */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.menuItem._id} className="py-3 flex justify-between text-xs items-center first:pt-0 last:pb-0">
                  <div>
                    <span className="font-extrabold text-primary-text mr-1.5">{item.quantity}x</span>
                    <span className="text-slate-600 font-medium">{item.menuItem.name}</span>
                  </div>
                  <span className="font-bold text-primary-text">₹{item.menuItem.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupons Form */}
            <div className="pt-4 border-t border-slate-100">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-text">
                    <Percent size={14} />
                  </span>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    placeholder="Enter Coupon (e.g. FIRSTEATS)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-8 pr-3 text-[10px] font-bold uppercase tracking-wider focus:bg-white focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponApplied}
                  className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-20 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            </div>

            {/* Mathematical Summary */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-secondary-text">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="flex justify-between text-secondary-text">
                <span>Taxes & GST (5%)</span>
                <span className="text-success font-semibold">Free</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount</span>
                  <span>-₹0.00</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-primary-text pt-2 border-t border-slate-200/60">
                <span>Grand Total</span>
                <span>₹{getCartTotal()}</span>
              </div>
            </div>

            {/* Security Callout */}
            <div className="bg-slate-50 border border-slate-150 rounded-20 p-3 flex gap-2">
              <ShieldCheck size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-secondary-text leading-relaxed font-semibold">
                Your checkout is securely encrypted. MVSREC Canteen relies on Razorpay for safe transaction handling.
              </p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Full Screen Loading Verification Overlay */}
      {isLoadingVerification && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-20 p-6 flex flex-col items-center justify-center shadow-lg border border-slate-100">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-primary-text">Verifying payment signature...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Checkout;
