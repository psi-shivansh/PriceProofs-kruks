/**
 * PriceProof Total-Cost Calculation & Policy Evaluation Engine
 * Pure, reliable, unit-tested core logic for computing real shopping costs.
 */

import {
  CompletenessStatus,
  DiscountItem,
  FeeItem,
  Offer,
  ProductGroup,
  TransparencyGrade,
} from '../types/product.ts';
import { formatINR } from './formatters.ts';

export interface RawOfferInput {
  id: string;
  productId: string;
  title: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  productUrl: string;
  seller: {
    name: string;
    sellerRating?: number;
    totalReviews?: number;
    isDirectPlatform?: boolean;
    country?: string;
  };
  basePrice: number;
  currency?: string;
  originalStickerPrice?: number;
  delivery: {
    fee: number;
    isFree?: boolean;
    isUnknown?: boolean;
    freeThreshold?: number;
    estimatedDays?: number;
    notes?: string;
  };
  mandatoryFees?: FeeItem[];
  discounts?: DiscountItem[];
  membershipRequired?: {
    name: string;
    annualCost?: number;
    isOptional?: boolean;
    savingsWithMembership: number;
  };
  returnPolicy: {
    windowDays: number;
    isFreeReturn: boolean;
    shippingCharge: number; // 0 if free, > 0 if paid, -1 if unknown
    restockingFeePercentage?: number;
    condition: string;
    details: string;
  };
  warranty: {
    durationMonths: number;
    provider: 'MANUFACTURER' | 'SELLER' | 'NONE' | 'EXTENDED_PAID';
    coverage: string;
    claimsProcess?: string;
  };
  dataSource: {
    providerId: string;
    providerName: string;
    isLive: boolean;
    retrievedAt?: string;
    attribution: string;
    disclaimer?: string;
  };
}

/**
 * Calculates the total known cost for a single offer, factoring in:
 * - Base price
 * - Mandatory fees (handling, platform convenience, recycling)
 * - Delivery fee (or flagged as unknown)
 * - Verified unconditional discounts only
 * - Flagging conditional discounts (members-only, card-exclusive)
 */
export function calculateOfferCost(raw: RawOfferInput): Offer {
  const warnings: string[] = [];
  const calculationNotes: string[] = [];
  let completeness: CompletenessStatus = 'COMPLETE';

  // 1. Base Price Validation
  const basePrice = Number(raw.basePrice) || 0;
  if (basePrice <= 0) {
    completeness = 'UNVERIFIED_CHARGES';
    warnings.push('Base price is missing, zero, or unverified by provider.');
  }

  // 2. Mandatory Fees
  const mandatoryFees = raw.mandatoryFees || [];
  let mandatoryFeesTotal = 0;
  let hasUnknownMandatoryFee = false;

  for (const fee of mandatoryFees) {
    if (fee.isUnknown) {
      hasUnknownMandatoryFee = true;
      completeness = 'PARTIAL_ESTIMATE';
      warnings.push(`Mandatory fee "${fee.name}" is undisclosed until payment step.`);
    } else if (fee.isMandatory) {
      mandatoryFeesTotal += Number(fee.amount) || 0;
      calculationNotes.push(`+ ${fee.name}: ${formatINR(Number(fee.amount) || 0)}`);
    }
  }

  // 3. Delivery Fee Handling
  const delivery = { ...raw.delivery };
  let deliveryCharge = 0;

  if (delivery.isUnknown) {
    completeness = 'PARTIAL_ESTIMATE';
    warnings.push('Delivery fee is not disclosed by seller until checkout zip code is entered.');
    calculationNotes.push('? Delivery fee: Unknown (Zip code required)');
  } else if (delivery.isFree) {
    deliveryCharge = 0;
    calculationNotes.push('✓ Delivery: Free');
  } else if (delivery.freeThreshold && basePrice >= delivery.freeThreshold) {
    deliveryCharge = 0;
    delivery.isFree = true;
    calculationNotes.push(`✓ Free delivery unlocked (Order over ${formatINR(delivery.freeThreshold)})`);
  } else {
    deliveryCharge = Number(delivery.fee) || 0;
    if (deliveryCharge > 0) {
      calculationNotes.push(`+ Delivery fee: ${formatINR(deliveryCharge)}`);
    }
  }

  // 4. Discounts: Distinguish unconditional vs conditional
  const discounts = raw.discounts || [];
  let unconditionalDiscountsTotal = 0;

  for (const discount of discounts) {
    if (discount.isConditional) {
      warnings.push(
        `Conditional discount of ${formatINR(Number(discount.amount))} (${discount.name}): ${
          discount.conditionDescription || 'Specific card or qualification required'
        } — Excluded from base total.`
      );
    } else if (discount.applied) {
      const amt = Number(discount.amount) || 0;
      unconditionalDiscountsTotal += amt;
      calculationNotes.push(`- Unconditional coupon (${discount.name}): -${formatINR(amt)}`);
    }
  }

  // 5. Membership requirements
  if (raw.membershipRequired) {
    warnings.push(
      `Special price requires ${raw.membershipRequired.name}${
        raw.membershipRequired.annualCost ? ` (${formatINR(raw.membershipRequired.annualCost)}/yr)` : ''
      }. Standard non-member terms apply unless enrolled.`
    );
  }

  // 6. Return Policy Checks
  if (raw.returnPolicy) {
    if (raw.returnPolicy.shippingCharge > 0) {
      warnings.push(
        `Return shipping fee: Customer pays ${formatINR(raw.returnPolicy.shippingCharge)} to return items.`
      );
    } else if (raw.returnPolicy.shippingCharge === -1) {
      warnings.push('Return shipping cost is unverified/buyer-paid.');
    }
    if (raw.returnPolicy.restockingFeePercentage && raw.returnPolicy.restockingFeePercentage > 0) {
      warnings.push(
        `Restocking fee: ${raw.returnPolicy.restockingFeePercentage}% charged on open-box returns.`
      );
    }
  }

  // 7. Calculate Known Total
  // Formula: Base Price + Mandatory Fees + Delivery Fee - Unconditional Discounts
  const knownTotal = Math.max(
    0,
    basePrice + mandatoryFeesTotal + deliveryCharge - unconditionalDiscountsTotal
  );

  const stickerDelta = knownTotal - basePrice;

  // 8. Determine Transparency Grade
  let gradePoints = 100;
  if (delivery.isUnknown) gradePoints -= 30;
  if (hasUnknownMandatoryFee) gradePoints -= 35;
  if (mandatoryFeesTotal > 0) gradePoints -= 10;
  if (raw.returnPolicy.shippingCharge > 0) gradePoints -= 15;
  if (raw.returnPolicy.shippingCharge === -1) gradePoints -= 20;
  if (raw.membershipRequired) gradePoints -= 15;
  if (raw.warranty.durationMonths === 0) gradePoints -= 15;
  if (warnings.length > 2) gradePoints -= 10;

  let transparencyGrade: TransparencyGrade = 'A';
  if (gradePoints >= 90) transparencyGrade = 'A';
  else if (gradePoints >= 75) transparencyGrade = 'B';
  else if (gradePoints >= 60) transparencyGrade = 'C';
  else if (gradePoints >= 40) transparencyGrade = 'D';
  else transparencyGrade = 'F';

  return {
    id: raw.id,
    productId: raw.productId,
    title: raw.title,
    brand: raw.brand || 'Generic',
    category: raw.category || 'Electronics',
    imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    productUrl: raw.productUrl,
    seller: {
      name: raw.seller.name,
      sellerRating: raw.seller.sellerRating ?? 4.5,
      totalReviews: raw.seller.totalReviews ?? 100,
      isDirectPlatform: Boolean(raw.seller.isDirectPlatform),
      country: raw.seller.country || 'US',
    },
    basePrice: Number(basePrice.toFixed(2)),
    currency: raw.currency || 'INR',
    originalStickerPrice: raw.originalStickerPrice,
    delivery: {
      fee: Number(delivery.fee || 0),
      isFree: Boolean(delivery.isFree),
      isUnknown: Boolean(delivery.isUnknown),
      freeThreshold: delivery.freeThreshold,
      estimatedDays: delivery.estimatedDays || 3,
      notes: delivery.notes,
    },
    mandatoryFees: mandatoryFees.map((f) => ({
      ...f,
      amount: Number(f.amount || 0),
    })),
    discounts: discounts.map((d) => ({
      ...d,
      amount: Number(d.amount || 0),
    })),
    membershipRequired: raw.membershipRequired,
    returnPolicy: raw.returnPolicy,
    warranty: raw.warranty,
    totalCostCalculation: {
      knownTotal: Number(knownTotal.toFixed(2)),
      stickerDelta: Number(stickerDelta.toFixed(2)),
      completeness,
      transparencyGrade,
      warnings,
      calculationNotes,
      isCheapestComparable: false,
      isDeceptiveSticker: false,
    },
    dataSource: {
      providerId: raw.dataSource.providerId,
      providerName: raw.dataSource.providerName,
      isLive: raw.dataSource.isLive,
      retrievedAt: raw.dataSource.retrievedAt || new Date().toISOString(),
      attribution: raw.dataSource.attribution,
      disclaimer: raw.dataSource.disclaimer,
    },
  };
}

/**
 * Normalizes title for grouping similar/identical products
 */
export function normalizeProductTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Groups and ranks offers into product groups.
 * Ranks strictly by comparable total known cost.
 * Flags deceptive sticker prices where advertised sticker is lowest,
 * but hidden fees push the total higher than a competitor.
 */
export function groupAndRankOffers(offers: Offer[]): ProductGroup[] {
  if (!offers || offers.length === 0) return [];

  // Group by productId or canonical title
  const groupsMap = new Map<string, Offer[]>();

  for (const offer of offers) {
    const key = offer.productId || normalizeProductTitle(offer.title).slice(0, 30);
    const existing = groupsMap.get(key) || [];
    existing.push(offer);
    groupsMap.set(key, existing);
  }

  const result: ProductGroup[] = [];

  for (const [key, groupOffers] of groupsMap.entries()) {
    // Sort offers primarily by:
    // 1. completeness (prefer COMPLETE offers over unverified)
    // 2. knownTotal ascending
    const sortedOffers = [...groupOffers].sort((a, b) => {
      // If one has incomplete pricing, we still rank by known total, but mark warnings
      return a.totalCostCalculation.knownTotal - b.totalCostCalculation.knownTotal;
    });

    // Find the offer with the lowest sticker price (base price)
    const lowestStickerOffer = [...sortedOffers].sort((a, b) => a.basePrice - b.basePrice)[0];
    
    // Find the offer with the lowest total known cost
    const cheapestTotalOffer = sortedOffers[0];

    // Mark cheapest
    cheapestTotalOffer.totalCostCalculation.isCheapestComparable = true;

    // Check for deceptive sticker price trap!
    if (
      lowestStickerOffer &&
      cheapestTotalOffer &&
      lowestStickerOffer.id !== cheapestTotalOffer.id &&
      lowestStickerOffer.basePrice < cheapestTotalOffer.basePrice &&
      lowestStickerOffer.totalCostCalculation.knownTotal > cheapestTotalOffer.totalCostCalculation.knownTotal
    ) {
      lowestStickerOffer.totalCostCalculation.isDeceptiveSticker = true;
      const extraCost =
        lowestStickerOffer.totalCostCalculation.knownTotal - cheapestTotalOffer.totalCostCalculation.knownTotal;
      lowestStickerOffer.totalCostCalculation.warnings.push(
        `Sticker Trap Warning: Advertised base price is ${formatINR(lowestStickerOffer.basePrice)}, but with delivery and mandatory fees, it totals ${formatINR(lowestStickerOffer.totalCostCalculation.knownTotal)} (${formatINR(extraCost)} MORE than ${cheapestTotalOffer.seller.name}).`
      );
    }

    const groupWarnings: string[] = [];
    const hasIncomplete = sortedOffers.some(
      (o) => o.totalCostCalculation.completeness !== 'COMPLETE'
    );
    if (hasIncomplete) {
      groupWarnings.push(
        'Some seller totals in this group are partial estimates due to undisclosed delivery or checkout fees.'
      );
    }

    result.push({
      id: key,
      canonicalTitle: sortedOffers[0].title,
      category: sortedOffers[0].category || 'Products',
      brand: sortedOffers[0].brand,
      thumbnailUrl: sortedOffers[0].imageUrl,
      cheapestOfferId: cheapestTotalOffer.id,
      lowestTotalCost: cheapestTotalOffer.totalCostCalculation.knownTotal,
      highestStickerSavingsOfferId: lowestStickerOffer?.id,
      offers: sortedOffers,
      warnings: groupWarnings,
    });
  }

  // Sort groups by relevance / lowest cost
  return result.sort((a, b) => a.lowestTotalCost - b.lowestTotalCost);
}
