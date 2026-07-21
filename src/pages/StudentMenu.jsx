import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../utils/api';
import { Search, ShoppingBag, Plus, Minus, X, Check, Coffee, Receipt, Clock, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import mvsrecLogo from '../assets/mvsrec_logo.png';

// Feedback & Common Components
import ServerOffline from '../components/feedback/ServerOffline';
import { MenuGridSkeleton, CategorySkeleton, BannerSkeleton, FoodCardSkeleton, ProfileSkeleton } from '../components/feedback/LoadingState';
import ImageWithFallback from '../components/common/ImageWithFallback';
import LoadingButton from '../components/common/LoadingButton';

const CATEGORIES = ['All', 'Main Course', 'Snacks', 'Beverages', 'Combos', 'Desserts'];

const StudentMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Order history states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Debounced search and slow connection warning states
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [slowLoadingText, setSlowLoadingText] = useState('');

  // Add to cart local visual feedback states
  const [addingItemIds, setAddingItemIds] = useState({});

  // Profile management states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('canteenease_profile_name') || '';
  });
  const [tempName, setTempName] = useState(profileName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  // Sync tempName when profileName changes
  useEffect(() => {
    setTempName(profileName);
  }, [profileName]);

  // Check if first-time user has profile name set
  useEffect(() => {
    if (!profileName) {
      setShowNamePrompt(true);
    }
  }, [profileName]);

  const handleSaveProfile = () => {
    if (!tempName.trim()) {
      toast.error('Please enter a profile name.');
      return;
    }
    setSavingProfile(true);
    setTimeout(() => {
      localStorage.setItem('canteenease_profile_name', tempName.trim());
      setProfileName(tempName.trim());
      setSavingProfile(false);
      toast.success('Changes saved successfully!');
    }, 700);
  };

  const handleAddToCartWithDelay = (item) => {
    setAddingItemIds(prev => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      addToCart(item);
      setAddingItemIds(prev => ({ ...prev, [item._id]: false }));
      toast.success(`${item.name} added to tray!`);
    }, 350);
  };

  // Debounce search term update by 300ms
  useEffect(() => {
    if (rawSearchTerm.trim() === '') {
      setSearchTerm('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
      // Wait another 300ms to simulate response latency for skeleton rendering
      const simulatedDelay = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(simulatedDelay);
    }, 300);

    return () => clearTimeout(timer);
  }, [rawSearchTerm]);

  // Set up slow network response warning banners (2s and 5s marks)
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

  const {
    cartItems,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    getCartCount,
    getCartTotal,
    getItemQuantity,
    clearCart,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    const saved = localStorage.getItem('canteenease_orders_history');
    if (!saved) {
      setHistoryOrders([]);
      return;
    }
    const orderIds = JSON.parse(saved);
    if (orderIds.length === 0) {
      setHistoryOrders([]);
      return;
    }

    setLoadingHistory(true);
    try {
      const res = await api.post('/orders/history', { orderIds });
      setHistoryOrders(res.data);
    } catch (err) {
      console.error('Failed to load order history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchMenu = async () => {
    setLoading(true);
    setIsOffline(false);
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data);
    } catch (err) {
      console.error(err);
      if (err.isNetworkError) {
        setIsOffline(true);
      } else {
        toast.error(err.message || "We couldn't load the menu. Please refresh and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistory();
    }
  }, [isHistoryOpen]);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isOffline) {
    return <ServerOffline onRetry={fetchMenu} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Sticky Header with Glassmorphism */}
      <header className="sticky top-0 z-40 glass-header px-4 py-3 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100 p-0.5">
                <img src={mvsrecLogo} alt="MVSREC Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-primary-text">MVSREC Canteen</h1>
                <p className="text-[10px] text-secondary-text font-medium uppercase tracking-wider">Digital Menu</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-text">
                {isSearching ? (
                  <svg
                    className="animate-spin h-4.5 w-4.5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <Search size={18} />
                )}
              </span>
              <input
                type="text"
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
                placeholder="Search food, drinks..."
                className="w-full bg-slate-100/60 border border-transparent rounded-20 py-2.5 pl-10 pr-4 text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
            
            {/* Profile action button */}
            <button
              onClick={() => {
                setIsProfileOpen(true);
                setLoadingProfile(true);
                const timer = setTimeout(() => {
                  setLoadingProfile(false);
                }, 600);
                return () => clearTimeout(timer);
              }}
              className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-secondary-text border border-slate-200 bg-white"
              title="My Profile"
            >
              <User size={18} className="stroke-[2.2]" />
            </button>

            {/* My Receipts action button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-secondary-text border border-slate-200 bg-white"
              title="My Receipts"
            >
              <Receipt size={18} className="stroke-[2.2]" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* Banner */}
        {loading ? (
          <BannerSkeleton />
        ) : (
          <div className="bg-slate-900 border border-slate-800/80 rounded-20 p-6 md:p-8 text-white shadow-soft mb-8 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4 text-slate-800">
              <Coffee size={300} />
            </div>
            <div className="relative z-10 max-w-lg space-y-3.5">
              <div>
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider">
                  Scan & Order
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white font-display">
                Skip the Queue, Order Digitally!
              </h2>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Browse our fresh items, customize your cart, and place your order. Pay with cash at the counter when you show your QR code.
              </p>
            </div>
          </div>
        )}

        {/* Categories Bar */}
        <div className="sticky top-[108px] md:top-[68px] z-30 bg-background/95 backdrop-blur-md py-3 mb-6">
          {loading ? (
            <CategorySkeleton />
          ) : (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className="flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide relative transition-colors focus:outline-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 bg-primary rounded-full shadow-md shadow-primary/20"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {slowLoadingText && (
          <div className="mb-6 text-center py-2.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-full animate-pulse border border-slate-200/40 max-w-sm mx-auto">
            {slowLoadingText}
          </div>
        )}

        {/* Menu Grid / Empty States / Skeletons */}
        {loading || isSearching ? (
          <MenuGridSkeleton />
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-20 border border-slate-100 p-12 text-center max-w-md mx-auto shadow-soft mt-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-secondary-text mb-4">
              <Search size={28} />
            </div>
            <h3 className="text-base font-bold text-primary-text mb-1">No items found</h3>
            <p className="text-xs text-secondary-text">
              We couldn't find anything matching your filters or search. Try checking spelling or resetting filters.
            </p>
            <button
              onClick={() => {
                setRawSearchTerm('');
                setSearchTerm('');
                setActiveCategory('All');
              }}
              className="mt-4 text-xs font-semibold text-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item._id);
              return (
                <motion.div
                  layout
                  key={item._id}
                  className="bg-white rounded-20 overflow-hidden shadow-soft border border-slate-100 hover:border-slate-200/80 transition-all flex flex-col"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Food Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      category={item.category}
                    />

                    {/* Veg / Non-Veg Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-slate-100/50">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isVeg ? 'bg-success' : 'bg-error'
                        }`}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Category Overlay */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-primary-text mb-1 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-secondary-text mb-4 line-clamp-2 min-h-[32px]">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-55 border-slate-100/60">
                      <span className="text-base font-extrabold text-primary-text">
                        ₹{item.price}
                      </span>

                      {/* Add button / Counter */}
                      {item.isAvailable ? (
                        qty > 0 ? (
                          <div className="flex items-center bg-slate-100 rounded-full px-1 py-1 shadow-sm border border-slate-200/40">
                            <button
                              onClick={() => decreaseQuantity(item._id)}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary hover:bg-slate-50 transition-colors shadow-sm focus:outline-none"
                            >
                              <Minus size={14} className="stroke-[2.5]" />
                            </button>
                            <span className="w-8 text-center text-xs font-extrabold text-primary-text">
                              {qty}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary hover:bg-slate-50 transition-colors shadow-sm focus:outline-none"
                            >
                              <Plus size={14} className="stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <LoadingButton
                            onClick={() => handleAddToCartWithDelay(item)}
                            loading={addingItemIds[item._id]}
                            loadingText="Adding..."
                            className="bg-primary text-white text-xs py-2 px-4 rounded-full shadow-sm shadow-primary/10"
                          >
                            <Plus size={12} className="stroke-[3] mr-1" /> Add
                          </LoadingButton>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-error uppercase border border-error/25 bg-error/5 py-1.5 px-3 rounded-full">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Action Bar */}
      <AnimatePresence>
        {getCartCount() > 0 && (
          <motion.div
            key={getCartCount()}
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="fixed bottom-6 inset-x-4 z-40 max-w-md mx-auto"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-primary hover:bg-indigo-700 text-white rounded-full p-4 flex items-center justify-between shadow-premium transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full text-white">
                  <ShoppingBag size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Your Tray</p>
                  <p className="text-xs font-extrabold">{getCartCount()} items added</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold">₹{getCartTotal()}</span>
                <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  View Tray
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-primary" />
                  <h3 className="text-base font-bold text-primary-text">Your Ordering Tray</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-secondary-text"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={48} className="text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-primary-text">Your tray is empty</p>
                    <p className="text-xs text-secondary-text mt-1 max-w-[200px]">
                      Browse the menu and add items to place an order.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {cartItems.map((item) => (
                      <div key={item.menuItem._id} className="py-4 flex gap-3 first:pt-0 last:pb-0">
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-50 border border-slate-100"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between">
                              <h4 className="text-xs font-bold text-primary-text line-clamp-1">
                                {item.menuItem.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.menuItem._id)}
                                className="text-slate-400 hover:text-error transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <span className="text-[10px] text-secondary-text font-medium">
                              ₹{item.menuItem.price} each
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-primary">
                              ₹{item.menuItem.price * item.quantity}
                            </span>

                            <div className="flex items-center bg-slate-100 rounded-full px-0.5 py-0.5 border border-slate-200/40">
                              <button
                                onClick={() => decreaseQuantity(item.menuItem._id)}
                                className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-slate-50"
                              >
                                <Minus size={10} className="stroke-[2.5]" />
                              </button>
                              <span className="w-6 text-center text-[11px] font-extrabold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(item.menuItem)}
                                className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:bg-slate-50"
                              >
                                <Plus size={10} className="stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer & Checkout CTA */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                  {/* Summary Math */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-secondary-text">
                      <span>Subtotal</span>
                      <span>₹{getCartTotal()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-secondary-text">
                      <span>GST & Convenience Fee</span>
                      <span className="text-success font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-primary-text pt-1.5 border-t border-slate-200/40">
                      <span>Grand Total</span>
                      <span>₹{getCartTotal()}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full bg-primary hover:bg-indigo-700 text-white rounded-20 py-3.5 px-4 text-xs font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-over History Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* History Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Receipt size={20} className="text-primary" />
                  <h3 className="text-base font-bold text-primary-text">My Receipts & History</h3>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-secondary-text"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingHistory ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-bold text-secondary-text">Retrieving receipts...</p>
                  </div>
                ) : historyOrders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Receipt size={48} className="text-slate-300 mb-3 stroke-[1.5]" />
                    <p className="text-sm font-bold text-primary-text">No orders found</p>
                    <p className="text-xs text-secondary-text mt-1 max-w-[200px]">
                      Your recent receipts and order history will be shown here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active Orders Section */}
                    {historyOrders.some(order => order.orderStatus !== 'Delivered') && (
                      <div className="space-y-3">
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          Active Orders
                        </span>
                        {historyOrders
                          .filter(order => order.orderStatus !== 'Delivered')
                          .map(order => (
                            <div
                              key={order._id}
                              onClick={() => {
                                setIsHistoryOpen(false);
                                navigate(`/order-success/${order.orderId}`);
                              }}
                              className="bg-primary/5 rounded-20 p-4 border border-primary/20 hover:border-primary/45 cursor-pointer transition-all hover:scale-[1.01]"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-black text-primary tracking-wider">
                                    {order.orderId}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="text-[9px] font-extrabold uppercase bg-white border border-primary/20 text-primary py-1 px-2.5 rounded-full animate-pulse">
                                  {order.orderStatus}
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-slate-600 font-semibold line-clamp-1 mt-2.5">
                                {order.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Item'}`).join(', ')}
                              </p>

                              <div className="flex justify-between items-center mt-4 pt-3 border-t border-primary/10 text-xs">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Amount</span>
                                  <span className="font-extrabold text-primary-text">₹{order.totalAmount}</span>
                                </div>
                                <span className="text-primary font-bold text-[10px] flex items-center gap-1">
                                  Show QR Code <ArrowRight size={10} />
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Past Orders Section */}
                    {historyOrders.some(order => order.orderStatus === 'Delivered') && (
                      <div className="space-y-3 pt-2">
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          Past Orders
                        </span>
                        {historyOrders
                          .filter(order => order.orderStatus === 'Delivered')
                          .map(order => (
                            <div
                              key={order._id}
                              onClick={() => {
                                setIsHistoryOpen(false);
                                navigate(`/order-success/${order.orderId}`);
                              }}
                              className="bg-white rounded-20 p-4 border border-slate-100 hover:border-slate-300/60 cursor-pointer transition-all hover:scale-[1.01] shadow-soft"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-black text-slate-700 tracking-wider">
                                    {order.orderId}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="text-[9px] font-extrabold uppercase bg-slate-50 border border-slate-200/40 text-slate-500 py-1 px-2.5 rounded-full">
                                  Served
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-2.5">
                                {order.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Item'}`).join(', ')}
                              </p>

                              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 text-xs">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid</span>
                                  <span className="font-extrabold text-slate-700">₹{order.totalAmount}</span>
                                </div>
                                <span className="text-slate-400 font-bold text-[10px] flex items-center gap-1">
                                  View Receipt <ArrowRight size={10} />
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-over Profile Drawer */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Profile Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  <h3 className="text-base font-bold text-primary-text">My Profile</h3>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-secondary-text"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {loadingProfile ? (
                  <ProfileSkeleton />
                ) : (
                  <div className="space-y-6">
                    {/* User Info Header */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-lg font-bold">
                        {profileName ? profileName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-primary-text">{profileName || 'Student Guest'}</h4>
                        <p className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">Student Account</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-20 border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Receipts</span>
                        <span className="text-lg font-black text-slate-700">{historyOrders.length} orders</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-20 border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Primary Role</span>
                        <span className="text-lg font-black text-slate-700">Student</span>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Default Callout Name</label>
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Enter name for pickups"
                          className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 px-4 text-xs font-medium focus:bg-white focus:border-primary focus:outline-none transition-all"
                        />
                      </div>

                      <LoadingButton
                        onClick={handleSaveProfile}
                        loading={savingProfile}
                        loadingText="Saving..."
                        className="w-full bg-primary hover:bg-indigo-700 text-white rounded-20 py-3 px-4 text-xs shadow-md shadow-primary/25"
                      >
                        Save Changes
                      </LoadingButton>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* First Time Welcome Name Prompt Modal */}
      <AnimatePresence>
        {showNamePrompt && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-20 border border-slate-150 p-6 md:p-8 max-w-sm w-full text-center shadow-premium space-y-6 relative overflow-hidden"
              >
                {/* Brand Header */}
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100 p-1 mx-auto">
                    <img src={mvsrecLogo} alt="MVSREC Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 font-display">Welcome to MVSREC Canteen</h2>
                    <p className="text-xs text-slate-400 mt-1">Please enter your name to customize your digital ordering profile.</p>
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (tempName.trim()) {
                      localStorage.setItem('canteenease_profile_name', tempName.trim());
                      setProfileName(tempName.trim());
                      setShowNamePrompt(false);
                      toast.success(`Welcome to MVSREC Canteen, ${tempName.trim()}!`);
                    }
                  }}
                  className="space-y-4 text-left"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="welcome-name" className="block text-xs font-bold text-slate-700">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-secondary-text">
                        <User size={16} />
                      </span>
                      <input
                        id="welcome-name"
                        type="text"
                        required
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Enter your name..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-20 py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-indigo-700 text-white rounded-20 py-3 px-4 text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    Enter Canteen
                  </button>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentMenu;
