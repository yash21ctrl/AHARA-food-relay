import React, { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppStore } from '../store';
import { PostCard } from '../components/PostCard';
import { getAreaDistance } from '../lib/distance';
import { useNow } from '../hooks/useNow';
import {
  Search,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  Navigation
} from 'lucide-react';

export const ReceiverFeed: React.FC = () => {
  const { currentUser } = useCurrentUser();
  const posts = useAppStore((s) => s.posts);
  const currentTime = useNow();

  const [searchTerm, setSearchTerm] = useState('');

  const receiverAreaId = currentUser?.areaId || 'koramangala';

  // Receivers see a feed of posts that still have quantity left and are not expired or withdrawn (FR-4)
  const availablePosts = posts
    .filter((post) => {
      const isNotExpired = currentTime < post.safeUntil;
      const isOpen = post.status === 'OPEN';
      const hasQty = post.remainingQty > 0;
      return isOpen && isNotExpired && hasQty;
    })
    .filter((post) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        post.foodType.toLowerCase().includes(term) ||
        post.eventName.toLowerCase().includes(term) ||
        post.locationText.toLowerCase().includes(term)
      );
    })
    // Sorted NEAREST FIRST per PRD Section 1.6
    .sort((a, b) => {
      const distA = getAreaDistance(receiverAreaId, a.areaId);
      const distB = getAreaDistance(receiverAreaId, b.areaId);
      return distA - distB;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5" />
              Live Food Feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Surplus Food Available Nearby
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Showing untouched, fresh event food ordered with nearest locations first to ensure safe and timely collection.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="text-blue-200">Your Base Area</div>
              <div className="font-bold text-sm text-white capitalize">
                {currentUser?.areaId || 'Bengaluru'}
              </div>
              <div className="text-[11px] text-blue-200">
                {currentUser?.orgName || currentUser?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Distance note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by food items, event, or location..."
            className="w-full text-sm border border-slate-300 rounded-2xl px-3.5 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Feed automatically sorted by distance from your registered area</span>
        </div>
      </div>

      {/* Feed Grid */}
      {availablePosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div className="font-bold text-slate-800 text-lg">No Active Food Listings Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All surplus food in your vicinity has either been claimed or safely timed out. New event postings trigger automatic alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availablePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isDonorView={false}
              receiverAreaId={receiverAreaId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
