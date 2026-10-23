/**
 * PriceProof Currency and Number Localization Formatters
 * Formats monetary amounts in Indian Rupees (INR / ₹) with standard Indian numbering (lakhs & crores).
 */

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  // Format with standard Indian grouping (e.g. ₹1,29,990 or ₹499.50)
  const isWhole = Math.abs(amount % 1) < 0.001;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumberINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  const isWhole = Math.abs(amount % 1) < 0.001;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
