import React from 'react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus | 'OPEN' | 'EXPIRED' | 'WITHDRAWN';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'OPEN':
        return {
          label: 'Available Now',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'ACCEPTED':
        return {
          label: 'Accepted (Negotiating)',
          classes: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmed (Method Agreed)',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'READY':
        return {
          label: 'Ready for Pickup / Dispatch',
          classes: 'bg-amber-50 text-amber-800 border-amber-300'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          classes: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
        };
      case 'DELIVERED':
        return {
          label: 'Delivered & Saved',
          classes: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold'
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          classes: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'EXPIRED':
        return {
          label: 'Expired',
          classes: 'bg-slate-100 text-slate-600 border-slate-300'
        };
      case 'WITHDRAWN':
        return {
          label: 'Withdrawn',
          classes: 'bg-slate-100 text-slate-500 border-slate-300'
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
};
