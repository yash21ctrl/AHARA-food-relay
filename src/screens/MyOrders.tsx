import React, { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppStore } from '../store';
import { OrderCard } from '../components/OrderCard';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export const MyOrders: React.FC = () => {
  const { currentUser, isDonor } = useCurrentUser();
  const orders = useAppStore((s) => s.orders);
  const posts = useAppStore((s) => s.posts);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Filter orders for this user
  const userOrders = orders.filter((o) =>
    isDonor ? o.donorId === currentUser?.id : o.receiverId === currentUser?.id
  );

  const filteredOrders = userOrders.filter((o) => {
    switch (activeTab) {
      case 'active':
        return ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status);
      case 'completed':
        return o.status === 'DELIVERED';
      case 'cancelled':
        return o.status === 'CANCELLED' || o.status === 'EXPIRED';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Food Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all active claims, transport coordination, and delivery confirmations.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'active'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3 h-3" />
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'completed'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'cancelled'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Closed
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <div className="font-bold text-slate-800">No orders found in this view</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isDonor
              ? 'When recipient shelters claim your posted food, their orders will appear here.'
              : 'Claim available food listings from the feed to initiate surplus orders.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const post = posts.find((p) => p.id === order.postId);
            return (
              <OrderCard
                key={order.id}
                order={order}
                post={post}
                isDonorView={isDonor}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
