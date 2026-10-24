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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-16">
      {/* Hero Header with Kinetic Tracking Badges & Team Credits */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Hyperlocal Food Rescue Ecosystem</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-900 text-amber-400 border border-slate-700 shadow-md">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Engineered by: Sohan D • Yashwanth M • Harshith Y A</span>
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
          AHARA Food Relay
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
          Connecting banquet halls, caterers, and food donors with verified grassroots orphanages and shelters in minutes—with FSSAI safe-until limits, live delivery cost sharing, and an emergency Gaushala animal fallback.
        </p>
      </div>

      {/* 1. CINEMATIC INTERACTIVE VIDEO FLOW (192 FRAMES STREAMING) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Interactive Video Flow & Visual Journey
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            192 frames • GPU stream
          </span>
        </div>

        <InteractiveVideoHero />
      </section>

      {/* 2. INTERACTIVE SCREEN PLAYGROUND FOR ALL FEATURES */}
      <section className="space-y-4">
        <InteractiveScreenSandbox />
      </section>

      {/* 3. TWO DEDICATED PORTAL ENTRY CARDS (DOUBLE-BEZEL ARCHITECTURE) */}
      <section className="space-y-8 pt-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-100 text-slate-700 border border-slate-200">
            <span>Production Environments</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Enter Full Production Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Step directly into the live production environment with full cross-tab state persistence and real-time alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* DONOR PORTAL DOUBLE-BEZEL */}
          <div className="p-2 sm:p-2.5 rounded-[2.2rem] bg-emerald-900/5 ring-1 ring-emerald-600/20 shadow-xl transition-all hover:shadow-2xl hover:ring-emerald-600/40">
            <div className="rounded-[calc(2.2rem-0.6rem)] bg-gradient-to-b from-emerald-50/80 to-white p-7 sm:p-8 flex flex-col justify-between h-full border border-emerald-500/20 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <HeartHandshake className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Food Providers
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

                <ul className="space-y-3 text-xs text-slate-700">
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

                <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/60 text-xs text-emerald-800 flex items-center justify-between font-semibold">
                  <span>Registered Donors: <strong>{donorCount}</strong></span>
                  <span>Active Listings: <strong>{activePostsCount}</strong></span>
                </div>
              </div>

              {/* Nested Button-in-Button CTA */}
              <div>
                <Link
                  to="/donor"
                  className="group relative flex items-center justify-between p-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  <span>Enter Donor Portal</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* RECIPIENT PORTAL DOUBLE-BEZEL */}
          <div className="p-2 sm:p-2.5 rounded-[2.2rem] bg-blue-900/5 ring-1 ring-blue-600/20 shadow-xl transition-all hover:shadow-2xl hover:ring-blue-600/40">
            <div className="rounded-[calc(2.2rem-0.6rem)] bg-gradient-to-b from-blue-50/80 to-white p-7 sm:p-8 flex flex-col justify-between h-full border border-blue-500/20 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Building className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
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

                <ul className="space-y-3 text-xs text-slate-700">
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

                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/60 text-xs text-blue-800 flex items-center justify-between font-semibold">
                  <span>Registered Charities: <strong>{receiverCount}</strong></span>
                  <span>Orders Placed: <strong>{orders.length}</strong></span>
                </div>
              </div>

              {/* Nested Button-in-Button CTA */}
              <div>
                <Link
                  to="/receiver"
                  className="group relative flex items-center justify-between p-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  <span>Enter Recipient Portal</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MULTI-TAB PAIR TESTING GUIDE (DOUBLE-BEZEL HARDWARE SHELL) */}
      <section className="p-2 sm:p-2.5 rounded-[2.2rem] bg-slate-900/5 ring-1 ring-slate-900/10 shadow-xl">
        <div className="rounded-[calc(2.2rem-0.6rem)] bg-slate-900 text-white p-7 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors shrink-0 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Wipe & Reset Database</span>
          </button>
        </div>
      </section>
    </div>
  );
};
