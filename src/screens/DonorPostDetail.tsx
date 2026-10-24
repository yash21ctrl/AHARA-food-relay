import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { Timer } from '../components/Timer';
import { showToast } from '../lib/toast';
import { formatDateTime } from '../lib/time';
import { PRESET_GAUSHALAS } from '../config';
import { getAreaDistance, estimateCost } from '../lib/distance';
import { useNow } from '../hooks/useNow';
import { AnimalFeedCelebrationModal } from '../components/AnimalFeedCelebrationModal';
import {
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertTriangle,
  PackageCheck,
  Check,
  X,
  Heart,
  Truck,
  Sparkles,
  Navigation
} from 'lucide-react';

export const DonorPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentTime = useNow();

  const posts = useAppStore((s) => s.posts);
  const orders = useAppStore((s) => s.orders);
  const users = useAppStore((s) => s.users);
  const editPostRemaining = useAppStore((s) => s.editPostRemaining);
  const withdrawPost = useAppStore((s) => s.withdrawPost);
  const dispatchToAnimalFeed = useAppStore((s) => s.dispatchToAnimalFeed);

  const post = posts.find((p) => p.id === id);
  const postOrders = orders.filter((o) => o.postId === id);

  const [isEditingQty, setIsEditingQty] = useState(false);
  const [newQty, setNewQty] = useState(post?.remainingQty || 0);

  // Gaushala / Animal fallback states
  const [selectedShelterId, setSelectedShelterId] = useState(PRESET_GAUSHALAS[0].id);
  const [deliveryType, setDeliveryType] = useState<'self' | 'transport'>('transport');
  const [goodwillFare, setGoodwillFare] = useState(80);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  if (!post) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <div className="text-slate-800 font-bold text-lg">Post Not Found</div>
        <p className="text-sm text-slate-500">This food listing may have been deleted or expired.</p>
        <button
          onClick={() => navigate('/donor')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm"
        >
          Back to Hub
        </button>
      </div>
    );
  }

  // Active orders check
  const activeOrders = postOrders.filter((o) =>
    ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const handleUpdateRemaining = (e: React.FormEvent) => {
    e.preventDefault();
    const res = editPostRemaining(post.id, newQty);
    if (res.ok) {
      showToast('Unclaimed quantity updated successfully', 'success');
      setIsEditingQty(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleWithdraw = () => {
    if (activeOrders.length > 0) {
      showToast('Cannot withdraw while active recipient orders exist', 'error');
      return;
    }
    if (window.confirm('Are you sure you want to withdraw this food post? It will no longer appear in feeds.')) {
      const res = withdrawPost(post.id);
      if (res.ok) {
        showToast('Food listing withdrawn', 'success');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // Check if eligible for Gaushala fallback (last 30 minutes or expired, with unclaimed food remaining)
  const msLeft = post.safeUntil - currentTime;
  const isWithin30Mins = msLeft <= 30 * 60 * 1000;
  const isExpired = currentTime >= post.safeUntil || post.status === 'EXPIRED';
  const showAnimalFallback = (isWithin30Mins || isExpired) && post.remainingQty > 0 && !post.animalFeedDispatch;

  // Sorted Gaushalas by distance
  const sortedGaushalas = [...PRESET_GAUSHALAS].sort((a, b) => {
    const distA = getAreaDistance(post.areaId, a.areaId);
    const distB = getAreaDistance(post.areaId, b.areaId);
    return distA - distB;
  });

  const selectedShelter = PRESET_GAUSHALAS.find((g) => g.id === selectedShelterId) || PRESET_GAUSHALAS[0];
  const shelterDistance = getAreaDistance(post.areaId, selectedShelter.areaId);
  const estimatedShelterFare = estimateCost(shelterDistance);

  const handleDispatchAnimalFeed = () => {
    const res = dispatchToAnimalFeed(post.id, {
      shelterId: selectedShelter.id,
      shelterName: selectedShelter.name,
      deliveryType,
      fare: deliveryType === 'transport' ? (goodwillFare || estimatedShelterFare) : 0,
      phone: selectedShelter.phone
    });

    if (res.ok) {
      setIsCelebrationOpen(true);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/donor')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Dispatched to Animal Feed Banner (Already Completed) */}
      {post.animalFeedDispatch && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Zero-Waste Animal Rescue Completed
              </div>
              <h2 className="text-lg font-bold">
                Diverted to {post.animalFeedDispatch.shelterName}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                {post.animalFeedDispatch.qty} plates safely routed for animal feeding ({post.animalFeedDispatch.deliveryType === 'self' ? 'Donor Self-Drop' : `Goodwill Courier, fare ₹${post.animalFeedDispatch.fare} paid by Donor`}).
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-emerald-900 shrink-0 self-start sm:self-auto">
            100% Zero Landfill Waste
          </div>
        </div>
      )}

      {/* GAUSHALA & ANIMAL FEEDING EMERGENCY FALLBACK (When <= 30 mins or Expired) */}
      {showAnimalFallback && (
        <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 rounded-3xl border-2 border-amber-300 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-amber-200/70">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Zero-Waste Emergency Fallback (Last 30 Mins / Timeout)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Route Remaining {post.remainingQty} Plates to Animal Shelters & Gaushalas
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Human consumption safety limits are imminent. Prevent food wastage by instantly routing the remaining untouched food to verified cattle sanctuaries and animal welfare centers.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Remaining Food</span>
              <span className="text-2xl font-black text-amber-700">{post.remainingQty} plates</span>
            </div>
          </div>

          {/* Gaushala & Animal Shelters Picker */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Select Nearby Gaushala / Animal Welfare Partner:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedGaushalas.slice(0, 4).map((g) => {
                const dist = getAreaDistance(post.areaId, g.areaId);
                const isSelected = selectedShelterId === g.id;

                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      setSelectedShelterId(g.id);
                      setGoodwillFare(estimateCost(dist));
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{g.name}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                          <Navigation className="w-3 h-3" />
                          {dist} km
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-800 block mb-1">
                        {g.type}
                      </span>
                      <p className="text-xs text-slate-500 line-clamp-1">{g.address}</p>
                      <div className="text-[11px] text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        🐾 <strong>Accepts:</strong> {g.animalTypes}
                      </div>
                    </div>

                    <div className="pt-2 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono">📞 {g.phone}</span>
                      <span className="text-emerald-700 font-bold text-xs">
                        {isSelected ? '✓ Selected' : 'Select →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Mode: Self Drop or Goodwill Courier (Donor Pays) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. How Will the Food Move to the Shelter?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Book Goodwill Courier */}
              <label
                onClick={() => setDeliveryType('transport')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryType === 'transport'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'transport'}
                  onChange={() => setDeliveryType('transport')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      Book Goodwill Courier
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Donor Pays ₹{goodwillFare || estimatedShelterFare}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Donor sponsors local auto/three-wheeler delivery fare directly to the animal shelter as Gau Seva / goodwill.
                  </p>
                </div>
              </label>

              {/* Option B: Donor Self-Drop */}
              <label
                onClick={() => setDeliveryType('self')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryType === 'self'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'self'}
                  onChange={() => setDeliveryType('self')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-600" />
                      Deliver Myself (Self Drop-off)
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      Free (₹0)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Donor or venue staff drops off the food containers directly at the shelter on their way home.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Handover Button */}
          <div className="pt-2">
            <button
              onClick={handleDispatchAnimalFeed}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>
                Confirm Handover to {selectedShelter.name} ({post.remainingQty} Plates)
              </span>
            </button>
            <div className="text-center text-[11px] text-slate-500 mt-2">
              🐾 Transforms untouched surplus into life-saving nourishment for animals. 100% zero food waste!
            </div>
          </div>
        </div>
      )}

      {/* Main Post Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <StatusBadge status={post.status} />
              <span className="text-xs text-slate-400">
                Posted {formatDateTime(post.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {post.foodType}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.eventName}</span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Food Safety Clock
            </span>
            <Timer safeUntil={post.safeUntil} className="text-sm px-3.5 py-1.5" />
          </div>
        </div>

        {/* Quantities and Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Total Posted</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {post.totalQty} <span className="text-xs font-normal text-slate-500">plates</span>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 relative">
            <span className="text-xs text-emerald-700 font-medium">Unclaimed Remaining</span>
            <div className="flex items-center justify-between mt-1">
              <div className="text-2xl font-bold text-emerald-900">
                {post.remainingQty} <span className="text-xs font-normal text-emerald-700">plates</span>
              </div>
              {post.status === 'OPEN' && !isEditingQty && (
                <button
                  onClick={() => {
                    setNewQty(post.remainingQty);
                    setIsEditingQty(true);
                  }}
                  className="p-1.5 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  title="Edit remaining quantity"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Inline Editor */}
            {isEditingQty && (
              <form onSubmit={handleUpdateRemaining} className="mt-2 flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  value={newQty}
                  onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs border border-emerald-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingQty(false)}
                  className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Claimed by Recipients</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {post.totalQty - post.remainingQty}{' '}
              <span className="text-xs font-normal text-slate-500">plates</span>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
          <div className="flex items-start gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">Pickup Location</span>
              <span>{post.locationText}</span>
              <div className="text-slate-500 mt-1 font-semibold uppercase text-[10px]">
                Area: {post.areaId}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">Contact Phone</span>
              <span className="font-mono">{post.contactPhone}</span>
              <div className="text-slate-500 mt-1 text-[11px]">
                Shared with receivers once they claim plates
              </div>
            </div>
          </div>
        </div>

        {/* Post Actions: Withdraw Button */}
        {post.status === 'OPEN' && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-500">
              {activeOrders.length > 0
                ? '⚠️ Post cannot be withdrawn while active recipient orders exist.'
                : 'Need to cancel this surplus broadcast?'}
            </div>

            <button
              onClick={handleWithdraw}
              disabled={activeOrders.length > 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeOrders.length > 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Withdraw Food Listing</span>
            </button>
          </div>
        )}
      </div>

      {/* Recipient Orders for this Post */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Recipient Claims & Orders ({postOrders.length})
            </h2>
          </div>
        </div>

        {postOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-sm">
            No organizations have claimed plates on this listing yet. Notifications have been dispatched.
          </div>
        ) : (
          <div className="space-y-3">
            {postOrders.map((order) => {
              const receiverUser = users.find((u) => u.id === order.receiverId);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-slate-400">
                        Placed {formatDateTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{receiverUser?.orgName || receiverUser?.name}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({receiverUser?.orgType})
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {order.qty} plates
                      </span>
                      <span>
                        Delivery: {order.method ? order.method.replace('_', ' ') : 'Negotiating'}
                      </span>
                      <span>• Area: {receiverUser?.areaId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/order/${order.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    >
                      Manage Order
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animal Feed Celebration Modal */}
      <AnimalFeedCelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        shelterName={selectedShelter.name}
        qty={post.remainingQty}
        deliveryType={deliveryType}
        fare={deliveryType === 'transport' ? goodwillFare : undefined}
      />
    </div>
  );
};
