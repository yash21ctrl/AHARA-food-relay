import React, { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../lib/time';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Truck,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const { currentUser } = useCurrentUser();
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const navigate = useNavigate();

  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Filter for this user
  const userNotifs = notifications.filter((n) => n.toUserId === currentUser?.id);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const displayNotifs = filterUnreadOnly
    ? userNotifs.filter((n) => !n.read)
    : userNotifs;

  const handleNotifClick = (notif: (typeof notifications)[0]) => {
    markNotificationRead(notif.id);
    if (notif.orderId) {
      navigate(`/order/${notif.orderId}`);
    } else if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    }
  };

  const getNotifIcon = (title: string) => {
    if (title.includes('Warning') || title.includes('Alert') || title.includes('Late')) {
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
    if (title.includes('Cancelled') || title.includes('Declined')) {
      return <XCircle className="w-5 h-5 text-rose-600" />;
    }
    if (title.includes('Delivered')) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    if (title.includes('Delivery') || title.includes('Vehicle') || title.includes('Transit')) {
      return <Truck className="w-5 h-5 text-indigo-600" />;
    }
    if (title.includes('Food') || title.includes('Available') || title.includes('Claimed')) {
      return <UtensilsCrossed className="w-5 h-5 text-emerald-600" />;
    }
    return <Clock className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-emerald-600" />
            <span>Notification Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates on food postings, delivery proposals, and food safety timers.
          </p>
        </div>

        {unreadCount > 0 && currentUser && (
          <button
            onClick={() => markAllNotificationsRead(currentUser.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            !filterUnreadOnly
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({userNotifs.length})
        </button>
        <button
          onClick={() => setFilterUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterUnreadOnly
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {displayNotifs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <div className="font-bold text-slate-800">No notifications</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You're all caught up! New listings and order status changes will ping you here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayNotifs.map((notif) => {
            return (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  notif.read
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-50'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0">
                  {getNotifIcon(notif.title)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        notif.read ? 'text-slate-800' : 'text-slate-900'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.body}
                  </p>

                  {(notif.orderId || notif.postId) && (
                    <div className="mt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                      <span>View details →</span>
                    </div>
                  )}
                </div>

                {!notif.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
