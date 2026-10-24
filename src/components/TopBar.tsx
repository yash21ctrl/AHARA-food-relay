import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppStore } from '../store';
import { APP_NAME } from '../config';
import {
  Bell,
  Package,
  PlusCircle,
  Building2,
  UtensilsCrossed,
  LogOut,
  ArrowLeftRight
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { currentUser } = useCurrentUser();
  const location = useLocation();
  const notifications = useAppStore((s) => s.notifications);
  const logoutUser = useAppStore((s) => s.logoutUser);

  const isDonorSection = location.pathname.startsWith('/donor');
  const isReceiverSection = location.pathname.startsWith('/receiver');

  const unreadCount = notifications.filter(
    (n) => n.toUserId === currentUser?.id && !n.read
  ).length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 ${
                  isDonorSection
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20'
                    : isReceiverSection
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/20'
                    : 'bg-gradient-to-tr from-slate-800 to-slate-900 shadow-slate-900/20'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-900">
                    {APP_NAME}
                  </span>
                  {isDonorSection ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Donor Website
                    </span>
                  ) : isReceiverSection ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      Recipient Website
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Relay Platform
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 leading-none">
                  {isDonorSection
                    ? 'Event Food Redistribution'
                    : isReceiverSection
                    ? 'Charity Food Relief'
                    : 'Surplus Food Gateway'}
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {isDonorSection && currentUser && (
              <>
                <Link
                  to="/donor"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/donor')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/donor/post/new"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Surplus Food</span>
                </Link>
                <Link
                  to="/donor/orders"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/donor/orders')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/donor/notifications"
                  className={`relative flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/donor/notifications')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alerts</span>
                  {unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isReceiverSection && currentUser && (
              <>
                <Link
                  to="/receiver"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/receiver')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Food Feed
                </Link>
                <Link
                  to="/receiver/orders"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/receiver/orders')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>My Claims</span>
                </Link>
                <Link
                  to="/receiver/notifications"
                  className={`relative flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/receiver/notifications')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alerts</span>
                  {unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/receiver/dashboard"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/receiver/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Impact
                </Link>
              </>
            )}
          </nav>

          {/* User Status / Switch / Logout */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-snug">
                    {currentUser.orgName || currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                    {currentUser.role === 'receiver' && <Building2 className="w-3 h-3 text-slate-400" />}
                    <span>{currentUser.role === 'receiver' ? currentUser.name : 'Donor'}</span>
                    <span>• {currentUser.areaId}</span>
                  </div>
                </div>

                <button
                  onClick={() => logoutUser()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Log out of this tab"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Switch Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
