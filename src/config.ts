import { Area, DeliveryMethod, OrgType, GaushalaCenter } from './types';

export const APP_NAME = 'AHARA';
export const APP_TAGLINE = 'Surplus food from events, delivered safely to people in need';

// Preset areas with realistic coordinates (Bengaluru Metro Hubs)
export const PRESET_AREAS: Area[] = [
  { id: 'indiranagar', name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { id: 'koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { id: 'whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { id: 'jayanagar', name: 'Jayanagar', lat: 12.9308, lng: 77.5838 },
  { id: 'hsr', name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  { id: 'malleshwaram', name: 'Malleshwaram', lat: 13.0031, lng: 77.5643 },
  { id: 'electronic-city', name: 'Electronic City', lat: 12.8452, lng: 77.6602 },
  { id: 'hebbal', name: 'Hebbal', lat: 13.0358, lng: 77.5970 }
];

export const ORG_TYPES: OrgType[] = [
  'NGO',
  'Orphanage',
  'Old-age home',
  'Shelter',
  'Community kitchen',
  'Other'
];

export interface DeliveryMethodInfo {
  method: DeliveryMethod;
  label: string;
  whoMoves: string;
  whoPays: string;
  description: string;
  isFree: boolean;
  donorSharePct: number;
  receiverSharePct: number;
}

export const DELIVERY_METHOD_DETAILS: Record<DeliveryMethod, DeliveryMethodInfo> = {
  SELF_PICKUP: {
    method: 'SELF_PICKUP',
    label: 'Self-pickup',
    whoMoves: 'Receiver collects',
    whoPays: 'Nobody (Free)',
    description: 'Receiver sends their own vehicle/volunteer to collect the food.',
    isFree: true,
    donorSharePct: 0,
    receiverSharePct: 0
  },
  DONOR_DROP: {
    method: 'DONOR_DROP',
    label: 'Donor drops it',
    whoMoves: 'Donor delivers',
    whoPays: 'Nobody (Free)',
    description: 'Donor uses their own vehicle to deliver food directly to the receiver.',
    isFree: true,
    donorSharePct: 0,
    receiverSharePct: 0
  },
  DONOR_PAYS: {
    method: 'DONOR_PAYS',
    label: 'Donor pays delivery',
    whoMoves: 'Booked vehicle',
    whoPays: 'Donor (100%)',
    description: 'Donor books and pays 100% of the transport delivery cost.',
    isFree: false,
    donorSharePct: 100,
    receiverSharePct: 0
  },
  RECEIVER_PAYS: {
    method: 'RECEIVER_PAYS',
    label: 'Receiver pays delivery',
    whoMoves: 'Booked vehicle',
    whoPays: 'Receiver (100%)',
    description: 'Receiver books or covers 100% of the transport delivery cost.',
    isFree: false,
    donorSharePct: 0,
    receiverSharePct: 100
  },
  SPLIT: {
    method: 'SPLIT',
    label: 'Half and half (Split 50/50)',
    whoMoves: 'Booked vehicle',
    whoPays: '50% Donor / 50% Receiver',
    description: 'Fair split where donor and receiver each contribute 50% of delivery cost.',
    isFree: false,
    donorSharePct: 50,
    receiverSharePct: 50
  }
};

// Pricing constants for booked delivery estimation
export const BASE_DELIVERY_FARE = 50; // INR base fare
export const PER_KM_RATE = 14; // INR per kilometer

// Verified Gaushala & Animal Welfare Centers for Zero-Waste Emergency Fallback
export const PRESET_GAUSHALAS: GaushalaCenter[] = [
  {
    id: 'gau-1',
    name: 'Sri Krishna Gaushala & Cattle Sanctuary',
    type: 'Gaushala & Cattle Care',
    areaId: 'indiranagar',
    phone: '9845012345',
    address: 'Survey 14, Old Madras Road, near Indiranagar',
    animalTypes: 'Cows, Calves & Oxen (Vegetarian Rice, Rotis & Khichdi)'
  },
  {
    id: 'gau-2',
    name: 'Karuna Animal Rescue & Shelter Home',
    type: 'Animal Rescue & Shelter',
    areaId: 'koramangala',
    phone: '9845054321',
    address: 'Near Dairy Circle, 80ft Road, Koramangala',
    animalTypes: 'Stray Dogs, Rescued Puppies, Equines & Cattle'
  },
  {
    id: 'gau-3',
    name: 'Compassion Animal Welfare Trust',
    type: 'Community Stray Feeding Hub',
    areaId: 'hsr',
    phone: '9845098765',
    address: 'Sector 2, HSR Layout, Bengaluru',
    animalTypes: 'Community Dogs, Birds & Recovering Animals'
  },
  {
    id: 'gau-4',
    name: 'Govardhan Cattle Shelter & Green Farm',
    type: 'Gaushala & Cattle Care',
    areaId: 'whitefield',
    phone: '9845067890',
    address: 'ECC Road, Whitefield Hub',
    animalTypes: 'Indigenous Desi Cows & Aged Cattle'
  },
  {
    id: 'gau-5',
    name: 'People For Animals (PFA) Shelter',
    type: 'Animal Rescue & Shelter',
    areaId: 'jayanagar',
    phone: '9845011223',
    address: '9th Block, Jayanagar Outer Ring Road',
    animalTypes: 'Shelter Dogs, Cattle & Wild Rescues'
  }
];

export const ANIMAL_FEEDING_QUOTES = [
  {
    quote: "The greatness of a nation and its moral progress can be judged by the way its animals are treated.",
    author: "Mahatma Gandhi"
  },
  {
    quote: "Serving and feeding innocent animals is the purest form of compassion. No food is wasted when it nourishes a living soul.",
    author: "Gau Seva Tradition"
  },
  {
    quote: "He who feeds a hungry animal feeds his own soul. Zero waste, infinite kindness.",
    author: "Ancient Wisdom"
  },
  {
    quote: "Until one has loved an animal, a part of one's soul remains unawakened.",
    author: "Anatole France"
  }
];

