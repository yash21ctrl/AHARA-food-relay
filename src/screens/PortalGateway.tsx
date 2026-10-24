import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { showToast } from '../lib/toast';
import { InteractiveVideoHero } from '../components/InteractiveVideoHero';
import { InteractiveScreenSandbox } from '../components/InteractiveScreenSandbox';
import {
  HeartHandshake,
  Building,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  Award,
  Video
} from 'lucide-react';

export const PortalGateway: React.FC = () => {
  const users = useAppStore((s) => s.users);
  const posts = useAppStore((s) => s.posts);
  const orders = useAppStore((s) => s.orders);
  const clearAllData = useAppStore((s) => s.clearAllData);

  const donorCount = users.filter((u) => u.role === 'donor').length;
  const receiverCount = users.filter((u) => u.role === 'receiver').length;
  const activePostsCount = posts.filter((p) => p.status === 'OPEN' && p.remainingQty > 0).length;

  const handleClearDatabase = () => {
    if (window.confirm('Clear all users, posts, and orders to start 100% fresh from scratch?')) {
      clearAllData();
      showToast('Database wiped clean. Ready for fresh registrations!', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Header with Team Credits */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Hyperlocal Food Rescue & Zero-Waste Platform</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-amber-400 border border-slate-700 shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Built by: Sohan D • Yashwanth M • Harshith Y A</span>
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          AHARA Food Relay
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Connecting banquet halls, caterers, and food donors with verified grassroots orphanages and shelters in minutes—with FSSAI safe-until limits, live delivery cost sharing, and an emergency Gaushala animal fallback.
        </p>
      </div>

      {/* 1. CINEMATIC INTERACTIVE VIDEO FLOW (192 FRAMES) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Interactive Video Flow & Visual Journey
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Scrub or play through 192 cinematic animation frames
          </span>
        </div>

        <InteractiveVideoHero />
      </section>

      {/* 2. INTERACTIVE SCREEN PLAYGROUND FOR ALL FEATURES */}
      <section className="space-y-3">
        <InteractiveScreenSandbox />
      </section>

      {/* 3. TWO DEDICATED PORTAL ENTRY CARDS */}
      <section className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Enter Full Production Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Step directly into the live production environment with full state persistence and notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* DONOR PORTAL */}
          <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-3xl border-2 border-emerald-500/30 p-8 shadow-xl flex flex-col justify-between hover:border-emerald-500 hover:shadow-2xl transition-all group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Food Donors
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  Donor Portal
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  For wedding hosts, caterers, banquet organizers, and corporate conveners who have untouched surplus meals.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Post surplus food in under 60 seconds
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Live safe-until timer protects food quality
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Negotiate free or split transport with shelters
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Emergency Gaushala animal feed fallback in last 30 mins
                </li>
              </ul>

              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/60 text-xs text-emerald-800 flex items-center justify-between font-medium">
                <span>Registered Donors: <strong>{donorCount}</strong></span>
                <span>Active Listings: <strong>{activePostsCount}</strong></span>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/donor"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-600/30 transition-all text-sm group-hover:gap-3"
              >
                <span>Enter Donor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RECIPIENT PORTAL */}
          <div className="bg-gradient-to-b from-blue-50/70 to-white rounded-3xl border-2 border-blue-500/30 p-8 shadow-xl flex flex-col justify-between hover:border-blue-500 hover:shadow-2xl transition-all group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  <Building className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  Charities & Shelters
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  Recipient Portal
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  For registered NGOs, orphanages, old-age homes, shelters, and community kitchens serving people in need.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Live food feed sorted nearest-first across Bangalore
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Claim all or partial plates needed
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Instant donor phone number and call coordination
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Self-pickup or agreed split transport delivery
                </li>
              </ul>

              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/60 text-xs text-blue-800 flex items-center justify-between font-medium">
                <span>Registered Charities: <strong>{receiverCount}</strong></span>
                <span>Orders Placed: <strong>{orders.length}</strong></span>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/receiver"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/30 transition-all text-sm group-hover:gap-3"
              >
                <span>Enter Recipient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MULTI-TAB PAIR TESTING GUIDE */}
      <section className="bg-slate-900 rounded-3xl text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-base text-white">
              Pair-Testing Across 2 Browser Tabs
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Open <strong>Donor Website</strong> in Tab 1, and open <strong>Recipient Website</strong> in Tab 2. Each tab runs its own distinct session user login, while sharing live listings and notifications across tabs in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearDatabase}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Wipe & Reset Database</span>
        </button>
      </section>
    </div>
  );
};
