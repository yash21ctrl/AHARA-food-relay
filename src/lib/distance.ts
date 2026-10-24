import { BASE_DELIVERY_FARE, PER_KM_RATE, PRESET_AREAS } from '../config';
import { DeliveryMethod } from '../types';

/**
 * Calculates great-circle distance between two coordinates using the Haversine formula
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

export function getAreaDistance(areaId1: string, areaId2: string): number {
  if (areaId1 === areaId2) return 1.2; // minimum distance within same neighborhood
  const area1 = PRESET_AREAS.find((a) => a.id === areaId1);
  const area2 = PRESET_AREAS.find((a) => a.id === areaId2);
  if (!area1 || !area2) return 3.5; // fallback average distance
  return haversineDistance(area1.lat, area1.lng, area2.lat, area2.lng);
}

export function estimateCost(km: number): number {
  // Base fare + km rate rounded to nearest 10 INR
  const rawCost = BASE_DELIVERY_FARE + km * PER_KM_RATE;
  return Math.round(rawCost / 5) * 5;
}

export function calculateShares(
  method: DeliveryMethod,
  estCost: number
): { donor: number; receiver: number } {
  switch (method) {
    case 'SELF_PICKUP':
    case 'DONOR_DROP':
      return { donor: 0, receiver: 0 };
    case 'DONOR_PAYS':
      return { donor: estCost, receiver: 0 };
    case 'RECEIVER_PAYS':
      return { donor: 0, receiver: estCost };
    case 'SPLIT': {
      const half = Math.round(estCost / 2);
      return { donor: half, receiver: estCost - half };
    }
  }
}
