import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAreaDistance, estimateCost, calculateShares } from './lib/distance';
import { createNotification } from './lib/notify';
import { getInitialSeedData } from './lib/seed';
import { now, registerTimeOffsetGetter } from './lib/time';
import {
  ActionResult,
  AppState,
  DeliveryMethod,
  FoodPost,
  Order,
  Role,
  User
} from './types';
import {
  validatePhone,
  validatePlate,
  validateQuantity,
  validateReason,
  validateCustomFare
} from './lib/validators';

const SESSION_USER_KEY = 'ahara_session_user_id';

function getSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_USER_KEY);
}

function setSessionUserId(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) {
    sessionStorage.setItem(SESSION_USER_KEY, id);
  } else {
    sessionStorage.removeItem(SESSION_USER_KEY);
  }
}

interface StoreState extends AppState {
  // Auth Actions
  registerUser: (data: Omit<User, 'id'>) => ActionResult;
  loginUser: (id: string) => ActionResult;
  logoutUser: () => void;
  switchUser: (id: string) => ActionResult;

  // Domain Actions
  createPost: (data: {
    foodType: string;
    eventName: string;
    totalQty: number;
    safeHours: number;
    locationText: string;
    areaId: string;
    contactPhone: string;
  }) => ActionResult;
  editPostRemaining: (postId: string, newRemaining: number) => ActionResult;
  withdrawPost: (postId: string) => ActionResult;
  acceptPost: (postId: string, qty: number) => ActionResult;
  dispatchToAnimalFeed: (
    postId: string,
    data: {
      shelterId: string;
      shelterName: string;
      deliveryType: 'self' | 'transport';
      fare?: number;
      phone: string;
    }
  ) => ActionResult;
  proposeMethod: (
    orderId: string,
    method: DeliveryMethod,
    by: Role,
    customCost?: number
  ) => ActionResult;
  agreeMethod: (orderId: string, by: Role) => ActionResult;
  adjustOrderCost: (orderId: string, newCost: number) => ActionResult;
  saveTransport: (
    orderId: string,
    data: {
      vehicleType: string;
      numberPlate: string;
      phone: string;
      personName?: string;
      etaAt: number;
    }
  ) => ActionResult;
  updateEta: (orderId: string, newEtaAt: number) => ActionResult;
  startDelivery: (orderId: string) => ActionResult;
  markDelivered: (orderId: string) => ActionResult;
  cancelOrder: (orderId: string, by: Role, reason: string) => ActionResult;
  requestQtyChange: (orderId: string, newQty: number) => ActionResult;
  respondQtyChange: (orderId: string, accept: boolean) => ActionResult;
  markPaymentDone: (orderId: string, by: Role) => ActionResult;
  markNotificationRead: (id: string) => ActionResult;
  markAllNotificationsRead: (userId: string) => ActionResult;
  runExpiryCheck: () => void;
  addTimeOffset: (deltaMs: number) => void;
  resetTimeOffset: () => void;
  clearAllData: () => void;
  resetDemo: () => ActionResult;
}

const initialSeed = getInitialSeedData();

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: initialSeed.users,
      posts: initialSeed.posts,
      orders: initialSeed.orders,
      notifications: initialSeed.notifications,
      currentUserId: getSessionUserId(),
      timeOffsetMs: 0,

      registerUser: (data) => {
        try {
          if (!data.name.trim()) {
            return { ok: false, message: 'Name is required' };
          }
          const phoneVal = validatePhone(data.phone);
          if (!phoneVal.valid) {
            return { ok: false, message: phoneVal.error || 'Invalid phone' };
          }
          if (data.role === 'receiver') {
            if (!data.orgName?.trim()) {
              return { ok: false, message: 'Organization name is required for receivers' };
            }
            if (!data.orgType) {
              return { ok: false, message: 'Organization type is required for receivers' };
            }
          }

          // Check if user with same phone and role already exists
          const existing = get().users.find(
            (u) => u.phone === data.phone.trim() && u.role === data.role
          );
          if (existing) {
            setSessionUserId(existing.id);
            set({ currentUserId: existing.id });
            return { ok: true, id: existing.id };
          }

          const newUser: User = {
            id: crypto.randomUUID(),
            role: data.role,
            name: data.name.trim(),
            phone: data.phone.trim(),
            areaId: data.areaId,
            orgName: data.role === 'receiver' ? data.orgName?.trim() : undefined,
            orgType: data.role === 'receiver' ? data.orgType : undefined
          };

          setSessionUserId(newUser.id);

          set((state) => ({
            users: [...state.users, newUser],
            currentUserId: newUser.id
          }));

          return { ok: true, id: newUser.id };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to register user' };
        }
      },

      loginUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        if (!user) return { ok: false, message: 'User account not found' };
        setSessionUserId(id);
        set({ currentUserId: id });
        return { ok: true, id };
      },

      logoutUser: () => {
        setSessionUserId(null);
        set({ currentUserId: null });
      },

      switchUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        if (!user) return { ok: false, message: 'User not found' };
        setSessionUserId(id);
        set({ currentUserId: id });
        return { ok: true };
      },

      createPost: (data) => {
        try {
          const user = get().users.find((u) => u.id === get().currentUserId);
          if (!user || user.role !== 'donor') {
            return { ok: false, message: 'Only registered donors can post food' };
          }
          if (!data.foodType.trim() || !data.eventName.trim() || !data.locationText.trim()) {
            return { ok: false, message: 'All fields are required' };
          }
          const qtyVal = validateQuantity(data.totalQty);
          if (!qtyVal.valid) {
            return { ok: false, message: qtyVal.error || 'Invalid quantity' };
          }
          if (data.safeHours <= 0 || isNaN(data.safeHours)) {
            return { ok: false, message: 'Safe hours must be greater than 0' };
          }
          const phoneVal = validatePhone(data.contactPhone);
          if (!phoneVal.valid) {
            return { ok: false, message: phoneVal.error || 'Invalid contact phone' };
          }

          const currentTime = now();
          const safeUntil = currentTime + data.safeHours * 3600 * 1000;
          const postId = crypto.randomUUID();

          const newPost: FoodPost = {
            id: postId,
            donorId: user.id,
            foodType: data.foodType.trim(),
            eventName: data.eventName.trim(),
            totalQty: data.totalQty,
            remainingQty: data.totalQty,
            locationText: data.locationText.trim(),
            areaId: data.areaId,
            contactPhone: data.contactPhone.trim(),
            createdAt: currentTime,
            safeHours: data.safeHours,
            safeUntil,
            status: 'OPEN',
            warnedAt30: false
          };

          // Notify all registered receivers
          const receiverNotifications = get()
            .users.filter((u) => u.role === 'receiver')
            .map((receiver) => {
              const dist = getAreaDistance(receiver.areaId, data.areaId);
              return createNotification(
                receiver.id,
                'New Food Available',
                `${data.eventName} posted ${data.totalQty} plates of ${data.foodType} (${dist} km away).`,
                postId
              );
            });

          set((state) => ({
            posts: [newPost, ...state.posts],
            notifications: [...receiverNotifications, ...state.notifications]
          }));

          return { ok: true, id: postId };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to create post' };
        }
      },

      editPostRemaining: (postId, newRemaining) => {
        try {
          const post = get().posts.find((p) => p.id === postId);
          if (!post) return { ok: false, message: 'Post not found' };
          if (post.donorId !== get().currentUserId) {
            return { ok: false, message: 'Only the donor can edit post quantity' };
          }
          if (post.status !== 'OPEN') {
            return { ok: false, message: 'Cannot edit quantity of a non-open post' };
          }
          if (newRemaining < 0 || !Number.isInteger(newRemaining)) {
            return { ok: false, message: 'Quantity must be 0 or a positive whole number' };
          }

          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, remainingQty: newRemaining } : p
            )
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to update remaining quantity' };
        }
      },

      withdrawPost: (postId) => {
        try {
          const post = get().posts.find((p) => p.id === postId);
          if (!post) return { ok: false, message: 'Post not found' };
          if (post.donorId !== get().currentUserId) {
            return { ok: false, message: 'Only the donor can withdraw this post' };
          }

          const activeOrders = get().orders.filter(
            (o) =>
              o.postId === postId &&
              ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
          );

          if (activeOrders.length > 0) {
            return {
              ok: false,
              message:
                'Cannot withdraw post with active orders. Please resolve or cancel active orders first.'
            };
          }

          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, status: 'WITHDRAWN' } : p
            )
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to withdraw post' };
        }
      },

      acceptPost: (postId, qty) => {
        try {
          const state = get();
          const post = state.posts.find((p) => p.id === postId);
          if (!post) return { ok: false, message: 'Post not found' };

          const currentTime = now();
          if (post.status !== 'OPEN' || currentTime >= post.safeUntil) {
            return { ok: false, message: 'This food post is no longer available or has expired' };
          }

          if (post.remainingQty <= 0) {
            return { ok: false, message: 'This food was just taken by another recipient' };
          }

          if (qty > post.remainingQty) {
            return { ok: false, message: `Only ${post.remainingQty} plates left` };
          }

          const user = state.users.find((u) => u.id === state.currentUserId);
          if (!user || user.role !== 'receiver') {
            return { ok: false, message: 'Only registered receivers can accept food' };
          }

          const orderId = crypto.randomUUID();
          const newOrder: Order = {
            id: orderId,
            postId,
            donorId: post.donorId,
            receiverId: user.id,
            qty,
            status: 'ACCEPTED',
            createdAt: currentTime,
            paymentDone: { donor: false, receiver: false }
          };

          const donorNotification = createNotification(
            post.donorId,
            'Food Accepted',
            `${user.orgName || user.name} accepted ${qty} plates of ${post.foodType}. Agree on a delivery method next.`,
            postId,
            orderId
          );

          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === postId ? { ...p, remainingQty: p.remainingQty - qty } : p
            ),
            orders: [newOrder, ...s.orders],
            notifications: [donorNotification, ...s.notifications]
          }));

          return { ok: true, id: orderId };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to accept food' };
        }
      },

      dispatchToAnimalFeed: (postId, data) => {
        try {
          const post = get().posts.find((p) => p.id === postId);
          if (!post) return { ok: false, message: 'Post not found' };
          if (post.donorId !== get().currentUserId) {
            return { ok: false, message: 'Only the donor can dispatch to animal feeding' };
          }
          if (post.remainingQty <= 0) {
            return { ok: false, message: 'No surplus food remaining to dispatch' };
          }

          const dispatchedQty = post.remainingQty;
          const dispatchRecord = {
            shelterId: data.shelterId,
            shelterName: data.shelterName,
            deliveryType: data.deliveryType,
            fare: data.deliveryType === 'transport' ? data.fare || 80 : 0,
            phone: data.phone,
            at: now(),
            qty: dispatchedQty
          };

          const notif = createNotification(
            post.donorId,
            '🐾 Food Dispatched to Gaushala / Animal Shelter',
            `${dispatchedQty} plates from "${post.eventName}" have been routed to ${data.shelterName} (${data.deliveryType === 'self' ? 'Self Delivery' : 'Goodwill Courier'}). 100% zero waste achieved!`,
            post.id
          );

          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    remainingQty: 0,
                    status: 'EXPIRED' as const,
                    animalFeedDispatch: dispatchRecord
                  }
                : p
            ),
            notifications: [notif, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to dispatch to animal feeding' };
        }
      },

      proposeMethod: (orderId, method, by, customCost) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          if (['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
            return { ok: false, message: 'Cannot propose method on a closed order' };
          }

          const isFree = method === 'SELF_PICKUP' || method === 'DONOR_DROP';
          let validCustomCost: number | undefined = undefined;

          if (!isFree && customCost !== undefined) {
            const fareVal = validateCustomFare(customCost);
            if (!fareVal.valid) {
              return { ok: false, message: fareVal.error || 'Invalid custom delivery fare' };
            }
            validCustomCost = Math.round(customCost);
          }

          const proposal = {
            method,
            proposedBy: by,
            at: now(),
            customCost: isFree ? 0 : validCustomCost
          };

          const targetUserId = by === 'donor' ? order.receiverId : order.donorId;
          const costSuffix =
            !isFree && validCustomCost !== undefined ? ` (₹${validCustomCost})` : '';
          const notif = createNotification(
            targetUserId,
            'Delivery Method Proposed',
            `${by === 'donor' ? 'Donor' : 'Receiver'} proposed: ${method.replace('_', ' ')}${costSuffix}. Please review and agree or propose different.`,
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId ? { ...o, proposal } : o
            ),
            notifications: [notif, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to propose delivery method' };
        }
      },

      agreeMethod: (orderId, by) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          if (!order.proposal) {
            return { ok: false, message: 'No pending delivery method proposal' };
          }
          if (order.proposal.proposedBy === by) {
            return { ok: false, message: 'You cannot agree to your own proposal' };
          }

          const agreedMethod = order.proposal.method;
          const isFree = agreedMethod === 'SELF_PICKUP' || agreedMethod === 'DONOR_DROP';

          const donor = get().users.find((u) => u.id === order.donorId);
          const receiver = get().users.find((u) => u.id === order.receiverId);
          const dist = getAreaDistance(donor?.areaId || '', receiver?.areaId || '');
          const baselineCost = estimateCost(dist);

          const cost = isFree
            ? 0
            : (typeof order.proposal.customCost === 'number' && order.proposal.customCost >= 0
                ? order.proposal.customCost
                : baselineCost);

          const shares = calculateShares(agreedMethod, cost);

          const costSuffix = !isFree ? ` (₹${cost})` : '';
          const notifDonor = createNotification(
            order.donorId,
            'Delivery Method Confirmed',
            `Both sides confirmed ${agreedMethod.replace('_', ' ')}${costSuffix}. Next step: add transport/vehicle details.`,
            order.postId,
            orderId
          );
          const notifReceiver = createNotification(
            order.receiverId,
            'Delivery Method Confirmed',
            `Both sides confirmed ${agreedMethod.replace('_', ' ')}${costSuffix}. Next step: add transport/collector details.`,
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    method: agreedMethod,
                    estCost: cost,
                    shares,
                    paymentDone: {
                      donor: shares.donor === 0,
                      receiver: shares.receiver === 0
                    },
                    status: 'CONFIRMED',
                    proposal: undefined
                  }
                : o
            ),
            notifications: [notifDonor, notifReceiver, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to agree to method' };
        }
      },

      adjustOrderCost: (orderId, newCost) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          if (!order.method) {
            return { ok: false, message: 'Delivery method must be agreed first' };
          }
          if (['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
            return { ok: false, message: 'Cannot adjust delivery cost on a closed order' };
          }
          const isFree = order.method === 'SELF_PICKUP' || order.method === 'DONOR_DROP';
          if (isFree) {
            return { ok: false, message: 'Cannot set a delivery cost for free pickup/drop' };
          }
          const fareVal = validateCustomFare(newCost);
          if (!fareVal.valid) {
            return { ok: false, message: fareVal.error || 'Invalid delivery fare' };
          }

          const roundedCost = Math.round(newCost);
          const shares = calculateShares(order.method, roundedCost);

          const notifDonor = createNotification(
            order.donorId,
            'Delivery Fare Adjusted',
            `Delivery fare adjusted to ₹${roundedCost}. Shares updated: Donor: ₹${shares.donor}, Receiver: ₹${shares.receiver}.`,
            order.postId,
            orderId
          );
          const notifReceiver = createNotification(
            order.receiverId,
            'Delivery Fare Adjusted',
            `Delivery fare adjusted to ₹${roundedCost}. Shares updated: Donor: ₹${shares.donor}, Receiver: ₹${shares.receiver}.`,
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    estCost: roundedCost,
                    shares,
                    paymentDone: {
                      donor: shares.donor === 0,
                      receiver: shares.receiver === 0
                    }
                  }
                : o
            ),
            notifications: [notifDonor, notifReceiver, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to adjust delivery fare' };
        }
      },

      saveTransport: (orderId, data) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          if (order.status !== 'CONFIRMED' && order.status !== 'READY') {
            return { ok: false, message: 'Order must be confirmed before adding transport details' };
          }

          const plateVal = validatePlate(data.numberPlate);
          if (!plateVal.valid) {
            return { ok: false, message: plateVal.error || 'Invalid vehicle number' };
          }
          const phoneVal = validatePhone(data.phone);
          if (!phoneVal.valid) {
            return { ok: false, message: phoneVal.error || 'Invalid contact phone' };
          }
          if (!data.etaAt || data.etaAt <= 0) {
            return { ok: false, message: 'Valid estimated time is required' };
          }

          const user = get().users.find((u) => u.id === get().currentUserId);
          const role = user?.role || (order.method === 'SELF_PICKUP' ? 'receiver' : 'donor');

          const transport = {
            enteredBy: role,
            vehicleType: data.vehicleType,
            numberPlate: data.numberPlate.trim().toUpperCase(),
            phone: data.phone.trim(),
            personName: data.personName?.trim(),
            etaAt: data.etaAt
          };

          const targetUserId = role === 'donor' ? order.receiverId : order.donorId;
          const notif = createNotification(
            targetUserId,
            'Vehicle Details Provided',
            `Transport details saved for order (${data.vehicleType} - ${transport.numberPlate}). Order is Ready.`,
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId ? { ...o, transport, status: 'READY' } : o
            ),
            notifications: [notif, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to save transport details' };
        }
      },

      updateEta: (orderId, newEtaAt) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order || !order.transport) {
            return { ok: false, message: 'Transport not initialized for order' };
          }
          const post = get().posts.find((p) => p.id === order.postId);
          const isOverdue = post ? newEtaAt > post.safeUntil : false;

          const currentUser = get().users.find((u) => u.id === get().currentUserId);
          const targetUserId =
            currentUser?.id === order.donorId ? order.receiverId : order.donorId;

          const notif = createNotification(
            targetUserId,
            isOverdue ? '⚠️ ETA Alert: Delayed Past Safe-Until!' : 'ETA Updated',
            isOverdue
              ? 'Warning: The updated delivery arrival time is after the safe-until food safety limit!'
              : `The estimated arrival time has been updated for this order.`,
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    transport: { ...o.transport!, etaAt: newEtaAt }
                  }
                : o
            ),
            notifications: [notif, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to update ETA' };
        }
      },

      startDelivery: (orderId) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          if (order.status !== 'READY') {
            return { ok: false, message: 'Order must be Ready before starting delivery' };
          }

          const notif = createNotification(
            order.receiverId,
            'Order Out for Delivery',
            'Your food order is on the way. Please be ready to receive it.',
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId ? { ...o, status: 'OUT_FOR_DELIVERY' } : o
            ),
            notifications: [notif, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to start delivery' };
        }
      },

      markDelivered: (orderId) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          const user = get().users.find((u) => u.id === get().currentUserId);
          if (user?.role !== 'receiver') {
            return { ok: false, message: 'Only the receiver can confirm delivery' };
          }
          if (order.status !== 'OUT_FOR_DELIVERY' && order.status !== 'READY') {
            return { ok: false, message: 'Order cannot be marked delivered in current state' };
          }

          const notif = createNotification(
            order.donorId,
            'Food Delivered Successfully!',
            `${user.orgName || user.name} received ${order.qty} plates. Thank you for making an impact!`,
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId
                ? { ...o, status: 'DELIVERED', deliveredAt: now() }
                : o
            ),
            notifications: [notif, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to mark delivered' };
        }
      },

      cancelOrder: (orderId, by, reason) => {
        try {
          const reasonVal = validateReason(reason);
          if (!reasonVal.valid) {
            return { ok: false, message: reasonVal.error || 'A reason is mandatory' };
          }

          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          if (['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
            return { ok: false, message: 'Order is already closed' };
          }

          const post = get().posts.find((p) => p.id === order.postId);
          const targetUserId = by === 'donor' ? order.receiverId : order.donorId;

          const notifOther = createNotification(
            targetUserId,
            'Order Cancelled',
            `Order for ${order.qty} plates was cancelled by ${by}. Reason: "${reason.trim()}".`,
            order.postId,
            orderId
          );

          const receiversNotifs = get()
            .users.filter((u) => u.role === 'receiver')
            .map((r) =>
              createNotification(
                r.id,
                'Food Available Again',
                `${order.qty} plates of ${post?.foodType || 'food'} from ${post?.eventName || 'event'} reopened for request.`,
                order.postId
              )
            );

          set((s) => ({
            posts: s.posts.map((p) =>
              p.id === order.postId
                ? {
                    ...p,
                    remainingQty: p.remainingQty + order.qty,
                    status: p.status === 'OPEN' ? 'OPEN' : p.status
                  }
                : p
            ),
            orders: s.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    status: 'CANCELLED',
                    cancel: { by, reason: reason.trim(), at: now() }
                  }
                : o
            ),
            notifications: [notifOther, ...receiversNotifs, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to cancel order' };
        }
      },

      requestQtyChange: (orderId, newQty) => {
        try {
          const user = get().users.find((u) => u.id === get().currentUserId);
          if (user?.role !== 'donor') {
            return { ok: false, message: 'Only the donor can request a quantity change' };
          }

          const order = get().orders.find((o) => o.id === orderId);
          if (!order) return { ok: false, message: 'Order not found' };
          if (['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
            return { ok: false, message: 'Cannot edit quantity of a completed/cancelled order' };
          }

          const post = get().posts.find((p) => p.id === order.postId);
          if (!post) return { ok: false, message: 'Associated post not found' };

          const diff = newQty - order.qty;
          if (diff > 0 && diff > post.remainingQty) {
            return {
              ok: false,
              message: `Only ${post.remainingQty} additional plates available on the post`
            };
          }

          const notif = createNotification(
            order.receiverId,
            'Quantity Change Requested',
            `Donor requested to change order quantity from ${order.qty} to ${newQty} plates. Please confirm or decline.`,
            order.postId,
            orderId
          );

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    pendingQtyChange: { newQty, at: now() }
                  }
                : o
            ),
            notifications: [notif, ...s.notifications]
          }));

          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to request quantity change' };
        }
      },

      respondQtyChange: (orderId, accept) => {
        try {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order || !order.pendingQtyChange) {
            return { ok: false, message: 'No pending quantity change to respond to' };
          }

          const user = get().users.find((u) => u.id === get().currentUserId);
          if (user?.role !== 'receiver') {
            return { ok: false, message: 'Only the receiver can respond to quantity changes' };
          }

          const post = get().posts.find((p) => p.id === order.postId);
          const newQty = order.pendingQtyChange.newQty;

          if (accept) {
            const diff = newQty - order.qty;
            const notif = createNotification(
              order.donorId,
              'Quantity Change Accepted',
              `${user.orgName || user.name} accepted the new quantity of ${newQty} plates.`,
              order.postId,
              orderId
            );

            set((s) => ({
              posts: s.posts.map((p) =>
                p.id === order.postId
                  ? { ...p, remainingQty: Math.max(0, p.remainingQty - diff) }
                  : p
              ),
              orders: s.orders.map((o) =>
                o.id === orderId
                  ? { ...o, qty: newQty, pendingQtyChange: undefined }
                  : o
              ),
              notifications: [notif, ...s.notifications]
            }));

            return { ok: true };
          } else {
            const notif = createNotification(
              order.donorId,
              'Quantity Change Declined',
              `${user.orgName || user.name} declined the quantity change. Order was cancelled and ${order.qty} plates reopened.`,
              order.postId,
              orderId
            );

            const receiverNotifs = get()
              .users.filter((u) => u.role === 'receiver')
              .map((r) =>
                createNotification(
                  r.id,
                  'Food Available Again',
                  `${order.qty} plates from ${post?.eventName || 'post'} reopened.`,
                  order.postId
                )
              );

            set((s) => ({
              posts: s.posts.map((p) =>
                p.id === order.postId
                  ? { ...p, remainingQty: p.remainingQty + order.qty }
                  : p
              ),
              orders: s.orders.map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      status: 'CANCELLED',
                      pendingQtyChange: undefined,
                      cancel: {
                        by: 'receiver',
                        reason: 'Declined quantity change',
                        at: now()
                      }
                    }
                  : o
              ),
              notifications: [notif, ...receiverNotifs, ...s.notifications]
            }));

            return { ok: true };
          }
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to respond to quantity change' };
        }
      },

      markPaymentDone: (orderId, by) => {
        try {
          set((s) => ({
            orders: s.orders.map((o) => {
              if (o.id !== orderId) return o;
              return {
                ...o,
                paymentDone: {
                  ...o.paymentDone,
                  [by]: true
                }
              };
            })
          }));
          return { ok: true };
        } catch (e: any) {
          return { ok: false, message: e?.message || 'Failed to update payment status' };
        }
      },

      markNotificationRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
        return { ok: true };
      },

      markAllNotificationsRead: (userId) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.toUserId === userId ? { ...n, read: true } : n
          )
        }));
        return { ok: true };
      },

      runExpiryCheck: () => {
        const currentTime = now();
        const { posts, orders } = get();

        let postsModified = false;
        let ordersModified = false;
        const newNotifications: any[] = [];

        const updatedPosts = posts.map((post) => {
          if (post.status === 'OPEN') {
            if (currentTime >= post.safeUntil) {
              postsModified = true;
              return { ...post, status: 'EXPIRED' as const };
            }

            const msLeft = post.safeUntil - currentTime;
            if (msLeft <= 30 * 60 * 1000 && !post.warnedAt30) {
              postsModified = true;

              newNotifications.push(
                createNotification(
                  post.donorId,
                  '🚨 Last 30 Mins: Dispatch to Gaushala & Animal Shelters',
                  `Food from "${post.eventName}" will expire for humans in 30 mins! You can now dispatch the remaining ${post.remainingQty} plates directly to nearby Gaushalas or animal shelters to prevent wastage.`,
                  post.id
                )
              );

              const activeOrderReceivers = orders
                .filter(
                  (o) =>
                    o.postId === post.id &&
                    ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)
                )
                .map((o) => o.receiverId);

              new Set(activeOrderReceivers).forEach((receiverId) => {
                newNotifications.push(
                  createNotification(
                    receiverId,
                    '⚠️ 30-Minute Food Safety Warning',
                    `Your accepted food order from "${post.eventName}" is within 30 minutes of the safe-until limit.`,
                    post.id
                  )
                );
              });

              return { ...post, warnedAt30: true };
            }
          }
          return post;
        });

        const updatedOrders = orders.map((order) => {
          const post = updatedPosts.find((p) => p.id === order.postId);
          if (
            post?.status === 'EXPIRED' &&
            ['ACCEPTED', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY'].includes(order.status)
          ) {
            ordersModified = true;

            newNotifications.push(
              createNotification(
                order.donorId,
                'Order Expired',
                `Order for ${order.qty} plates has expired because the safe-until time elapsed.`,
                order.postId,
                order.id
              )
            );
            newNotifications.push(
              createNotification(
                order.receiverId,
                'Order Expired',
                `Order for ${order.qty} plates expired as the safe-until time has passed.`,
                order.postId,
                order.id
              )
            );

            return { ...order, status: 'EXPIRED' as const };
          }
          return order;
        });

        if (postsModified || ordersModified || newNotifications.length > 0) {
          set((s) => ({
            posts: postsModified ? updatedPosts : s.posts,
            orders: ordersModified ? updatedOrders : s.orders,
            notifications: [...newNotifications, ...s.notifications]
          }));
        }
      },

      addTimeOffset: (deltaMs) => {
        set((s) => ({ timeOffsetMs: s.timeOffsetMs + deltaMs }));
      },

      resetTimeOffset: () => {
        set({ timeOffsetMs: 0 });
      },

      clearAllData: () => {
        setSessionUserId(null);
        set({
          users: [],
          posts: [],
          orders: [],
          notifications: [],
          currentUserId: null,
          timeOffsetMs: 0
        });
      },

      resetDemo: () => {
        setSessionUserId(null);
        set({
          users: [],
          posts: [],
          orders: [],
          notifications: [],
          currentUserId: null,
          timeOffsetMs: 0
        });
        return { ok: true };
      }
    }),
    {
      name: 'ahara_fresh_db_v2', // clean fresh key without old mock data
      version: 2,
      partialize: (state) => ({
        users: state.users,
        posts: state.posts,
        orders: state.orders,
        notifications: state.notifications,
        timeOffsetMs: state.timeOffsetMs
      })
    }
  )
);

// Register time offset getter
registerTimeOffsetGetter(() => useAppStore.getState().timeOffsetMs);

// Cross-tab reactive sync: when localStorage changes in one tab, sync state to other tabs
// while PRESERVING each tab's own currentUserId from sessionStorage!
if (typeof window !== 'undefined') {
  window.addEventListener('storage', async (event) => {
    if (event.key === 'ahara_fresh_db_v2') {
      try {
        await useAppStore.persist.rehydrate();
        // Ensure this tab's session user is retained
        const localSessionUser = getSessionUserId();
        if (localSessionUser !== useAppStore.getState().currentUserId) {
          useAppStore.setState({ currentUserId: localSessionUser });
        }
      } catch (err) {
        console.error('Cross-tab rehydration error:', err);
      }
    }
  });
}
