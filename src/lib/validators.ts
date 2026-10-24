export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }
  return { valid: true };
}

export function validatePlate(plate: string): { valid: boolean; error?: string } {
  const trimmed = plate.trim();
  if (trimmed.length < 4) {
    return { valid: false, error: 'Vehicle number plate is required (min 4 characters)' };
  }
  return { valid: true };
}

export function validateQuantity(
  qty: number,
  maxAvailable?: number
): { valid: boolean; error?: string } {
  if (!Number.isInteger(qty) || qty <= 0) {
    return { valid: false, error: 'Quantity must be a whole positive number of plates' };
  }
  if (maxAvailable !== undefined && qty > maxAvailable) {
    return {
      valid: false,
      error: `Requested ${qty} plates exceeds remaining ${maxAvailable} plates`
    };
  }
  return { valid: true };
}

export function validateSafeHours(hours: number): { valid: boolean; error?: string } {
  if (isNaN(hours) || hours <= 0 || hours > 48) {
    return { valid: false, error: 'Safe hours must be between 0.5 and 48 hours' };
  }
  return { valid: true };
}

export function validateReason(reason: string): { valid: boolean; error?: string } {
  if (!reason || reason.trim().length < 3) {
    return { valid: false, error: 'A cancellation reason is required (min 3 characters)' };
  }
  return { valid: true };
}

export function validateCustomFare(fare: number): { valid: boolean; error?: string } {
  if (typeof fare !== 'number' || isNaN(fare) || !Number.isFinite(fare) || fare < 0) {
    return { valid: false, error: 'Delivery fare must be a non-negative number' };
  }
  if (fare > 100000) {
    return { valid: false, error: 'Delivery fare exceeds maximum limit (₹1,00,000)' };
  }
  return { valid: true };
}
