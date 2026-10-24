import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useNow } from '../hooks/useNow';
import { Stepper } from '../components/Stepper';
import { Timer } from '../components/Timer';
import { StatusBadge } from '../components/StatusBadge';
import { CancelDialog } from '../components/CancelDialog';
import { DELIVERY_METHOD_DETAILS } from '../config';
import { DeliveryMethod } from '../types';
import { getAreaDistance, estimateCost, calculateShares } from '../lib/distance';
import { formatTime, formatDateTime } from '../lib/time';
import { showToast } from '../lib/toast';
import { validateCustomFare } from '../lib/validators';
import {
  Phone,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  XCircle,
  Edit,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export const OrderScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const currentTime = useNow();

  const orders = useAppStore((s) => s.orders);
  const posts = useAppStore((s) => s.posts);
  const users = useAppStore((s) => s.users);

  const proposeMethod = useAppStore((s) => s.proposeMethod);
  const agreeMethod = useAppStore((s) => s.agreeMethod);
  const adjustOrderCost = useAppStore((s) => s.adjustOrderCost);
  const saveTransport = useAppStore((s) => s.saveTransport);
  const updateEta = useAppStore((s) => s.updateEta);
  const startDelivery = useAppStore((s) => s.startDelivery);
  const markDelivered = useAppStore((s) => s.markDelivered);
  const cancelOrder = useAppStore((s) => s.cancelOrder);
  const requestQtyChange = useAppStore((s) => s.requestQtyChange);
  const respondQtyChange = useAppStore((s) => s.respondQtyChange);
  const markPaymentDone = useAppStore((s) => s.markPaymentDone);

  // States
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod>('SPLIT');
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Transport form states
  const [vehicleType, setVehicleType] = useState('Three-Wheeler Auto');
  const [numberPlate, setNumberPlate] = useState('KA01AB1234');
  const [driverPhone, setDriverPhone] = useState('');
  const [personName, setPersonName] = useState('');
  const [etaMinutes, setEtaMinutes] = useState(30);

  // ETA edit state
  const [isEditingEta, setIsEditingEta] = useState(false);
  const [newEtaMinutes, setNewEtaMinutes] = useState(45);

  // Qty change state
  const [isChangingQty, setIsChangingQty] = useState(false);
  const [newRequestedQty, setNewRequestedQty] = useState(0);

  const order = orders.find((o) => o.id === id);
  const post = posts.find((p) => p.id === order?.postId);

  if (!order || !post) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <div className="text-slate-800 font-bold text-lg">Order Not Found</div>
        <p className="text-sm text-slate-500">This order could not be located.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Section 2.8: Access control: only donor and receiver of this order
  const isDonor = currentUser?.id === order.donorId;
  const isReceiver = currentUser?.id === order.receiverId;

  if (!isDonor && !isReceiver) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <div className="text-rose-600 font-bold text-lg">Unauthorized Access</div>
        <p className="text-sm text-slate-600">
          Only the donor or receiver of this order can view this page.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm"
        >
          Return to My Dashboard
        </button>
      </div>
    );
  }

  const role = isDonor ? 'donor' : 'receiver';
  const otherUser = users.find((u) => u.id === (isDonor ? order.receiverId : order.donorId));

  const distance = getAreaDistance(
    users.find((u) => u.id === order.donorId)?.areaId || '',
    users.find((u) => u.id === order.receiverId)?.areaId || ''
  );
  const currentEstCost = estimateCost(distance);

  // Custom delivery price state & sync
  const [customCostInput, setCustomCostInput] = useState<string>(() => {
    if (order?.proposal?.customCost !== undefined && order.proposal.customCost >= 0) {
      return String(order.proposal.customCost);
    }
    if (!order?.proposal && order?.estCost !== undefined && order.estCost >= 0) {
      return String(order.estCost);
    }
    return String(currentEstCost);
  });
  const [isAdjustingCost, setIsAdjustingCost] = useState(false);
  const [adjustCostInput, setAdjustCostInput] = useState('');

  useEffect(() => {
    if (order?.proposal?.customCost !== undefined && order.proposal.customCost >= 0) {
      setCustomCostInput(String(order.proposal.customCost));
    } else if (!order?.proposal && order?.estCost !== undefined && order.estCost >= 0) {
      setCustomCostInput(String(order.estCost));
    }
  }, [order?.id, order?.proposal?.at, order?.proposal?.customCost, order?.estCost]);

  const isSelectedMethodFree = DELIVERY_METHOD_DETAILS[selectedMethod].isFree;
  const rawParsed = customCostInput.trim() === ''
    ? currentEstCost
    : Math.round(parseFloat(customCostInput));
  const parsedFare = isNaN(rawParsed) ? 0 : Math.min(100000, Math.max(0, rawParsed));

  const effectiveFare = isSelectedMethodFree ? 0 : parsedFare;
  const activeShares = calculateShares(selectedMethod, effectiveFare);

  const isProposalFree = order.proposal
    ? DELIVERY_METHOD_DETAILS[order.proposal.method].isFree
    : true;
  const proposalFare = order.proposal
    ? (isProposalFree
        ? 0
        : (order.proposal.customCost !== undefined && order.proposal.customCost >= 0
            ? order.proposal.customCost
            : currentEstCost))
    : 0;
  const proposalShares = order.proposal
    ? calculateShares(order.proposal.method, proposalFare)
    : { donor: 0, receiver: 0 };
  const isProposalCustom =
    order.proposal &&
    !isProposalFree &&
    order.proposal.customCost !== undefined &&
    order.proposal.customCost !== currentEstCost;

  // Check if ETA past safeUntil (FR-13, Section 3.4.D)
  const isEtaOverdue = order.transport ? order.transport.etaAt > post.safeUntil : false;

  // Handlers
  const handleProposeMethod = (method: DeliveryMethod) => {
    const isFree = DELIVERY_METHOD_DETAILS[method].isFree;
    const finalFare = isFree ? 0 : parsedFare;

    if (!isFree) {
      const fareVal = validateCustomFare(finalFare);
      if (!fareVal.valid) {
        showToast(fareVal.error || 'Invalid delivery fare', 'error');
        return;
      }
    }

    const res = proposeMethod(order.id, method, role, finalFare);
    if (res.ok) {
      showToast(
        `Proposed ${DELIVERY_METHOD_DETAILS[method].label}${!isFree ? ` (₹${finalFare})` : ''}`,
        'success'
      );
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleAgreeMethod = () => {
    const res = agreeMethod(order.id, role);
    if (res.ok) {
      showToast('Delivery method confirmed! Proceed to vehicle details.', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleAdjustCost = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCost = Math.round(parseFloat(adjustCostInput));
    if (isNaN(rawCost)) {
      showToast('Please enter a valid numeric fare', 'error');
      return;
    }
    const costNum = Math.min(100000, Math.max(0, rawCost));
    const fareVal = validateCustomFare(costNum);
    if (!fareVal.valid) {
      showToast(fareVal.error || 'Invalid delivery fare', 'error');
      return;
    }
    const res = adjustOrderCost(order.id, costNum);
    if (res.ok) {
      showToast(`Delivery fare updated to ₹${costNum}`, 'success');
      setIsAdjustingCost(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSaveTransport = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedEta = currentTime + etaMinutes * 60 * 1000;
    const phoneToUse = driverPhone || currentUser?.phone || '9876543210';

    const res = saveTransport(order.id, {
      vehicleType,
      numberPlate,
      phone: phoneToUse,
      personName: order.method === 'SELF_PICKUP' ? personName || currentUser?.name : undefined,
      etaAt: calculatedEta
    });

    if (res.ok) {
      showToast('Transport details saved! Order is Ready.', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleUpdateEta = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedEta = currentTime + newEtaMinutes * 60 * 1000;
    const res = updateEta(order.id, calculatedEta);
    if (res.ok) {
      showToast('ETA updated', 'info');
      setIsEditingEta(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleStartDelivery = () => {
    const res = startDelivery(order.id);
    if (res.ok) {
      showToast('Delivery started! Receiver notified.', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleMarkDelivered = () => {
    const res = markDelivered(order.id);
    if (res.ok) {
      showToast('Food marked as delivered! Impact recorded.', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCancelConfirm = (reason: string) => {
    const res = cancelOrder(order.id, role, reason);
    if (res.ok) {
      showToast('Order cancelled and food reopened to community', 'info');
      setIsCancelOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRequestQtyChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequestedQty <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }
    const res = requestQtyChange(order.id, newRequestedQty);
    if (res.ok) {
      showToast('Quantity change requested from receiver', 'info');
      setIsChangingQty(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRespondQtyChange = (accept: boolean) => {
    const res = respondQtyChange(order.id, accept);
    if (res.ok) {
      showToast(
        accept ? 'New quantity accepted' : 'Quantity change declined (order cancelled)',
        accept ? 'success' : 'info'
      );
    } else {
      showToast(res.message, 'error');
    }
  };

  const canCancel = !['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(order.status);
  const isCompleted = order.status === 'DELIVERED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Bar with Back and Status */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <Timer safeUntil={post.safeUntil} />
        </div>
      </div>

      {/* Expiry Banner (Section 3.4.G) */}
      {order.status === 'EXPIRED' && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-300">
              Order Expired: Safe Consumption Window Passed
            </div>
            <div className="text-xs text-slate-300">
              Food is no longer safe to distribute. Suggested next step: compost or animal-feed partner.
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Notice Banner (Section 3.4.A/B) */}
      {order.status === 'CANCELLED' && order.cancel && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">
              Cancelled by {order.cancel.by === 'donor' ? 'Donor' : 'Recipient'}
            </div>
            <div className="text-xs text-rose-700">
              <strong>Reason:</strong> "{order.cancel.reason}"
            </div>
            <div className="text-[11px] text-rose-600">
              Cancelled on {formatDateTime(order.cancel.at)}. The {order.qty} plates have been released back into the available pool.
            </div>
          </div>
        </div>
      )}

      {/* ETA Delay Warning (FR-13, Section 3.4.D) */}
      {isEtaOverdue && !isCompleted && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white flex items-start gap-3 shadow-lg animate-pulse">
          <AlertCircle className="w-6 h-6 text-white shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-sm uppercase tracking-wide">
              ⚠️ Critical Delay Warning: ETA Exceeds Safe-Until!
            </div>
            <div className="text-xs text-rose-100 leading-relaxed">
              The estimated arrival time ({formatTime(order.transport!.etaAt)}) is later than the food safety limit ({formatTime(post.safeUntil)}). The food may spoil before arrival! Please expedite immediately or arrange faster transport.
            </div>
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6">
        <Stepper status={order.status} />
      </div>

      {/* Pending Quantity Change Request (FR-14, Section 3.4.E) */}
      {order.pendingQtyChange && (
        <div className="bg-amber-50 rounded-3xl border-2 border-amber-300 p-6 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Quantity Change Requested</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Donor requested to update the order from <strong>{order.qty} plates</strong> to{' '}
                <strong>{order.pendingQtyChange.newQty} plates</strong>.
              </p>
            </div>

            {isReceiver ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRespondQtyChange(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Accept ({order.pendingQtyChange.newQty} plates)
                </button>
                <button
                  onClick={() => handleRespondQtyChange(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Decline & Cancel
                </button>
              </div>
            ) : (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200">
                Waiting for receiver response...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Order Info & Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Post Summary */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{post.eventName}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {post.foodType}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Claimed Amount</span>
              <span className="text-xl font-black text-emerald-700">{order.qty} plates</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Pickup Location:</span>
                <span>{post.locationText} ({post.areaId})</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Transit Distance:</span>
                <span>{distance} km estimated journey</span>
              </div>
            </div>
          </div>

          {/* Donor Qty Change trigger */}
          {isDonor && ['ACCEPTED', 'CONFIRMED', 'READY'].includes(order.status) && !order.pendingQtyChange && (
            <div className="pt-2">
              {!isChangingQty ? (
                <button
                  onClick={() => {
                    setNewRequestedQty(order.qty);
                    setIsChangingQty(true);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Need to change plate quantity?
                </button>
              ) : (
                <form onSubmit={handleRequestQtyChange} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">New quantity:</span>
                  <input
                    type="number"
                    min={1}
                    value={newRequestedQty}
                    onChange={(e) => setNewRequestedQty(parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs border rounded-lg bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Send Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingQty(false)}
                    className="text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Other Party Contact Card (FR-6) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              {isDonor ? 'Recipient Organization' : 'Food Donor Contact'}
            </span>

            {otherUser && (
              <div>
                <div className="font-bold text-base text-slate-900">
                  {otherUser.orgName || otherUser.name}
                </div>
                {otherUser.orgType && (
                  <div className="text-xs text-blue-700 font-medium">
                    Type: {otherUser.orgType}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">
                  Contact Person: {otherUser.name}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Phone: {otherUser.phone}
                </div>
              </div>
            )}
          </div>

          {otherUser && (
            <a
              href={`tel:${otherUser.phone}`}
              className="w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Direct Phone Call</span>
            </a>
          )}
        </div>
      </div>

      {/* SECTION 1: Delivery Method Decision (FR-7, FR-8, Section 3.3) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Step 1: Transport & Delivery Agreement</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Either side proposes a method. When the other agrees, the method is locked and confirmed.
            </p>
          </div>

          {order.method && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Confirmed
            </span>
          )}
        </div>

        {/* If method is NOT yet locked (Accepted state) */}
        {!order.method && (
          <div className="space-y-6">
            {/* Show pending proposal if present */}
            {order.proposal && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      Pending Proposal from {order.proposal.proposedBy === role ? 'You' : order.proposal.proposedBy === 'donor' ? 'Food Donor' : 'Recipient Org'}
                    </span>
                    {isProposalCustom && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                        Live App Quote
                      </span>
                    )}
                  </div>
                  <div className="text-base font-extrabold flex items-center gap-2">
                    <span>{DELIVERY_METHOD_DETAILS[order.proposal.method].label}</span>
                    <span className="text-sm font-bold text-indigo-900 bg-white/80 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {isProposalFree ? 'Free (₹0)' : `₹${proposalFare}`}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-800">
                    {DELIVERY_METHOD_DETAILS[order.proposal.method].description}
                  </div>
                  {!isProposalFree && (
                    <div className="text-xs font-semibold text-indigo-900 pt-1 flex items-center gap-3">
                      <span>Donor Share: <strong>₹{proposalShares.donor}</strong></span>
                      <span>•</span>
                      <span>Receiver Share: <strong>₹{proposalShares.receiver}</strong></span>
                    </div>
                  )}
                </div>

                {order.proposal.proposedBy !== role ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <button
                      onClick={handleAgreeMethod}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Agree & Confirm {isProposalFree ? '' : `(₹${proposalFare})`}</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-indigo-600 italic bg-white/60 p-2.5 rounded-xl border border-indigo-100">
                    Waiting for the other party to confirm or counter-propose...
                  </span>
                )}
              </div>
            )}

            {/* Proposal Options & Custom Price Controls */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {order.proposal ? 'Or Propose a Different Method & Quote:' : 'Select a Delivery Method to Propose:'}
              </label>

              {/* Delivery Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(DELIVERY_METHOD_DETAILS) as DeliveryMethod[]).map((mKey) => {
                  const m = DELIVERY_METHOD_DETAILS[mKey];
                  const cardCost = m.isFree ? 0 : parsedFare;
                  const shares = calculateShares(mKey, cardCost);
                  const isSelected = selectedMethod === mKey;

                  return (
                    <div
                      key={mKey}
                      onClick={() => setSelectedMethod(mKey)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-slate-900">{m.label}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.isFree
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.isFree ? 'Free' : `₹${parsedFare}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">
                          {m.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[11px] space-y-0.5 text-slate-600">
                        <div>
                          <strong>Who pays:</strong> {m.whoPays}
                        </div>
                        {!m.isFree && (
                          <div className="text-slate-500">
                            Donor: ₹{shares.donor} | Receiver: ₹{shares.receiver}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Delivery Fare Input Box (Visible for paid delivery methods) */}
              {!isSelectedMethodFree && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Delivery Fare (₹) — Porter / Dunzo / Rapido / Uber Auto
                        </span>
                        {parsedFare !== currentEstCost && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Custom Fare Override
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Distance estimate is <strong>₹{currentEstCost}</strong> ({distance} km journey). Check live rates on courier apps and enter below.
                      </p>
                    </div>

                    {parsedFare !== currentEstCost && (
                      <button
                        type="button"
                        onClick={() => setCustomCostInput(String(currentEstCost))}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset to Estimate (₹{currentEstCost})
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min={0}
                        max={100000}
                        step={1}
                        value={customCostInput}
                        onChange={(e) => setCustomCostInput(e.target.value)}
                        placeholder={String(currentEstCost)}
                        className="w-full text-sm font-bold pl-8 pr-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    {/* Quick increment / shortcut pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Shortcuts:</span>
                      <button
                        type="button"
                        onClick={() => setCustomCostInput(String(currentEstCost))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          parsedFare === currentEstCost
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{currentEstCost} (Est)
                      </button>
                      {[20, 50, 100].map((add) => (
                        <button
                          key={add}
                          type="button"
                          onClick={() => {
                            const nextVal = Math.min(100000, parsedFare + add);
                            setCustomCostInput(String(nextVal));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all"
                        >
                          +₹{add}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Dynamic Split Preview */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-600 font-medium">
                      Live Share Calculation for <strong>{DELIVERY_METHOD_DETAILS[selectedMethod].label}</strong>:
                    </div>
                    <div className="flex items-center gap-3 font-bold text-slate-900">
                      <span className="text-emerald-700">Donor: ₹{activeShares.donor}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-blue-700">Receiver: ₹{activeShares.receiver}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-900">Total: ₹{effectiveFare}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {isSelectedMethodFree
                    ? 'Free transport method. Neither party will be charged.'
                    : `Proposing ${DELIVERY_METHOD_DETAILS[selectedMethod].label} with total fare ₹${effectiveFare}.`}
                </div>

                <button
                  type="button"
                  onClick={() => handleProposeMethod(selectedMethod)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>
                    Send Proposal {isSelectedMethodFree ? '' : `(₹${effectiveFare})`} to {role === 'donor' ? 'Recipient' : 'Donor'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* If method IS Confirmed */}
        {order.method && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Agreed Delivery Method
                </span>
                <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{DELIVERY_METHOD_DETAILS[order.method].label}</span>
                  {!DELIVERY_METHOD_DETAILS[order.method].isFree && order.estCost !== undefined && (
                    <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      {order.estCost !== currentEstCost ? 'Live App Quote' : `Distance Est (${distance} km)`}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {DELIVERY_METHOD_DETAILS[order.method].description}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Total Transport Cost</span>
                <div className="text-xl font-black text-slate-900">
                  {DELIVERY_METHOD_DETAILS[order.method].isFree ? '₹0 (Free)' : `₹${order.estCost}`}
                </div>
                {!DELIVERY_METHOD_DETAILS[order.method].isFree && ['CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustCostInput(String(order.estCost || currentEstCost));
                      setIsAdjustingCost(!isAdjustingCost);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 mt-1 inline-flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>{isAdjustingCost ? 'Close Adjust' : 'Adjust Fare'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Adjust Fare Form */}
            {isAdjustingCost && !DELIVERY_METHOD_DETAILS[order.method].isFree && (
              <form onSubmit={handleAdjustCost} className="p-3.5 bg-white rounded-xl border border-indigo-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 shrink-0">New Transport Fare (₹):</span>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  step={1}
                  value={adjustCostInput}
                  onChange={(e) => setAdjustCostInput(e.target.value)}
                  className="w-full sm:w-28 px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-bold"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save & Re-calculate Shares
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdjustingCost(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Split and payment breakdown for paid methods */}
            {!DELIVERY_METHOD_DETAILS[order.method].isFree && order.shares && (
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Donor Share */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">Donor Share:</span>
                    <span className="font-bold text-slate-900 ml-1">₹{order.shares.donor}</span>
                  </div>
                  {order.shares.donor === 0 ? (
                    <span className="text-slate-400 font-medium text-[11px]">Not Required (₹0)</span>
                  ) : order.paymentDone.donor ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : isDonor ? (
                    <button
                      onClick={() => markPaymentDone(order.id, 'donor')}
                      className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200"
                    >
                      Mark as Paid
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Pending</span>
                  )}
                </div>

                {/* Receiver Share */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">Receiver Share:</span>
                    <span className="font-bold text-slate-900 ml-1">₹{order.shares.receiver}</span>
                  </div>
                  {order.shares.receiver === 0 ? (
                    <span className="text-slate-400 font-medium text-[11px]">Not Required (₹0)</span>
                  ) : order.paymentDone.receiver ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : isReceiver ? (
                    <button
                      onClick={() => markPaymentDone(order.id, 'receiver')}
                      className="px-2 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold border border-blue-200"
                    >
                      Mark as Paid
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Pending</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Transport & Vehicle Details (FR-9) */}
      {order.status !== 'ACCEPTED' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span>Step 2: Transport & Vehicle Information</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.method === 'SELF_PICKUP'
                  ? 'Receiver specifies volunteer / collector details.'
                  : 'Donor specifies assigned driver and vehicle details.'}
              </p>
            </div>

            {order.transport && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Transport Assigned
              </span>
            )}
          </div>

          {/* If transport is ALREADY saved */}
          {order.transport ? (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Vehicle Type</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {order.transport.vehicleType}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Number Plate</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                    {order.transport.numberPlate}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">
                    {order.transport.personName ? 'Collector / Driver' : 'Driver Contact'}
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {order.transport.personName || 'Assigned Driver'}
                  </span>
                  <span className="font-mono text-slate-600">{order.transport.phone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Estimated Arrival (ETA)</span>
                  <span className={`font-bold text-sm mt-0.5 block ${isEtaOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatTime(order.transport.etaAt)}
                  </span>
                  {isEtaOverdue && (
                    <span className="text-[10px] text-rose-600 font-bold block">
                      ⚠️ Past safe limit!
                    </span>
                  )}
                </div>
              </div>

              {/* Edit ETA action (FR-13) */}
              {!isCompleted && order.status !== 'CANCELLED' && (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  {!isEditingEta ? (
                    <button
                      onClick={() => setIsEditingEta(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Update Estimated Arrival Time (Delay)
                    </button>
                  ) : (
                    <form onSubmit={handleUpdateEta} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600 font-medium">Arrival in:</span>
                      <select
                        value={newEtaMinutes}
                        onChange={(e) => setNewEtaMinutes(parseInt(e.target.value))}
                        className="p-1 border rounded-lg bg-white"
                      >
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={240}>4 hours (Delay)</option>
                      </select>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold"
                      >
                        Save New ETA
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingEta(false)}
                        className="text-slate-500"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Transport entry form (FR-9) */
            (order.method === 'SELF_PICKUP' ? isReceiver : isDonor) ? (
              <form onSubmit={handleSaveTransport} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.method === 'SELF_PICKUP' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Collector Volunteer Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        placeholder="e.g. Ramesh Babu"
                        className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Vehicle Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="Three-Wheeler Auto">Three-Wheeler Auto</option>
                      <option value="Mini Delivery Van (Tata Ace)">Mini Delivery Van (Tata Ace)</option>
                      <option value="Two-Wheeler / Bike">Two-Wheeler / Bike</option>
                      <option value="Four-Wheeler Car">Four-Wheeler Car</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Vehicle Number Plate <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={numberPlate}
                      onChange={(e) => setNumberPlate(e.target.value)}
                      placeholder="e.g. KA01AB1234"
                      className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Driver / Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder={currentUser?.phone || '10 digits'}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Estimated Arrival Time (ETA) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={etaMinutes}
                      onChange={(e) => setEtaMinutes(parseInt(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value={15}>In 15 minutes</option>
                      <option value={30}>In 30 minutes</option>
                      <option value={45}>In 45 minutes</option>
                      <option value={60}>In 1 hour</option>
                      <option value={120}>In 2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm"
                  >
                    Submit Transport Details (Marks Order Ready)
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                Waiting for {order.method === 'SELF_PICKUP' ? 'the receiver' : 'the donor'} to submit vehicle and driver details.
              </div>
            )
          )}
        </div>
      )}

      {/* SECTION 3: Delivery Progression Controls (FR-10) */}
      {order.status === 'READY' && (
        <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="font-bold text-sm text-emerald-900">
              Transport is Ready for Dispatch
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              {order.method === 'SELF_PICKUP'
                ? 'Receiver can mark collector on the way.'
                : 'Donor can confirm vehicle departure.'}
            </p>
          </div>

          {(order.method === 'SELF_PICKUP' ? isReceiver : isDonor) ? (
            <button
              onClick={handleStartDelivery}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>
                {order.method === 'SELF_PICKUP' ? 'Collector on the Way' : 'Start Delivery (Out for Delivery)'}
              </span>
            </button>
          ) : (
            <span className="text-xs font-medium text-emerald-800 italic">
              Awaiting departure confirmation from {order.method === 'SELF_PICKUP' ? 'receiver' : 'donor'}...
            </span>
          )}
        </div>
      )}

      {order.status === 'OUT_FOR_DELIVERY' && (
        <div className="bg-purple-50 rounded-3xl border border-purple-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="font-bold text-sm text-purple-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600 animate-pulse" />
              <span>Surplus Food is Out for Delivery!</span>
            </div>
            <p className="text-xs text-purple-700 mt-0.5">
              Vehicle is in transit. Receiver should verify and mark received upon arrival.
            </p>
          </div>

          {isReceiver ? (
            <button
              onClick={handleMarkDelivered}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 shadow-md shadow-purple-700/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Food Received (Mark Delivered)</span>
            </button>
          ) : (
            <span className="text-xs font-medium text-purple-800 italic">
              Waiting for recipient organization to inspect and mark received...
            </span>
          )}
        </div>
      )}

      {order.status === 'DELIVERED' && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl text-white p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-base">Delivered & Safely Distributed!</h4>
              <p className="text-xs text-teal-100">
                {order.qty} plates reached people in need before the food safety expiration limit.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white text-teal-900 rounded-xl text-xs font-bold hover:bg-teal-50 shadow-sm transition-colors"
          >
            View Impact Metrics
          </button>
        </div>
      )}

      {/* Cancellation Footer Trigger (FR-11) */}
      {canCancel && (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500">
            Encountered an emergency or insurmountable issue?
          </div>
          <button
            type="button"
            onClick={() => setIsCancelOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel This Order</span>
          </button>
        </div>
      )}

      {/* Cancel Dialog Modal */}
      <CancelDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        userRole={role}
        qty={order.qty}
      />
    </div>
  );
};
