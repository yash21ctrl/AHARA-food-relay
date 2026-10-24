import React from 'react';
import { FoodPost } from '../types';
import { Timer } from './Timer';
import { StatusBadge } from './StatusBadge';
import { getAreaDistance } from '../lib/distance';
import { MapPin, Navigation, Utensils, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: FoodPost;
  isDonorView?: boolean;
  receiverAreaId?: string;
  activeOrdersCount?: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isDonorView = false,
  receiverAreaId,
  activeOrdersCount = 0
}) => {
  const distance = receiverAreaId ? getAreaDistance(receiverAreaId, post.areaId) : null;
  const isAvailable = post.status === 'OPEN' && post.remainingQty > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      <div className="p-5">
        {/* Header: Status & Timer */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <StatusBadge status={post.status} />
          <Timer safeUntil={post.safeUntil} />
        </div>

        {/* Food details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.eventName}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {post.foodType}
          </h3>
        </div>

        {/* Quantities & Capacity bar */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-slate-400" />
              Available Surplus:
            </span>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">{post.remainingQty}</span>
              <span className="text-xs text-slate-500 font-normal"> / {post.totalQty} plates</span>
            </div>
          </div>

          {/* Progress fill */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                post.remainingQty === 0
                  ? 'bg-slate-400'
                  : post.remainingQty < 20
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, (post.remainingQty / post.totalQty) * 100))}%`
              }}
            />
          </div>
        </div>

        {/* Location & Distance */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1 font-medium text-slate-700">
              {post.locationText}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
              Area: {post.areaId}
            </span>
            {distance !== null && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <Navigation className="w-3 h-3" />
                {distance} km away
              </span>
            )}
          </div>
        </div>

        {isDonorView && activeOrdersCount > 0 && (
          <div className="mt-3 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg font-medium">
            {activeOrdersCount} active recipient order(s)
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <Link
          to={`/post/${post.id}`}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            isAvailable
              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isDonorView
            ? 'Manage Post & Orders'
            : isAvailable
            ? 'Claim Food'
            : 'View Details'}
        </Link>
      </div>
    </div>
  );
};
