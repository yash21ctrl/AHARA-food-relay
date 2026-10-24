import React, { useState } from 'react';
import { useAppStore } from '../store';
import { showToast } from '../lib/toast';
import { PRESET_AREAS, PRESET_GAUSHALAS } from '../config';
import { getAreaDistance, estimateCost, calculateShares } from '../lib/distance';
import { AnimalFeedCelebrationModal } from './AnimalFeedCelebrationModal';
import {
  HeartHandshake,
  Building,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Leaf,
  Sliders,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InteractiveScreenSandbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donor' | 'receiver' | 'delivery' | 'animal' | 'dashboard'>('donor');

  const posts = useAppStore((s) => s.posts);
  const users = useAppStore((s) => s.users);
  const orders = useAppStore((s) => s.orders);
  const createPost = useAppStore((s) => s.createPost);
  const registerUser = useAppStore((s) => s.registerUser);
  const switchUser = useAppStore((s) => s.switchUser);

  // 1. Donor Screen State
  const [donorEvent, setDonorEvent] = useState('Grand Wedding Reception');
  const [donorFood, setDonorFood] = useState('Dum Biryani & Paneer Butter Masala');
  const [donorQty, setDonorQty] = useState(60);
  const [storageCondition, setStorageCondition] = useState<'ambient' | 'chilled' | 'heated'>('ambient');
  const safeHours = storageCondition === 'ambient' ? 4 : storageCondition === 'chilled' ? 12 : 6;

  // 2. Receiver Screen State
  const [selectedArea, setSelectedArea] = useState('indiranagar');
  const [claimQty, setClaimQty] = useState(30);

  // 3. Delivery Screen State
  const [fromArea, setFromArea] = useState('indiranagar');
  const [toArea, setToArea] = useState('koramangala');
  const [deliveryMethod, setDeliveryMethod] = useState<'SPLIT' | 'DONOR_PAYS' | 'RECEIVER_PAYS' | 'SELF_PICKUP' | 'DONOR_DROP'>('SPLIT');
  const routeDist = getAreaDistance(fromArea, toArea);
  const baseCost = estimateCost(routeDist);
  const [customFareInput, setCustomFareInput] = useState<string>(String(baseCost));
  const activeFare = Number(customFareInput) >= 0 ? Number(customFareInput) : baseCost;
  const shares = calculateShares(deliveryMethod, activeFare);

  // 4. Animal Shelter Fallback State
  const [selectedShelterId, setSelectedShelterId] = useState(PRESET_GAUSHALAS[0].id);
  const [animalDeliveryType, setAnimalDeliveryType] = useState<'self' | 'transport'>('transport');
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const activeShelter = PRESET_GAUSHALAS.find((g) => g.id === selectedShelterId) || PRESET_GAUSHALAS[0];

  // Handler to simulate donor creation
  const handleSimulatePost = () => {
    let donor = users.find((u) => u.role === 'donor');
    if (!donor) {
      const reg = registerUser({
        role: 'donor',
        name: 'Chef Raghav (Executive Catering)',
        phone: '9845012345',
        areaId: fromArea
      });
      if (reg.ok && reg.id) {
        donor = users.find((u) => u.id === reg.id);
      }
    }
    if (donor) {
      switchUser(donor.id);
      createPost({
        foodType: donorFood,
        eventName: donorEvent,
        totalQty: donorQty,
        safeHours,
        locationText: `${PRESET_AREAS.find((a) => a.id === fromArea)?.name || 'Bangalore'} Convention Hall`,
        areaId: fromArea,
        contactPhone: '9845012345'
      });
      showToast(`Surplus Listing Created! ${donorQty} plates published with ${safeHours}h safe window.`, 'success');
      setActiveTab('receiver');
    }
  };

  // Metrics for dashboard tab
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const humanMeals = deliveredOrders.reduce((sum, o) => sum + o.qty, 0);
  const animalFeedPosts = posts.filter((p) => p.animalFeedDispatch);
  const animalMeals = animalFeedPosts.reduce((sum, p) => sum + (p.animalFeedDispatch?.qty || 0), 0);
  const totalMealsSaved = humanMeals + animalMeals;
  const kgFoodSaved = Math.round(totalMealsSaved * 0.4);
  const co2eSavedKg = Math.round(kgFoodSaved * 1.5);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Sandbox Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>INTERACTIVE SCREEN PLAYGROUND</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Test Every Screen in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Explore the core functional features of each AHARA portal directly inside this live interactive sandbox.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Team:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-bold text-white border border-white/10">
              Sohan D • Yashwanth M • Harshith Y A
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('donor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'donor'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>1. Donor Screen</span>
          </button>

          <button
            onClick={() => setActiveTab('receiver')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'receiver'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>2. Receiver Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'delivery'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>3. Delivery & Fare Quoting</span>
          </button>

          <button
            onClick={() => setActiveTab('animal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'animal'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>4. Gaushala Zero-Waste</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>5. Impact Dashboard</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6 sm:p-8 bg-slate-50/50">
        {/* ========================================================== */}
        {/* TAB 1: DONOR SCREEN */}
        {/* ========================================================== */}
        {activeTab === 'donor' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-600" />
                  <span>Donor Screen: 60-Second Food Posting & Safe Timers</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate how commercial donors publish meals with automatic FSSAI safe-until limits.
                </p>
              </div>
              <Link
                to="/donor"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>Launch Full Donor Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Controls */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event / Source Name</label>
                  <input
                    type="text"
                    value={donorEvent}
                    onChange={(e) => setDonorEvent(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Food Items Description</label>
                  <input
                    type="text"
                    value={donorFood}
                    onChange={(e) => setDonorFood(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Surplus Quantity</span>
                    <span className="text-emerald-700">{donorQty} Plates</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    step={10}
                    value={donorQty}
                    onChange={(e) => setDonorQty(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Storage Condition (Determines FSSAI Safe Window)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStorageCondition('ambient')}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                        storageCondition === 'ambient'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Ambient (4 hrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStorageCondition('heated')}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                        storageCondition === 'heated'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Heated (6 hrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStorageCondition('chilled')}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                        storageCondition === 'chilled'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Chilled (12 hrs)
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePost}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Post Food (Publish Listing)</span>
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      Live Listing Preview
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{safeHours} Hours Safe Limit</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900">{donorFood}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{donorEvent} • Bangalore</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Plates</span>
                      <span className="text-xl font-black text-slate-900">{donorQty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Type</span>
                      <span className="font-bold text-slate-800 capitalize">{storageCondition}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">FSSAI Status</span>
                      <span className="font-bold text-emerald-700">Verified Edible</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Safe-until timestamp is locked at creation and cannot be tampered with.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: RECEIVER MARKETPLACE */}
        {/* ========================================================== */}
        {activeTab === 'receiver' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>Recipient Screen: Localized Marketplace & Batch Claims</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Grassroots shelters explore surplus listings in Bangalore and claim exact quantities needed.
                </p>
              </div>
              <Link
                to="/receiver"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
              >
                <span>Launch Full Recipient Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Neighborhood Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-600 shrink-0">Filter Locality:</span>
              {PRESET_AREAS.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedArea(a.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedArea === a.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.filter((p) => p.status === 'OPEN').slice(0, 3).map((post) => (
                <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      OPEN FOR CLAIM
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.safeHours}h Window</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{post.foodType}</h4>
                    <p className="text-xs text-slate-500">{post.eventName} • {post.locationText}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-500">Available Plates:</span>
                    <span className="font-black text-slate-900 text-sm">{post.remainingQty} plates</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Batch Claim Slider:</span>
                      <span className="text-blue-700 font-bold">{Math.min(claimQty, post.remainingQty)} plates</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={post.remainingQty}
                      step={5}
                      value={Math.min(claimQty, post.remainingQty)}
                      onChange={(e) => setClaimQty(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <Link
                    to={`/receiver/post/${post.id}`}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Claim {Math.min(claimQty, post.remainingQty)} Plates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}

              {posts.filter((p) => p.status === 'OPEN').length === 0 && (
                <div className="col-span-3 p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                  <p className="text-xs text-slate-500 font-medium">No open listings in demo state. Click below to generate one!</p>
                  <button
                    onClick={handleSimulatePost}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    + Generate Sample Listing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: DELIVERY & FARE QUOTING */}
        {/* ========================================================== */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <span>Delivery Logistics: Live Courier Quoting & 5-Way Splits</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Calculate baseline Haversine distance and test live quote entry from Porter, Dunzo, Rapido, or Uber Auto.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route & Live Quote Input */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Area</label>
                    <select
                      value={fromArea}
                      onChange={(e) => setFromArea(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    >
                      {PRESET_AREAS.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Drop-off Area</label>
                    <select
                      value={toArea}
                      onChange={(e) => setToArea(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    >
                      {PRESET_AREAS.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Haversine Distance: <strong>{routeDist} km</strong></span>
                  <span className="text-emerald-700 font-bold">Baseline Est: ₹{baseCost}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Live Courier Fare Quote (Porter / Dunzo / Rapido)</span>
                    <span className="text-[10px] text-amber-600 font-semibold">User Editable</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      value={customFareInput}
                      onChange={(e) => setCustomFareInput(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full text-xs pl-7 p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Choose Settlement Mode</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['SPLIT', 'DONOR_PAYS', 'RECEIVER_PAYS', 'SELF_PICKUP', 'DONOR_DROP'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDeliveryMethod(m)}
                        className={`p-2 rounded-xl text-center text-[11px] font-bold border transition-all ${
                          deliveryMethod === m
                            ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-Time Split Breakdown Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Real-Time Shares Breakdown
                </span>

                <div className="flex items-center justify-between pt-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Total Delivery Cost</span>
                    <div className="text-2xl font-black text-white">₹{activeFare}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Selected Method</span>
                    <div className="text-xs font-bold text-amber-400">{deliveryMethod}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Donor Pays</span>
                    <div className="text-xl font-black text-emerald-400">₹{shares.donor}</div>
                    <span className="text-[10px] text-slate-400">{deliveryMethod === 'SPLIT' ? '50% Share' : deliveryMethod === 'DONOR_PAYS' ? '100% Sponsored' : '₹0'}</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Receiver Pays</span>
                    <div className="text-xl font-black text-blue-400">₹{shares.receiver}</div>
                    <span className="text-[10px] text-slate-400">{deliveryMethod === 'SPLIT' ? '50% Share' : deliveryMethod === 'RECEIVER_PAYS' ? '100% Covered' : '₹0'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Both parties must agree before transport vehicle details and ETA are confirmed.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: GAUSHALA ZERO-WASTE FALLBACK */}
        {/* ========================================================== */}
        {activeTab === 'animal' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                  <span>Zero-Waste Fallback: Gaushala & Animal Shelter Diversion</span>
                </h3>
                <p className="text-xs text-slate-500">
                  When food enters the final 30 minutes, route unclaimed meals to cattle shelters and animal rescue centers.
                </p>
              </div>
            </div>

            {/* Simulated 30-min warning alert banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-amber-900">
                  🚨 Last 30 Mins Food Safety Alert Triggered
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Food listing is within 30 minutes of FSSAI safe limits. Unclaimed plates can now be routed directly to verified local animal shelters!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shelter Selection */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <label className="block text-xs font-bold text-slate-700">Select Nearest Cattle Shelter / Animal Rescue Center</label>
                <div className="space-y-2">
                  {PRESET_GAUSHALAS.slice(0, 3).map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedShelterId(g.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedShelterId === g.id
                          ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">{g.name}</div>
                        <div className="text-[11px] text-slate-500">{g.address} • {g.animalTypes}</div>
                      </div>
                      <span className="text-[11px] font-bold text-rose-700">{g.phone}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Choose Delivery Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAnimalDeliveryType('self')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        animalDeliveryType === 'self'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Donor Self-Drop (₹0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnimalDeliveryType('transport')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        animalDeliveryType === 'transport'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Goodwill Courier (₹80 Donor-Funded)
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsCelebrationOpen(true)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Confirm & Dispatch Food (Open Celebration Modal)</span>
                </button>
              </div>

              {/* Compassion Card */}
              <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GAU SEVA & ANIMAL RESCUE MILESTONE</span>
                  </div>
                  <h4 className="text-xl font-black text-white">
                    100% Zero Food Waste Guaranteed
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    By routing near-expiry meals to local animal sanctuaries, food is transformed into nutrition for calves, cows, and rescued animals rather than rotting in dumpsters.
                  </p>
                </div>

                <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-1">
                  <div className="text-xs font-bold text-emerald-300">Selected Shelter: {activeShelter.name}</div>
                  <div className="text-[11px] text-slate-300">
                    Mode: {animalDeliveryType === 'self' ? 'Donor Self-Drop' : 'Goodwill Courier (₹80 covered by Donor)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: IMPACT DASHBOARD */}
        {/* ========================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  <span>Live Impact Dashboard: Real-Time Metrics & Emissions</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Live scientific counters for meals saved, carbon averted, and economic savings delivered.
                </p>
              </div>
              <Link
                to="/receiver/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
              >
                <span>View Full Platform Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Plates Saved</span>
                <div className="text-2xl font-black text-emerald-700">{totalMealsSaved}</div>
                <span className="text-[10px] text-slate-500">Human + Animal rescues</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Landfill Waste Prevented</span>
                <div className="text-2xl font-black text-teal-700">{kgFoodSaved} kg</div>
                <span className="text-[10px] text-slate-500">~400g per meal plate</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">CO₂e Emissions Averted</span>
                <div className="text-2xl font-black text-indigo-700">{co2eSavedKg} kg</div>
                <span className="text-[10px] text-slate-500">1.5 kg CO₂e per kg food</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Economic Value</span>
                <div className="text-2xl font-black text-amber-700">₹{(humanMeals * 75 + animalMeals * 40).toLocaleString('en-IN')}</div>
                <span className="text-[10px] text-slate-500">Delivered to charities</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Dual Audit Trails actively record verified shelter receipts and zero-waste animal feed logs in real-time.</span>
              </div>
              <Link to="/receiver/dashboard" className="font-bold underline shrink-0">
                Open Dashboard Table
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Celebration Modal triggered from animal tab */}
      <AnimalFeedCelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        shelterName={activeShelter.name}
        qty={donorQty}
        deliveryType={animalDeliveryType}
        fare={animalDeliveryType === 'transport' ? 80 : 0}
      />
    </div>
  );
};
