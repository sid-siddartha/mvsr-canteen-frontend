import React from 'react';

// Common Shimmer Element
const Shimmer = ({ className }) => (
  <div className={`skeleton-shimmer rounded-full ${className}`} />
);

// 1. Food Card Skeleton
export const FoodCardSkeleton = () => {
  return (
    <div className="bg-white rounded-20 overflow-hidden shadow-soft border border-slate-100 p-4 flex flex-col gap-3 h-full">
      <div className="w-full aspect-[4/3] rounded-20 skeleton-shimmer" />
      <Shimmer className="h-5 w-2/3" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-100/60">
        <Shimmer className="h-6 w-1/4" />
        <Shimmer className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
};

// Menu Grid Skeleton using FoodCardSkeleton
export const MenuGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  );
};

// 2. Category Skeleton
export const CategorySkeleton = () => {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 w-full">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Shimmer key={i} className="h-9 w-24 flex-shrink-0" />
      ))}
    </div>
  );
};

// 3. Banner Skeleton
export const BannerSkeleton = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-20 p-6 md:p-8 shadow-soft mb-8 flex flex-col gap-3 min-h-[160px] justify-center relative overflow-hidden">
      <Shimmer className="h-4 w-24" />
      <Shimmer className="h-7 w-3/4 md:w-1/2" />
      <Shimmer className="h-4 w-full md:w-2/3" />
      <Shimmer className="h-4 w-5/6 md:w-1/2" />
    </div>
  );
};

// 4. Cart Item Skeleton
export const CartItemSkeleton = () => {
  return (
    <div className="divide-y divide-slate-100 w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-4 flex gap-3 first:pt-0 last:pb-0">
          <div className="w-16 h-16 rounded-20 skeleton-shimmer flex-shrink-0" />
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex justify-between">
              <Shimmer className="h-4 w-1/2" />
              <Shimmer className="h-4 w-4" />
            </div>
            <Shimmer className="h-3 w-1/4" />
            <div className="flex justify-between items-center mt-1">
              <Shimmer className="h-5 w-16" />
              <Shimmer className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 5. Checkout Summary Skeleton
export const CheckoutSummarySkeleton = () => {
  return (
    <div className="bg-white rounded-20 border border-slate-100 p-5 md:p-6 shadow-soft space-y-5 w-full">
      <Shimmer className="h-5 w-1/3 mb-2" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 justify-between items-center">
            <div className="flex gap-2 items-center flex-1">
              <div className="w-10 h-10 rounded-20 skeleton-shimmer" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-3.5 w-1/2" />
                <Shimmer className="h-2.5 w-1/4" />
              </div>
            </div>
            <Shimmer className="h-4 w-12" />
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex justify-between">
          <Shimmer className="h-3 w-1/4" />
          <Shimmer className="h-3 w-12" />
        </div>
        <div className="flex justify-between">
          <Shimmer className="h-3 w-1/3" />
          <Shimmer className="h-3 w-16" />
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3">
          <Shimmer className="h-5 w-1/4" />
          <Shimmer className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
};

// 6. Order History Skeleton
export const OrderHistorySkeleton = () => {
  return (
    <div className="space-y-4 w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-20 p-4 border border-slate-100 shadow-soft space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-3 w-20" />
            </div>
            <Shimmer className="h-6 w-16 rounded-full" />
          </div>
          <Shimmer className="h-3 w-5/6" />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <div className="space-y-1">
              <Shimmer className="h-2.5 w-16" />
              <Shimmer className="h-4 w-12" />
            </div>
            <Shimmer className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 7. Dashboard Tickets Skeleton
export const DashboardTicketsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-20 p-5 border border-slate-100 shadow-soft flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <Shimmer className="h-4.5 w-1/4" />
            <Shimmer className="h-4 w-1/3" />
          </div>
          <div className="h-0.5 bg-slate-100 w-full" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full skeleton-shimmer" />
            <Shimmer className="h-4 w-24" />
          </div>
          <div className="space-y-2 pl-8">
            <div className="flex justify-between"><Shimmer className="h-3 w-1/3" /><Shimmer className="h-3 w-10" /></div>
            <div className="flex justify-between"><Shimmer className="h-3 w-1/2" /><Shimmer className="h-3 w-12" /></div>
          </div>
          <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
            <div className="space-y-1">
              <Shimmer className="h-2 w-12" />
              <Shimmer className="h-4 w-16" />
            </div>
            <Shimmer className="h-9 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Staff Dashboard Skeleton (combines stats and tickets)
export const StaffDashboardSkeleton = () => {
  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-20 p-4 border border-slate-100 shadow-soft space-y-2">
            <Shimmer className="h-3 w-2/3" />
            <Shimmer className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Shimmer className="h-5 w-40" />
        <DashboardTicketsSkeleton />
      </div>
    </div>
  );
};

// 8. Analytics Card Skeleton
export const AnalyticsCardSkeleton = () => {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-20 p-5 border border-slate-100 shadow-soft space-y-3">
            <div className="flex justify-between items-center">
              <Shimmer className="h-3 w-1/3" />
              <div className="w-8 h-8 rounded-full skeleton-shimmer" />
            </div>
            <Shimmer className="h-7 w-20" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-20 p-6 border border-slate-100 shadow-soft space-y-4">
        <Shimmer className="h-4 w-1/4" />
        <div className="h-48 flex items-end gap-3 pt-6 px-4">
          {[35, 60, 45, 80, 50, 95, 70, 40, 85, 65, 55, 90].map((height, i) => (
            <div key={i} className="flex-1 skeleton-shimmer rounded-t-lg" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="flex justify-between pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Shimmer key={i} className="h-2.5 w-10" />
          ))}
        </div>
      </div>
    </div>
  );
};

// 9. Profile Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="bg-white rounded-20 border border-slate-100 p-6 shadow-soft space-y-6 w-full">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full skeleton-shimmer" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4.5 w-1/3" />
          <Shimmer className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="bg-slate-50 p-4 rounded-20 space-y-2">
          <Shimmer className="h-3 w-2/3" />
          <Shimmer className="h-6 w-1/3" />
        </div>
        <div className="bg-slate-50 p-4 rounded-20 space-y-2">
          <Shimmer className="h-3 w-2/3" />
          <Shimmer className="h-6 w-1/3" />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <Shimmer className="h-3.5 w-1/4" />
        <div className="space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
};

// 10. Table Row Skeleton
export const TableRowSkeleton = () => {
  return (
    <div className="bg-white rounded-20 border border-slate-100 shadow-soft overflow-hidden w-full">
      <div className="bg-slate-50 p-4 flex gap-4 border-b border-slate-100">
        {[1, 2, 3, 4].map((i) => (
          <Shimmer key={i} className="h-4.5 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-50">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="p-4 flex gap-4 items-center">
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 11. QR Code Placeholder Skeleton
export const QRCodePlaceholderSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="w-48 h-48 rounded-20 skeleton-shimmer border border-slate-200/50 flex items-center justify-center relative overflow-hidden">
        <div className="w-36 h-36 border border-slate-200/40 rounded-lg flex flex-wrap p-2 gap-1 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="w-10 h-10 bg-slate-200/20 rounded" />
          ))}
        </div>
      </div>
      <Shimmer className="h-3.5 w-32 mt-4" />
    </div>
  );
};

