/**
 * PriceProof Domain Model & Types
 * Defines the normalized schema for products, offers, fee breakdowns, and providers.
 */

export type CompletenessStatus = 'COMPLETE' | 'PARTIAL_ESTIMATE' | 'UNVERIFIED_CHARGES';

export type TransparencyGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface FeeItem {
  name: string;
  amount: number;
  isMandatory: boolean;
  description?: string;
  isUnknown?: boolean;
}

export interface DiscountItem {
  name: string;
  amount: number;
  isConditional: boolean;
  conditionDescription?: string;
  applied: boolean;
}

export interface ReturnPolicy {
  windowDays: number;
  isFreeReturn: boolean;
  shippingCharge: number; // 0 if free, > 0 if customer pays, -1 if unknown
  restockingFeePercentage?: number;
  condition: string;
  details: string;
}

export interface WarrantyPolicy {
  durationMonths: number;
  provider: 'MANUFACTURER' | 'SELLER' | 'NONE' | 'EXTENDED_PAID';
  coverage: string;
  claimsProcess?: string;
}

export interface SellerInfo {
  name: string;
  sellerRating?: number; // 1 to 5
  totalReviews?: number;
  isDirectPlatform: boolean; // e.g. sold by Amazon/Flipkart direct vs 3rd party
  country?: string;
}

export interface Offer {
  id: string;
  productId: string;
  title: string;
  brand?: string;
  category?: string;
  imageUrl: string;
  productUrl: string;
  seller: SellerInfo;
  
  // Base Sticker Price
  basePrice: number;
  currency: string;
  originalStickerPrice?: number; // M.R.P. or crossed-out price

  // Delivery Details
  delivery: {
    fee: number;
    isFree: boolean;
    isUnknown: boolean;
    freeThreshold?: number;
    estimatedDays?: number;
    notes?: string;
  };

  // Fees Breakdown
  mandatoryFees: FeeItem[];

  // Discounts
  discounts: DiscountItem[];

  // Membership & Requirements
  membershipRequired?: {
    name: string;
    annualCost?: number;
    isOptional?: boolean;
    savingsWithMembership: number;
  };

  // Policies
  returnPolicy: ReturnPolicy;
  warranty: WarrantyPolicy;

  // Computed Cost Insights
  totalCostCalculation: {
    knownTotal: number;
    stickerDelta: number; // positive means real cost is higher than sticker price!
    completeness: CompletenessStatus;
    transparencyGrade: TransparencyGrade;
    warnings: string[];
    calculationNotes: string[];
    isCheapestComparable?: boolean;
    isDeceptiveSticker?: boolean; // True if sticker looks cheapest but real total is higher
  };

  // Metadata
  dataSource: {
    providerId: string;
    providerName: string;
    isLive: boolean;
    retrievedAt: string; // ISO string
    attribution: string;
    disclaimer?: string;
  };
}

export interface ProductGroup {
  id: string;
  canonicalTitle: string;
  category: string;
  brand?: string;
  thumbnailUrl: string;
  cheapestOfferId: string;
  lowestTotalCost: number;
  highestStickerSavingsOfferId?: string;
  offers: Offer[];
  warnings: string[];
}

export interface SearchQueryFilters {
  maxPrice?: number;
  freeDeliveryOnly?: boolean;
  freeReturnsOnly?: boolean;
  minWarrantyMonths?: number;
  condition?: 'ALL' | 'NEW' | 'REFURBISHED';
  sellerType?: 'ALL' | 'DIRECT' | 'THIRD_PARTY';
  providers?: string[]; // IDs
}

export type SortOption =
  | 'TOTAL_COST_ASC'
  | 'STICKER_PRICE_ASC'
  | 'TRANSPARENCY_DESC'
  | 'DELIVERY_FASTEST'
  | 'WARRANTY_LONGEST';

export interface SearchResultResponse {
  query: string;
  totalProducts: number;
  totalOffers: number;
  products: ProductGroup[];
  providersSummary: {
    id: string;
    name: string;
    isLive: boolean;
    status: 'ACTIVE' | 'DEMO' | 'REQUIRES_AUTH' | 'RATE_LIMITED' | 'ERROR';
    offersCount: number;
    latencyMs: number;
    message?: string;
  }[];
  searchedAt: string;
}

export interface ProviderDiagnostic {
  id: string;
  name: string;
  type: 'LIVE' | 'DEMO' | 'PARTNER_API';
  status: 'ACTIVE' | 'DEMO' | 'REQUIRES_AUTH' | 'RATE_LIMITED' | 'ERROR';
  isConfigured: boolean;
  requiredEnvVars: string[];
  docsUrl: string;
  authMethod: string;
  description: string;
  supportedRegions: string[];
}
