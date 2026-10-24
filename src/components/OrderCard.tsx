import React from 'react';
import { Order, FoodPost } from '../types';
import { StatusBadge } from './StatusBadge';
import { Timer } from './Timer';
import { useAppStore } from '../store';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Utensils,
  Truck,
  Phone,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { DELIVERY_METHOD_DETAILS } from '../config';

interface OrderCardProps {
  order: Order;
  post?: FoodPost;
  isDonorView: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, post, isDonorView }) => {
  const users = useAppStore((s) => s.users);
  const otherUser = users.find((u) => u.id === (isDonorView ? order.receiverId : order.donorId));

  const methodInfo = order.method ? DELIVERY_METHOD_DETAILS[order.method] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Header: Status and Timer */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusBadge status={order.status} />
          {post && <Timer safeUntil={post.safeUntil} />}
        </div>

        {/* Post title / Food */}
        <div className="space-y-1 mb-3">
          {post && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.eventName}</span>
            </div>
          )}
          <h4 className="text-base font-bold text-slate-900">
            {post?.foodType || 'Surplus Food Order'}
          </h4>
        </div>

        {/* Quantity & Method Stats */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs">
          <div>
            <div className="text-slate-500 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-slate-400" />
              Claimed:
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {order.qty} plates
            </div>
          </div>
          <div>
            <div className="text-slate-500 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Delivery:
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
              {methodInfo ? methodInfo.label : order.proposal ? 'Proposal Pending' : 'Not Agreed'}
            </div>
          </div>
        </div>

        {/* Other Party Info */}
        {otherUser && (
          <div className="flex items-center justify-between text-xs text-slate-600 mb-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-slate-400 block text-[11px]">
                {isDonorView ? 'Recipient Organization:' : 'Donated by:'}
              </span>
              <span className="font-semibold text-slate-800">
                {otherUser.orgName ? `${otherUser.orgName} (${otherUser.name})` : otherUser.name}
              </span>
            </div>
            <a
              href={`tel:${otherUser.phone}`}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-3 h-3" />
              Call
            </a>
          </div>
        )}

        {/* Warning or Pending states */}
        {order.pendingQtyChange && (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Quantity change request pending ({order.pendingQtyChange.newQty} plates)</span>
          </div>
        )}
      </div>

      {/* Link to order screen */}
      <Link
        to={`/order/${order.id}`}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white transition-colors shadow-sm"
      >
        <span>Open Order Details</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
