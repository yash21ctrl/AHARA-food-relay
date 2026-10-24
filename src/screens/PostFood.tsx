import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppStore } from '../store';
import { PRESET_AREAS } from '../config';
import { useNow } from '../hooks/useNow';
import { formatTime } from '../lib/time';
import { showToast } from '../lib/toast';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  ArrowLeft,
  Calendar
} from 'lucide-react';

export const PostFood: React.FC = () => {
  const { currentUser, isDonor } = useCurrentUser();
  const createPost = useAppStore((s) => s.createPost);
  const navigate = useNavigate();
  const currentTime = useNow();

  const [foodType, setFoodType] = useState('');
  const [eventName, setEventName] = useState('');
  const [totalQty, setTotalQty] = useState<number>(50);
  const [safeHours, setSafeHours] = useState<number>(3.5);
  const [locationText, setLocationText] = useState('');
  const [areaId, setAreaId] = useState(currentUser?.areaId || PRESET_AREAS[0].id);
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed safe until
  const safeUntilEpoch = currentTime + safeHours * 3600 * 1000;

  if (!isDonor) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <div className="text-rose-600 font-bold">Access Restricted</div>
        <p className="text-sm text-slate-600">Only registered donors can post surplus food.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = createPost({
      foodType,
      eventName,
      totalQty,
      safeHours,
      locationText,
      areaId,
      contactPhone
    });

    setIsSubmitting(false);

    if (result.ok) {
      showToast('Surplus food posted! All nearby receivers have been notified.', 'success');
      navigate(result.id ? `/post/${result.id}` : '/');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Post Surplus Event Food</h1>
            <p className="text-xs text-slate-500">
              Broadcast surplus food immediately to registered nearby shelters and charities.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Event Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Event or Gathering Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Priya & Rahul Wedding Reception, TechConf Banquet"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Food Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Food Description / Items <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              placeholder="e.g. Veg Biryani, Paneer Butter Masala, Rotis & Dal Makhani"
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Specify main courses, vegetarian/non-veg, and packaging condition.
            </span>
          </div>

          {/* Quantity & Safe Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Surplus Quantity (Plates/Meals) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={5000}
                value={totalQty}
                onChange={(e) => setTotalQty(parseInt(e.target.value) || 0)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Food Stays Good For (Hours) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                required
                min={0.5}
                max={24}
                value={safeHours}
                onChange={(e) => setSafeHours(parseFloat(e.target.value) || 0)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Dynamic Food Safety Preview Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Food Safety Countdown Rule
              </div>
              <div className="text-sm font-semibold">
                Safe Until: {formatTime(safeUntilEpoch)} ({safeHours} hours from now)
              </div>
              <div className="text-xs text-amber-700/90 leading-relaxed">
                The food safety clock will start immediately. Receivers will see a live countdown. When 30 minutes remain, urgent alerts fire. At expiry, distribution is blocked.
              </div>
            </div>
          </div>

          {/* Area Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Area / Neighborhood Hub <span className="text-rose-500">*</span>
            </label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              {PRESET_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Location Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Exact Pickup Location Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Hall A, Grand Palace, 100ft Road, near Metro station"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Direct Contact Phone <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                maxLength={10}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10 digit phone number"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Broadcast Surplus Food Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
