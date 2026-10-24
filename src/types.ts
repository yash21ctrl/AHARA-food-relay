export type Role = 'donor' | 'receiver';

export type OrgType =
  | 'NGO'
  | 'Orphanage'
  | 'Old-age home'
  | 'Shelter'
  | 'Community kitchen'
  | 'Other';

export type DeliveryMethod =
  | 'SELF_PICKUP'
  | 'DONOR_DROP'
  | 'DONOR_PAYS'
  | 'RECEIVER_PAYS'
  | 'SPLIT';

export type OrderStatus =
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Area {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  phone: string;
  areaId: string;
  orgName?: string;
  orgType?: OrgType; // receivers only
}

export interface FoodPost {
  id: string;
  donorId: string;
  foodType: string;
  eventName: string;
  totalQty: number; // plates, total posted (updated on donor edits)
  remainingQty: number; // unclaimed plates
  locationText: string;
  areaId: string;
  contactPhone: string;
  createdAt: number; // epoch ms
  safeHours: number;
  safeUntil: number; // createdAt + safeHours*3600000. NEVER changes.
  status: 'OPEN' | 'EXPIRED' | 'WITHDRAWN';
  warnedAt30?: boolean; // 30-minute warning already sent
  animalFeedDispatch?: {
    shelterId: string;
    shelterName: string;
    deliveryType: 'self' | 'transport';
    fare?: number;
    phone: string;
    at: number;
    qty: number;
  };
}

export interface GaushalaCenter {
  id: string;
  name: string;
  type: 'Gaushala & Cattle Care' | 'Animal Rescue & Shelter' | 'Community Stray Feeding Hub';
  areaId: string;
  phone: string;
  address: string;
  animalTypes: string;
}

export interface Order {
  id: string;
  postId: string;
  donorId: string;
  receiverId: string;
  qty: number;
  status: OrderStatus;
  createdAt: number;
  proposal?: {
    method: DeliveryMethod;
    proposedBy: Role;
    at: number;
    customCost?: number;
  };
  method?: DeliveryMethod; // set when both agree
  estCost?: number; // INR, only for DONOR_PAYS, RECEIVER_PAYS, SPLIT
  shares?: {
    donor: number;
    receiver: number;
  };
  transport?: {
    enteredBy: Role; // donor normally, receiver for SELF_PICKUP
    vehicleType: string;
    numberPlate: string;
    phone: string;
    personName?: string; // collector name for SELF_PICKUP
    etaAt: number;
  };
  pendingQtyChange?: {
    newQty: number;
    at: number;
  };
  paymentDone: {
    donor: boolean;
    receiver: boolean;
  };
  cancel?: {
    by: Role;
    reason: string;
    at: number;
  };
  deliveredAt?: number;
}

export interface AppNotification {
  id: string;
  toUserId: string;
  title: string;
  body: string;
  postId?: string;
  orderId?: string;
  createdAt: number;
  read: boolean;
}

export interface AppState {
  users: User[];
  posts: FoodPost[];
  orders: Order[];
  notifications: AppNotification[];
  currentUserId: string | null;
  timeOffsetMs: number;
}

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };
