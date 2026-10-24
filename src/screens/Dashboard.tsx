import React from 'react';
import { useAppStore } from '../store';
import { formatDateTime } from '../lib/time';
import {
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Leaf,
  Sparkles,
  Heart
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const posts = useAppStore((s) => s.posts);
  const orders = useAppStore((s) => s.orders);
  const users = useAppStore((s) => s.users);

  // Delivered orders (Meals saved for humans)
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const humanMealsSaved = deliveredOrders.reduce((sum, o) => sum + o.qty, 0);

  // Animal Feed & Gaushala Zero-Waste Diversions
  const animalFeedPosts = posts.filter((p) => p.animalFeedDispatch);
  const animalMealsSaved = animalFeedPosts.reduce(
    (sum, p) => sum + (p.animalFeedDispatch?.qty || 0),
    0
  );

  const totalMealsSaved = humanMealsSaved + animalMealsSaved;

  // Active orders
  const activeOrders = orders.filter((o) =>
    ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  // Expired posts that didn't get diverted
  const unrescuedExpiredPosts = posts.filter(
    (p) => p.status === 'EXPIRED' && !p.animalFeedDispatch
  );

  // Total posts created
  const totalPostsCreated = posts.length;

  // Environmental and community impact calculations
  const kgFoodSaved = Math.round(totalMealsSaved * 0.4); // approx 400g per plate
  const co2eSavedKg = Math.round(kgFoodSaved * 1.5); // approx 1.5kg CO2e per kg food saved
  const economicValueSaved = humanMealsSaved * 75 + animalMealsSaved * 40; // avg ₹75 per human plate, ₹40 per animal feed

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Platform Metrics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Surplus Food Impact Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of food saved, hunger relieved, and carbon emissions mitigated across {totalPostsCreated} listings.
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Meals Saved */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Total Plates Saved
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {totalMealsSaved}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {humanMealsSaved} human + {animalMealsSaved} animal
          </span>
        </div>

        {/* Human NGO Rescues */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            NGO Orders Delivered
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {deliveredOrders.length}
          </div>
          <span className="text-[11px] text-teal-700 font-medium mt-1 block">
            {humanMealsSaved} plates delivered to shelters
          </span>
        </div>

        {/* Gaushala & Animal Rescues */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-amber-600 fill-amber-500" />
          </div>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Animal Shelters Fed
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 tracking-tight">
            {animalMealsSaved}
          </div>
          <span className="text-[11px] text-amber-800 font-medium mt-1 block">
            Across {animalFeedPosts.length} zero-waste fallback dispatches
          </span>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Active In Transit
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {activeOrders.length}
          </div>
          <span className="text-[11px] text-indigo-700 font-medium mt-1 block">
            Under delivery coordination
          </span>
        </div>

        {/* Expired Unrescued */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Unrescued Expired
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {unrescuedExpiredPosts.length}
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">
            Protected by safe limits
          </span>
        </div>
      </div>

      {/* Sustainability & Environmental Impact Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-lg font-bold text-emerald-300 flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span>Environmental & Economic Equivalents</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1">
            <div className="text-xs text-slate-300 font-medium">Estimated Food Weight Rescued</div>
            <div className="text-2xl font-black text-white">{kgFoodSaved} kg</div>
            <div className="text-[11px] text-emerald-300">Prevented from organic landfill rot</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-300 font-medium">Greenhouse Gases Averted</div>
            <div className="text-2xl font-black text-white">{co2eSavedKg} kg CO₂e</div>
            <div className="text-[11px] text-emerald-300">Equivalent to avoiding ~{Math.round(co2eSavedKg * 4)} km car travel</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-300 font-medium">Nutritional Economic Value</div>
            <div className="text-2xl font-black text-white">₹{economicValueSaved.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-300">Direct savings provided to shelters</div>
          </div>
        </div>
      </div>

      {/* Recent Delivered Deliveries Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Successfully Delivered Food Orders</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {deliveredOrders.length} completed
          </span>
        </div>

        {deliveredOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No orders delivered yet. Walk through a complete order cycle in under 3 minutes to see it reflected here!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {deliveredOrders.map((order) => {
              const post = posts.find((p) => p.id === order.postId);
              const donor = users.find((u) => u.id === order.donorId);
              const receiver = users.find((u) => u.id === order.receiverId);

              return (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {post?.foodType || 'Surplus Meal'}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {post?.eventName} • Donated by <strong>{donor?.name}</strong>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Delivered to <strong>{receiver?.orgName || receiver?.name}</strong> ({receiver?.orgType})
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between gap-1">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {order.qty} plates saved
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {order.deliveredAt ? formatDateTime(order.deliveredAt) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animal Shelter & Gaushala Zero-Waste Rescues */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Gaushala & Animal Shelter Zero-Waste Rescues</span>
          </h3>
          <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {animalFeedPosts.length} zero-waste diversions
          </span>
        </div>

        {animalFeedPosts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No animal feeding dispatches yet. When surplus food enters the final 30 minutes, donors can divert it directly to local cattle shelters & animal rescue centers to achieve 100% zero food waste!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {animalFeedPosts.map((post) => {
              const dispatch = post.animalFeedDispatch!;
              const donor = users.find((u) => u.id === post.donorId);

              return (
                <div key={post.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{post.foodType}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        Zero-Waste Fallback
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {post.eventName} • Donated by <strong>{donor?.name || 'Anonymous Donor'}</strong>
                    </div>
                    <div className="text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span>Dispatched to: <strong>{dispatch.shelterName}</strong></span>
                      <span className="text-slate-400">•</span>
                      <span>{dispatch.deliveryType === 'self' ? 'Donor Self-Drop' : `Goodwill Courier (₹${dispatch.fare || 80} paid by Donor)`}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between gap-1">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {dispatch.qty} plates fed to animals
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {dispatch.at ? formatDateTime(dispatch.at) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
