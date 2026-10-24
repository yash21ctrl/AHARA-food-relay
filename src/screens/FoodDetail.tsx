import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Timer } from '../components/Timer';
import { StatusBadge } from '../components/StatusBadge';
import { getAreaDistance } from '../lib/distance';
import { showToast } from '../lib/toast';
import { useNow } from '../hooks/useNow';
import {
  Calendar,
  Utensils,
  MapPin,
  Navigation,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const FoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isReceiver } = useCurrentUser();
  const currentTime = useNow();

  const posts = useAppStore((s) => s.posts);
  const acceptPost = useAppStore((s) => s.acceptPost);

  const post = posts.find((p) => p.id === id);

  const [acceptType, setAcceptType] = useState<'all' | 'partial'>('all');
  const [partialQty, setPartialQty] = useState<number>(
    post ? Math.min(25, post.remainingQty) : 1
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <div className="text-slate-800 font-bold text-lg">Listing Not Found</div>
        <p className="text-sm text-slate-500">This food listing may have been withdrawn or removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const distance = currentUser ? getAreaDistance(currentUser.areaId, post.areaId) : null;
  const isExpired = currentTime >= post.safeUntil || post.status === 'EXPIRED';
  const isAvailable = post.status === 'OPEN' && post.remainingQty > 0 && !isExpired;

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReceiver) {
      showToast('Please register or switch to a recipient account to claim food', 'error');
      return;
    }

    const claimQty = acceptType === 'all' ? post.remainingQty : partialQty;

    if (claimQty <= 0 || claimQty > post.remainingQty) {
      showToast(`Please enter a valid quantity between 1 and ${post.remainingQty}`, 'error');
      return;
    }

    setIsSubmitting(true);
    const result = acceptPost(post.id, claimQty);
    setIsSubmitting(false);

    if (result.ok && result.id) {
      showToast(`Successfully claimed ${claimQty} plates! Coordinate delivery next.`, 'success');
      navigate(`/order/${result.id}`);
    } else if (!result.ok) {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Available Food
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <StatusBadge status={post.status} />
              {distance !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
                  <Navigation className="w-3 h-3" />
                  {distance} km away
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {post.foodType}
            </h1>

            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <Calendar className="w-3.5 h-3.5" />
              <span>Event: {post.eventName}</span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Safe-Until Countdown
            </span>
            <Timer safeUntil={post.safeUntil} className="text-sm px-3 py-1.5" />
          </div>
        </div>

        {/* Quantity Information Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">
                Available Surplus
              </span>
              <div className="text-2xl font-black text-emerald-950">
                {post.remainingQty} <span className="text-sm font-medium text-emerald-700">plates remaining</span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-emerald-800 hidden sm:block">
            <div>Original post: {post.totalQty} plates</div>
            <div className="text-emerald-600 mt-0.5">Untouched event surplus</div>
          </div>
        </div>

        {/* Location & Safety details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Pickup Location</span>
              <p className="leading-relaxed">{post.locationText}</p>
              <span className="text-slate-500 text-[11px] block mt-1 font-semibold uppercase">
                Area: {post.areaId}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Quality & Safe Window</span>
              <p className="leading-relaxed">
                Prepared for {post.eventName}. Verified safe until expiry window.
              </p>
              <span className="text-emerald-700 text-[11px] block mt-1 font-semibold">
                Direct phone coordination unlocks upon claiming
              </span>
            </div>
          </div>
        </div>

        {/* Claim Form Section (FR-5) */}
        {isAvailable ? (
          <form onSubmit={handleAccept} className="pt-6 border-t border-slate-200/90 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                How many plates do you want to claim?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Accept All */}
                <label
                  onClick={() => setAcceptType('all')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    acceptType === 'all'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="acceptType"
                    checked={acceptType === 'all'}
                    onChange={() => setAcceptType('all')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Accept All ({post.remainingQty} plates)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Claims all remaining surplus, closing the listing to others.
                    </div>
                  </div>
                </label>

                {/* Accept Partial */}
                <label
                  onClick={() => setAcceptType('partial')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    acceptType === 'partial'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="acceptType"
                    checked={acceptType === 'partial'}
                    onChange={() => setAcceptType('partial')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">
                      Accept Partial Quantity
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Take only what your shelter needs; leaves the rest for others.
                    </div>

                    {acceptType === 'partial' && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={post.remainingQty}
                          value={partialQty}
                          onChange={(e) => setPartialQty(parseInt(e.target.value) || 1)}
                          className="w-24 text-sm font-bold border border-emerald-400 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-600 font-medium">plates needed</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  Confirm & Claim{' '}
                  {acceptType === 'all' ? post.remainingQty : partialQty} Plates
                </span>
              </button>
              <div className="text-center text-[11px] text-slate-400 mt-2">
                First receiver to confirm immediately locks these plates. You will agree on delivery next.
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-slate-400 shrink-0" />
            <span>
              {isExpired
                ? 'This food listing has expired and is no longer available for claim.'
                : 'All plates have been claimed by recipient organizations.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
