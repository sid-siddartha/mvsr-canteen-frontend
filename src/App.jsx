import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AnimatePresence } from 'framer-motion';

// Skeletons
import {
  MenuGridSkeleton,
  CheckoutSummarySkeleton,
  StaffDashboardSkeleton,
  QRCodePlaceholderSkeleton
} from './components/feedback/LoadingState';

// Connection Overlay
import NoInternet from './components/feedback/NoInternet';

// Lazy Pages
const StudentMenu = lazy(() => import('./pages/StudentMenu'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const StaffLogin = lazy(() => import('./pages/StaffLogin'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMenu = lazy(() => import('./pages/admin/AdminMenu'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Fallbacks
const StudentMenuFallback = () => (
  <div className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
    <div className="h-10 w-48 rounded-full bg-slate-100 skeleton-shimmer mt-4" />
    <div className="h-40 rounded-20 bg-slate-100 skeleton-shimmer" />
    <div className="h-9 w-full rounded-full bg-slate-100 skeleton-shimmer" />
    <MenuGridSkeleton />
  </div>
);

const CheckoutFallback = () => (
  <div className="max-w-4xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-5 gap-6">
    <div className="md:col-span-3 space-y-6">
      <div className="bg-white rounded-20 p-6 space-y-4 shadow-soft">
        <div className="h-6 w-1/3 bg-slate-100 skeleton-shimmer rounded-full" />
        <div className="h-10 w-full bg-slate-50 skeleton-shimmer rounded-20" />
        <div className="h-28 w-full bg-slate-50 skeleton-shimmer rounded-20" />
      </div>
    </div>
    <div className="md:col-span-2">
      <CheckoutSummarySkeleton />
    </div>
  </div>
);

const StaffDashboardFallback = () => (
  <div className="max-w-6xl mx-auto px-4 mt-6">
    <StaffDashboardSkeleton />
  </div>
);

const OrderSuccessFallback = () => (
  <div className="max-w-md mx-auto py-10 px-4">
    <div className="bg-white rounded-20 p-6 shadow-premium space-y-6 border border-slate-100">
      <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 skeleton-shimmer" />
      <QRCodePlaceholderSkeleton />
    </div>
  </div>
);

const StaffLoginFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white border border-slate-100 shadow-premium rounded-20 p-8 space-y-6 animate-pulse">
      <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 skeleton-shimmer" />
      <div className="h-6 w-1/3 mx-auto bg-slate-100 skeleton-shimmer rounded-full" />
      <div className="space-y-4">
        <div className="h-10 w-full bg-slate-50 skeleton-shimmer rounded-20" />
        <div className="h-10 w-full bg-slate-50 skeleton-shimmer rounded-20" />
      </div>
      <div className="h-10 w-full bg-slate-100 skeleton-shimmer rounded-full" />
    </div>
  </div>
);

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Student Portal */}
        <Route path="/" element={<Suspense fallback={<StudentMenuFallback />}><StudentMenu /></Suspense>} />
        <Route path="/checkout" element={<Suspense fallback={<CheckoutFallback />}><Checkout /></Suspense>} />
        <Route path="/order-success/:orderId" element={<Suspense fallback={<OrderSuccessFallback />}><OrderSuccess /></Suspense>} />

        {/* Staff Portal */}
        <Route path="/staff/login" element={<Suspense fallback={<StaffLoginFallback />}><StaffLogin /></Suspense>} />
        <Route path="/staff/dashboard" element={<Suspense fallback={<StaffDashboardFallback />}><StaffDashboard /></Suspense>} />

        {/* Admin Portal */}
        <Route path="/admin/login" element={<Suspense fallback={<StaffLoginFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<Suspense fallback={<StaffDashboardFallback />}><AdminDashboard /></Suspense>} />
        <Route path="/admin/menu" element={<Suspense fallback={<StaffDashboardFallback />}><AdminMenu /></Suspense>} />
        <Route path="/admin/categories" element={<Suspense fallback={<StaffDashboardFallback />}><AdminCategories /></Suspense>} />
        <Route path="/admin/inventory" element={<Suspense fallback={<StaffDashboardFallback />}><AdminInventory /></Suspense>} />
        <Route path="/admin/orders" element={<Suspense fallback={<StaffDashboardFallback />}><AdminOrders /></Suspense>} />
        <Route path="/admin/analytics" element={<Suspense fallback={<StaffDashboardFallback />}><AdminAnalytics /></Suspense>} />
        <Route path="/admin/staff" element={<Suspense fallback={<StaffDashboardFallback />}><AdminStaff /></Suspense>} />
        <Route path="/admin/settings" element={<Suspense fallback={<StaffDashboardFallback />}><AdminSettings /></Suspense>} />

        {/* Fallback Custom 404 Page */}
        <Route path="*" element={<Suspense fallback={<StudentMenuFallback />}><NotFound /></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          {/* Connection Status Overlay */}
          <NoInternet />
          
          {/* Toast Notification Container */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '20px',
                padding: '10px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#22C55E',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
          
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
