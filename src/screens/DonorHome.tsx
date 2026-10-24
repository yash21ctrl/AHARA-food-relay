import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppStore } from '../store';
import { PostCard } from '../components/PostCard';
import { OrderCard } from '../components/OrderCard';
import {
  PlusCircle,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const DonorHome: React.FC = () => {
  const { currentUser } = useCurrentUser();
  const posts = useAppStore((s) => s.posts);
  const orders = useAppStore((s) => s.orders);

  // Filter donor's posts
  const myPosts = posts.filter((p) => p.donorId === currentUser?.id);
  const activePosts = myPosts.filter((p) => p.status === 'OPEN' && p.remainingQty > 0);
  const pastPosts = myPosts.filter((p) => p.status !== 'OPEN' || p.remainingQty === 0);

  // Orders on donor's posts
  const myOrders = orders.filter((o) => o.donorId === currentUser?.id);
  const activeOrders = myOrders.filter((o) =>
    ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  const completedOrders = myOrders.filter((o) => o.status === 'DELIVERED');

  const totalMealsDelivered = completedOrders.reduce((sum, o) => sum + o.qty, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Welcome & Quick Stats */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Donor Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Have extra food from an event? Post it in under 60 seconds. Nearby verified shelters and NGOs will claim it instantly.
            </p>
          </div>

          <Link
            to="/post/new"
            className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-lg hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>Post Surplus Food</span>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-emerald-600/50">
          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Active Posts
            </div>
            <div className="text-2xl font-bold mt-1">{activePosts.length}</div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-400" />
              Active Orders
            </div>
            <div className="text-2xl font-bold mt-1">{activeOrders.length}</div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Orders Delivered
            </div>
            <div className="text-2xl font-bold mt-1">{completedOrders.length}</div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Plates Saved
            </div>
            <div className="text-2xl font-bold mt-1 text-emerald-300">{totalMealsDelivered}</div>
          </div>
        </div>
      </div>

      {/* Active Recipient Orders (Requiring Attention) */}
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Active Orders Needing Attention ({activeOrders.length})
              </h2>
            </div>
            <Link to="/orders" className="text-xs font-semibold text-emerald-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map((order) => {
              const post = posts.find((p) => p.id === order.postId);
              return <OrderCard key={order.id} order={order} post={post} isDonorView={true} />;
            })}
          </div>
        </section>
      )}

      {/* Active Food Posts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Your Active Food Listings ({activePosts.length})
          </h2>
          <Link
            to="/post/new"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Post
          </Link>
        </div>

        {activePosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <div className="font-semibold text-slate-800">No active surplus food posted</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Whenever you have good leftovers from weddings, corporate lunches, or college functions, post them here to rescue them.
            </p>
            <Link
              to="/post/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <PlusCircle className="w-4 h-4" />
              Post Surplus Food Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activePosts.map((post) => {
              const ordersOnPost = orders.filter((o) => o.postId === post.id);
              const activeCount = ordersOnPost.filter((o) =>
                ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
              ).length;

              return (
                <PostCard
                  key={post.id}
                  post={post}
                  isDonorView={true}
                  activeOrdersCount={activeCount}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Past / Completed Posts */}
      {pastPosts.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-700">
            Past & Completed Posts ({pastPosts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-80 hover:opacity-100 transition-opacity">
            {pastPosts.map((post) => (
              <PostCard key={post.id} post={post} isDonorView={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
