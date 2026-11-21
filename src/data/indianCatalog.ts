/**
 * PriceProof Indian Store Comparison Catalog & Live Cost Recalculation Engine
 * All figures are in INR (₹) reflecting Indian retail fee structures, bank offers,
 * pincode delivery zones, and real-world return/replacement policy distinctions.
 */

import heroDeskImg from '../assets/images/hero_editorial_desk_1795280835210.jpg';
import heroAudioImg from '../assets/images/hero_editorial_audio_1795280833230.jpg';
import iphoneImg from '../assets/images/product_iphone_studio_1795280850269.jpg';
import macbookImg from '../assets/images/product_macbook_studio_1795280833952.jpg';
import headphonesImg from '../assets/images/product_headphones_studio_1795280834482.jpg';
import watchImg from '../assets/images/product_watch_studio_1795280849907.jpg';
import applianceImg from '../assets/images/product_appliance_studio_1795280833887.jpg';
import cameraImg from '../assets/images/product_camera_studio_1795280833151.jpg';
import sneakersImg from '../assets/images/product_sneakers_studio_1795284534944.jpg';
import skincareImg from '../assets/images/product_skincare_studio_1795284540823.jpg';
import mattressImg from '../assets/images/product_mattress_studio_1795284545069.jpg';
import fitnessImg from '../assets/images/product_fitness_studio_1795284535016.jpg';

export type PaymentBank = 'NONE' | 'HDFC' | 'ICICI' | 'SBI' | 'AXIS' | 'UPI';
export type PaymentMode = 'FULL' | 'EMI';
export type SortKey = 'FINAL_PRICE' | 'FASTEST_DELIVERY' | 'BEST_RETURN' | 'FEWEST_HIDDEN_FEES';

export interface UserPricePreferences {
  pincode: string;
  bankCard: PaymentBank;
  includeCodFee: boolean;
  applyAllCoupons: boolean;
  paymentMode: PaymentMode;
}

export interface StoreFeeLine {
  id: string;
  label: string;
  category: 'delivery' | 'handling' | 'packaging' | 'cod' | 'platform' | 'installation' | 'tax';
  amount: number;
  isHidden: boolean;
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
  conditionalOnCod?: boolean;
  remotePincodeSurcharge?: number;
}

export interface StoreCoupon {
  code: string;
  label: string;
  amount: number;
  autoApplied: boolean;
}

export interface StoreBankOffer {
  bank: Exclude<PaymentBank, 'NONE'>;
  label: string;
  amount: number;
  emiExtraDiscount?: number;
  emiProcessingFee?: number;
}

export type PolicySignal = 'good' | 'warn' | 'bad' | 'not_found';

export interface StoreReturnPolicy {
  policyFound: boolean;
  windowLabel: string;
  windowDays: number;
  windowSignal: PolicySignal;
  returnShippingLabel: string;
  returnShippingSignal: PolicySignal;
  refundMethod: string;
  refundMethodSignal: PolicySignal;
  refundSpeed: string;
  refundSpeedSignal: PolicySignal;
  restockingFeeLabel: string;
  restockingFeePercent: number;
  restockingSignal: PolicySignal;
  exchangeAllowed: string;
  exchangeSignal: PolicySignal;
  conditions: string;
  plainEnglishSummary: string;
  policyScore: number; // 0-100
  sourceUrl: string;
  timeline: Array<{
    step: string;
    duration: string;
    detail: string;
  }>;
}

export interface StoreListing {
  storeId: string;
  storeName: string;
  shortCode: string;
  storeDomain: string;
  storeAccentBg: string;
  storeAccentText: string;
  productUrl: string;
  inStock: boolean;
  stockNote?: string;
  listedPrice: number;
  mrp: number;
  coupons: StoreCoupon[];
  bankOffers: StoreBankOffer[];
  fees: StoreFeeLine[];
  baseDeliveryDays: number;
  deliveryNote: string;
  verifiedAgo: string;
  verifiedTimestamp: string;
  trustScore: number; // 0-100 (fee clarity + policy fairness)
  returnPolicy: StoreReturnPolicy;
}

export interface PriceHistoryPoint {
  date: string;
  lowestTruePrice: number;
  avgListedPrice: number;
  store: string;
}

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  subCategory: string;
  images: string[];
  updatedAgo: string;
  storesChecked: number;
  feesChecked: number;
  spotlightRank?: number;
  verdictQuote: string;
  verdictSummary: string;
  askQuestions: string[];
  listings: StoreListing[];
  priceHistory: PriceHistoryPoint[];
  specs: ProductSpecRow[];
  inTheBox: string[];
  warrantyNote: string;
}

export interface ComputedStoreOffer {
  listing: StoreListing;
  listedPrice: number;
  couponSavings: number;
  appliedCoupons: StoreCoupon[];
  bankSavings: number;
  appliedBankOffer: StoreBankOffer | null;
  emiProcessingFee: number;
  totalOffersSavings: number;
  deliveryFee: number;
  handlingFee: number;
  packagingFee: number;
  codFee: number;
  platformFee: number;
  installationFee: number;
  taxAdjustment: number;
  totalFees: number;
  hiddenFeesCount: number;
  hiddenFeesTotal: number;
  finalPayablePrice: number;
  deltaVsListed: number;
  estimatedDeliveryDays: number;
  estimatedDeliveryLabel: string;
  monthlyEmi6m: number;
  activeFeeLines: Array<StoreFeeLine & { effectiveAmount: number }>;
  isBestPrice: boolean;
}

export const STUDIO_IMAGES = {
  heroDesk: heroDeskImg,
  heroAudio: heroAudioImg,
  iphone: iphoneImg,
  macbook: macbookImg,
  headphones: headphonesImg,
  watch: watchImg,
  appliance: applianceImg,
  camera: cameraImg,
  sneakers: sneakersImg,
  skincare: skincareImg,
  mattress: mattressImg,
  fitness: fitnessImg,
} as const;

export const SEARCH_PLACEHOLDERS = [
  'Total cost of Nike Air Force 1 across Myntra, Ajio & Nike?',
  'Wakefit 100-night mattress trial vs Amazon return rules?',
  'Hidden fees on ON Whey Protein (HealthKart vs Flipkart)?',
  'Total cost of iPhone 16 Pro across all Indian stores?',
];

export interface CategoryTile {
  id: string;
  name: string;
  count: number;
  image: string;
  avgHiddenFee: string;
}

export const CATEGORY_TILES: CategoryTile[] = [
  { id: 'footwear', name: 'Sneakers & Footwear', count: 31, image: STUDIO_IMAGES.sneakers, avgHiddenFee: '₹495 avg fees' },
  { id: 'furniture', name: 'Home & Mattresses', count: 19, image: STUDIO_IMAGES.mattress, avgHiddenFee: '₹1,690 avg fees' },
  { id: 'beauty', name: 'Beauty & Skincare', count: 29, image: STUDIO_IMAGES.skincare, avgHiddenFee: '₹189 avg fees' },
  { id: 'fitness', name: 'Fitness & Nutrition', count: 26, image: STUDIO_IMAGES.fitness, avgHiddenFee: '₹340 avg fees' },
  { id: 'laptops', name: 'Laptops', count: 27, image: STUDIO_IMAGES.macbook, avgHiddenFee: '₹1,490 avg fees' },
  { id: 'smartphones', name: 'Smartphones', count: 34, image: STUDIO_IMAGES.iphone, avgHiddenFee: '₹798 avg fees' },
  { id: 'audio', name: 'Headphones & Audio', count: 22, image: STUDIO_IMAGES.headphones, avgHiddenFee: '₹640 avg fees' },
  { id: 'wearables', name: 'Wearables', count: 18, image: STUDIO_IMAGES.watch, avgHiddenFee: '₹490 avg fees' },
  { id: 'cameras', name: 'Cameras & Optics', count: 15, image: STUDIO_IMAGES.camera, avgHiddenFee: '₹1,850 avg fees' },
  { id: 'appliances', name: 'Home & Espresso', count: 24, image: STUDIO_IMAGES.appliance, avgHiddenFee: '₹2,150 avg fees' },
];

export interface MegaMenuCategory {
  id: string;
  label: string;
  groups: Array<{
    heading: string;
    totalCount: number;
    items: Array<{ label: string; categoryId: string; productId?: string }>;
  }>;
}

export const MEGA_MENU_CATEGORIES: MegaMenuCategory[] = [
  {
    id: 'electronics',
    label: 'Electronics & Computing',
    groups: [
      {
        heading: 'COMPUTING',
        totalCount: 27,
        items: [
          { label: 'Pro Laptops & Workstations', categoryId: 'laptops', productId: 'macbook-pro-16-m4' },
          { label: 'Ultrabooks & Thin-and-Light', categoryId: 'laptops' },
          { label: 'Gaming Laptops', categoryId: 'laptops' },
          { label: 'Monitors & Displays', categoryId: 'laptops' },
        ],
      },
      {
        heading: 'MOBILE & AUDIO',
        totalCount: 34,
        items: [
          { label: 'Flagship Smartphones', categoryId: 'smartphones', productId: 'iphone-16-pro-256' },
          { label: 'ANC Headphones', categoryId: 'audio', productId: 'sony-wh1000xm5' },
          { label: 'True Wireless Earbuds', categoryId: 'audio' },
          { label: 'DACs & Studio Audio', categoryId: 'audio' },
        ],
      },
      {
        heading: 'IMAGING & WEARABLES',
        totalCount: 19,
        items: [
          { label: 'Mirrorless Cameras', categoryId: 'cameras', productId: 'fujifilm-xt5-kit' },
          { label: 'GPS & Titanium Watches', categoryId: 'wearables', productId: 'garmin-fenix-8' },
          { label: 'Prime Lenses', categoryId: 'cameras' },
          { label: 'Action Cameras', categoryId: 'cameras' },
        ],
      },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Fashion, Beauty & Wellness',
    groups: [
      {
        heading: 'FOOTWEAR & APPAREL',
        totalCount: 31,
        items: [
          { label: 'Classic White Sneakers', categoryId: 'footwear', productId: 'nike-air-force-1-white' },
          { label: 'Running & Training Shoes', categoryId: 'footwear' },
          { label: 'Everyday Leather Loafers', categoryId: 'footwear' },
        ],
      },
      {
        heading: 'BEAUTY & SKINCARE',
        totalCount: 29,
        items: [
          { label: 'Luxury Ayurvedic Skincare', categoryId: 'beauty', productId: 'forest-essentials-soundarya-cream' },
          { label: 'Dermatologist Sunscreens', categoryId: 'beauty' },
          { label: 'Serums & Night Creams', categoryId: 'beauty' },
        ],
      },
      {
        heading: 'FITNESS & NUTRITION',
        totalCount: 26,
        items: [
          { label: 'Whey Protein Isolates & Blends', categoryId: 'fitness', productId: 'on-gold-standard-whey-5lb' },
          { label: 'Creatine & Pre-Workout', categoryId: 'fitness' },
          { label: 'Home Gym & Yoga Gear', categoryId: 'fitness' },
        ],
      },
    ],
  },
  {
    id: 'home',
    label: 'Home, Furniture & Kitchen',
    groups: [
      {
        heading: 'SLEEP & FURNITURE',
        totalCount: 19,
        items: [
          { label: 'Orthopedic Mattresses', categoryId: 'furniture', productId: 'wakefit-orthopedic-mattress' },
          { label: 'Ergonomic Study Chairs', categoryId: 'furniture' },
          { label: 'Solid Wood Bed Frames', categoryId: 'furniture' },
        ],
      },
      {
        heading: 'COFFEE & ESPRESSO',
        totalCount: 16,
        items: [
          { label: 'Espresso Machines', categoryId: 'appliances', productId: 'breville-barista-express' },
          { label: 'Burr Coffee Grinders', categoryId: 'appliances' },
          { label: 'Precision Kettles', categoryId: 'appliances' },
        ],
      },
      {
        heading: 'AIR & LARGE APPLIANCES',
        totalCount: 24,
        items: [
          { label: 'HEPA Air Purifiers', categoryId: 'appliances' },
          { label: 'Inverter Split ACs', categoryId: 'appliances' },
          { label: 'Washer-Dryer Combos', categoryId: 'appliances' },
        ],
      },
    ],
  },
  {
    id: 'stores',
    label: 'Indian Store Audits',
    groups: [
      {
        heading: 'MARKETPLACES',
        totalCount: 13,
        items: [
          { label: 'Amazon India Fee Audit', categoryId: 'all' },
          { label: 'Flipkart Packaging & Platform Fees', categoryId: 'all' },
          { label: 'Myntra & Ajio Convenience Fees', categoryId: 'footwear' },
          { label: 'Nykaa Beauty Return Rules', categoryId: 'beauty' },
        ],
      },
      {
        heading: 'SPECIALTY & OMNICHANNEL',
        totalCount: 10,
        items: [
          { label: 'HealthKart & Nutrition Audits', categoryId: 'fitness' },
          { label: 'Pepperfry & Wakefit Delivery Audits', categoryId: 'furniture' },
          { label: 'Croma & Reliance Digital Audits', categoryId: 'all' },
        ],
      },
      {
        heading: 'BRAND DIRECT',
        totalCount: 11,
        items: [
          { label: 'Apple India Direct (14-Day Return)', categoryId: 'laptops', productId: 'macbook-pro-16-m4' },
          { label: 'Wakefit Direct (100-Night Trial)', categoryId: 'furniture', productId: 'wakefit-orthopedic-mattress' },
          { label: 'Nike India Direct Shipping Trap', categoryId: 'footwear', productId: 'nike-air-force-1-white' },
        ],
      },
    ],
  },
];

export const INDIAN_STORES_DIRECTORY = [
  { id: 'flipkart', name: 'Flipkart', shortCode: 'FK', avgFeeDrag: '₹398', typicalReturn: '7d Service Center / Open-Box', trustAvg: 78 },
  { id: 'amazon', name: 'Amazon India', shortCode: 'AZ', avgFeeDrag: '₹199', typicalReturn: '7–10d Category Dependent', trustAvg: 83 },
  { id: 'myntra', name: 'Myntra', shortCode: 'MY', avgFeeDrag: '₹119', typicalReturn: '14d Easy Doorstep Refund', trustAvg: 86 },
  { id: 'ajio', name: 'Ajio', shortCode: 'AJ', avgFeeDrag: '₹148', typicalReturn: '10d Refund (Fee on Low Cart)', trustAvg: 79 },
  { id: 'nykaa', name: 'Nykaa', shortCode: 'NY', avgFeeDrag: '₹99', typicalReturn: 'Non-Returnable if Opened', trustAvg: 82 },
  { id: 'wakefit', name: 'Wakefit Direct', shortCode: 'WF', avgFeeDrag: '₹0', typicalReturn: '100-Night Free Home Trial', trustAvg: 95 },
  { id: 'pepperfry', name: 'Pepperfry', shortCode: 'PF', avgFeeDrag: '₹999', typicalReturn: '7d Damaged-Only Return', trustAvg: 72 },
  { id: 'healthkart', name: 'HealthKart', shortCode: 'HK', avgFeeDrag: '₹79', typicalReturn: '14d Unopened Seal Only', trustAvg: 84 },
  { id: 'nike', name: 'Nike India Direct', shortCode: 'NK', avgFeeDrag: '₹1,250', typicalReturn: '30d Free Return (Ship Fee Lost)', trustAvg: 80 },
  { id: 'apple', name: 'Apple India Store', shortCode: 'AP', avgFeeDrag: '₹0', typicalReturn: '14d No-Questions Refund', trustAvg: 97 },
  { id: 'croma', name: 'Croma', shortCode: 'CR', avgFeeDrag: '₹249', typicalReturn: '7d Unopened / DOA Check', trustAvg: 85 },
  { id: 'reliance', name: 'Reliance Digital', shortCode: 'RD', avgFeeDrag: '₹349', typicalReturn: '7d DOA Replacement Only', trustAvg: 79 },
  { id: 'jiomart', name: 'JioMart', shortCode: 'JM', avgFeeDrag: '₹499', typicalReturn: '7d Replacement (Strict)', trustAvg: 71 },
  { id: 'vijaysales', name: 'Vijay Sales', shortCode: 'VS', avgFeeDrag: '₹199', typicalReturn: '7d Sealed Box Only', trustAvg: 81 },
  { id: 'tatacliq', name: 'Tata CLiQ', shortCode: 'TC', avgFeeDrag: '₹299', typicalReturn: '7–10d Brand Verification', trustAvg: 84 },
];

export interface HeroSlide {
  id: string;
  tag: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  image: string;
  productId: string;
  statLabel: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-macbook',
    tag: 'BIGGEST PRICE GAPS',
    headline: 'MacBook Pro 16" M4 Pro: ₹18,450 separates the real cheapest and costliest checkout.',
    subtitle: '13 INDIAN STORES · 41 FEES CHECKED · BANK OFFERS, PACKAGING & RETURN RULES VERIFIED',
    ctaLabel: 'SEE THE BREAKDOWN',
    image: STUDIO_IMAGES.heroDesk,
    productId: 'macbook-pro-16-m4',
    statLabel: '₹2,63,900 BEST TRUE PRICE',
  },
  {
    id: 'slide-audio',
    tag: 'HIDDEN FEE AUDIT',
    headline: 'Why the lowest sticker price on Sony WH-1000XM5 costs ₹2,648 more at checkout.',
    subtitle: 'SECURED PACKAGING · PLATFORM FEES · COD SURCHARGES · RESTOCKING DEDUCTIONS EXPOSED',
    ctaLabel: 'SEE THE BREAKDOWN',
    image: STUDIO_IMAGES.heroAudio,
    productId: 'sony-wh1000xm5',
    statLabel: '₹24,490 BEST TRUE PRICE',
  },
];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'macbook-pro-16-m4',
    slug: 'macbook-pro-16-m4-pro',
    name: 'Apple MacBook Pro 16" (M4 Pro, 24GB, 512GB SSD)',
    shortName: 'MacBook Pro 16" M4 Pro',
    brand: 'Apple',
    categoryId: 'laptops',
    categoryName: 'Laptops',
    subCategory: 'Pro Workstations',
    images: [STUDIO_IMAGES.macbook, STUDIO_IMAGES.heroDesk, STUDIO_IMAGES.iphone],
    updatedAgo: '2H AGO',
    storesChecked: 13,
    feesChecked: 41,
    spotlightRank: 1,
    verdictQuote:
      "Flipkart is ₹6,000 cheaper than Amazon after fees, but Apple's store has the only 14-day no-questions return.",
    verdictSummary:
      'Flipkart wins purely on net payable rupees when bank offers apply, even after its ₹199 Secured Packaging & ₹49 Protect Promise fee. If you want zero-friction returns after opening the box, Apple India Direct costs ₹8,000 more but refunds directly to your card in 5 days.',
    askQuestions: [
      'Is the COD fee or packaging fee refundable if I return it?',
      'Which store is safest if the laptop has a dead pixel?',
      'Should I pay extra for Apple India Store return policy?',
      'How much do I save with HDFC vs ICICI card here?',
    ],
    priceHistory: [
      { date: '22 Oct', lowestTruePrice: 274900, avgListedPrice: 279900, store: 'Croma' },
      { date: '28 Oct', lowestTruePrice: 271400, avgListedPrice: 277500, store: 'Amazon India' },
      { date: '03 Nov', lowestTruePrice: 268900, avgListedPrice: 274900, store: 'Flipkart' },
      { date: '09 Nov', lowestTruePrice: 269900, avgListedPrice: 274900, store: 'Amazon India' },
      { date: '15 Nov', lowestTruePrice: 265400, avgListedPrice: 272900, store: 'Flipkart' },
      { date: '21 Nov', lowestTruePrice: 263900, avgListedPrice: 272500, store: 'Flipkart' },
    ],
    specs: [
      { label: 'Chip', value: 'Apple M4 Pro (14-core CPU, 20-core GPU)' },
      { label: 'Memory & Storage', value: '24GB Unified Memory · 512GB NVMe SSD' },
      { label: 'Display', value: '16.2" Liquid Retina XDR (120Hz ProMotion)' },
      { label: 'India MRP (incl. GST)', value: '₹2,79,900 (18% GST included in invoice)' },
      { label: 'Official Warranty', value: '1-Year Apple India Limited Warranty' },
      { label: 'GST Input Invoice', value: 'Available on Amazon Business, Flipkart, Croma & Apple' },
    ],
    inTheBox: ['16-inch MacBook Pro', '140W USB-C Power Adapter', 'USB-C to MagSafe 3 Cable (2m)'],
    warrantyNote: 'All authorised Indian sellers include 1-year official Apple India warranty serviceable at Apple BKC, Saket, and authorised centres.',
    listings: [
      {
        storeId: 'flipkart',
        storeName: 'Flipkart',
        shortCode: 'FK',
        storeDomain: 'flipkart.com',
        storeAccentBg: '#1E3A8A',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.flipkart.com/search?q=macbook+pro+16+m4+pro',
        inStock: true,
        listedPrice: 269652,
        mrp: 279900,
        coupons: [{ code: 'LAPTOP2K', label: 'Flipkart Electronics Instant Coupon', amount: 2000, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Credit Card Instant Discount', amount: 4000, emiProcessingFee: 299 },
          { bank: 'ICICI', label: 'ICICI Credit Card Instant Discount', amount: 3500, emiProcessingFee: 299 },
          { bank: 'AXIS', label: 'Flipkart Axis Bank Cashback', amount: 4000, emiProcessingFee: 199 },
          { bank: 'SBI', label: 'SBI Credit Card Offer', amount: 3000, emiProcessingFee: 299 },
          { bank: 'UPI', label: 'SuperCoin + UPI Discount', amount: 500 },
        ],
        fees: [
          {
            id: 'fk-delivery',
            label: 'Standard Delivery',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Free insured courier shipping across metro pincodes.',
            sourceLabel: 'Flipkart Shipping Policy',
            sourceUrl: 'https://www.flipkart.com/pages/shipping',
            remotePincodeSurcharge: 349,
          },
          {
            id: 'fk-packaging',
            label: 'Secured Packaging Fee',
            category: 'packaging',
            amount: 199,
            isHidden: true,
            explanation: 'Mandatory tamper-evident box fee added only on the final checkout screen for laptops & phones.',
            sourceLabel: 'Flipkart Fee Schedule',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
          {
            id: 'fk-platform',
            label: 'Protect Promise / Platform Fee',
            category: 'platform',
            amount: 49,
            isHidden: true,
            explanation: 'Non-refundable checkout handling fee charged on open-box verified electronics.',
            sourceLabel: 'Flipkart Checkout Terms',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
          {
            id: 'fk-cod',
            label: 'Cash on Delivery Handling Fee',
            category: 'cod',
            amount: 149,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Cash-handling surcharge added when Pay on Delivery is chosen; non-refundable on return.',
            sourceLabel: 'Flipkart Payment Fees',
            sourceUrl: 'https://www.flipkart.com/pages/paymentsecurity',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Open-box delivery inspection mandatory at doorstep',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:10 AM IST',
        trustScore: 81,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free pickup (after DOA)',
          returnShippingSignal: 'good',
          refundMethod: 'Replacement Only (Service Center)',
          refundMethodSignal: 'bad',
          refundSpeed: '7–10 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0 (Platform fee non-refundable)',
          restockingFeePercent: 0,
          restockingSignal: 'warn',
          exchangeAllowed: 'DOA Certificate Required',
          exchangeSignal: 'warn',
          conditions: 'No cash refund for change of mind. Must inspect physically during Open-Box Delivery; post-delivery defects require Apple Service Center DOA letter.',
          plainEnglishSummary: 'Lowest price, but no change-of-mind returns — defects require an Apple service center certificate first.',
          policyScore: 62,
          sourceUrl: 'https://www.flipkart.com/pages/returnpolicy',
          timeline: [
            { step: 'Open-Box Check', duration: 'Day 0', detail: 'Inspect seal & screen in front of courier before sharing OTP.' },
            { step: 'Brand Service Visit', duration: 'Day 1–3', detail: 'Visit authorised Apple center for official DOA letter.' },
            { step: 'Pickup Scheduled', duration: 'Day 4–5', detail: 'Courier collects unit after DOA verification.' },
            { step: 'Replacement Dispatch', duration: 'Day 6–10', detail: 'Replacement unit shipped; cash refund only if out of stock.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#111827',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.amazon.in/s?k=macbook+pro+16+m4+pro',
        inStock: true,
        listedPrice: 274900,
        mrp: 279900,
        coupons: [{ code: 'SAVE1K', label: 'Amazon Pay Coupon', amount: 1000, autoApplied: false }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Instant Bank Discount', amount: 4000, emiProcessingFee: 199 },
          { bank: 'ICICI', label: 'Amazon Pay ICICI 5% Cap Offer', amount: 5000, emiProcessingFee: 199 },
          { bank: 'SBI', label: 'SBI Credit Card Instant Offer', amount: 3500, emiProcessingFee: 299 },
          { bank: 'AXIS', label: 'Axis Bank Instant Offer', amount: 2500, emiProcessingFee: 299 },
        ],
        fees: [
          {
            id: 'az-delivery',
            label: 'Prime / Insured Delivery',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Free scheduled insured delivery for high-value laptops.',
            sourceLabel: 'Amazon.in Shipping',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
            remotePincodeSurcharge: 249,
          },
          {
            id: 'az-platform',
            label: 'Marketplace Offer Processing Fee',
            category: 'platform',
            amount: 99,
            isHidden: true,
            explanation: 'Non-refundable processing charge applied on bank-discounted high-value orders.',
            sourceLabel: 'Amazon.in Fee Disclosure',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
          {
            id: 'az-cod',
            label: 'Pay on Delivery Convenience Fee',
            category: 'cod',
            amount: 99,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Applied only when Cash/Pay on Delivery is chosen.',
            sourceLabel: 'Amazon POD Terms',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 1,
        deliveryNote: 'Next-day OTP verified delivery in metro cities',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: 'Today, 08:05 AM IST',
        trustScore: 86,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free doorstep pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Brand Service Replacement',
          refundMethodSignal: 'warn',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Replacement for Defects',
          exchangeSignal: 'warn',
          conditions: '7-day Service Center Replacement policy for Apple laptops. Refund issued to original payment only if replacement is unavailable.',
          plainEnglishSummary: 'Fast next-day shipping and ₹0 restocking fee, but returns require defect verification via Apple Support.',
          policyScore: 74,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7',
          timeline: [
            { step: 'Report Issue', duration: 'Day 0–7', detail: 'Raise return inside Amazon Orders + Apple Support ticket.' },
            { step: 'Remote Diagnostics', duration: 'Day 1–2', detail: 'Apple Support verifies hardware defect remotely or in-store.' },
            { step: 'Courier Pickup', duration: 'Day 3', detail: 'Free doorstep pickup by Amazon Logistics.' },
            { step: 'Refund / Replacement', duration: 'Day 5–7', detail: 'Replacement dispatched or refund credited to original card.' },
          ],
        },
      },
      {
        storeId: 'apple',
        storeName: 'Apple India Store',
        shortCode: 'AP',
        storeDomain: 'apple.com/in',
        storeAccentBg: '#0E0E0E',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.apple.com/in/shop/buy-mac/macbook-pro',
        inStock: true,
        listedPrice: 279900,
        mrp: 279900,
        coupons: [],
        bankOffers: [
          { bank: 'HDFC', label: 'Apple India Instant Savings (Amex/Axis/ICICI/HDFC)', amount: 8000, emiProcessingFee: 0 },
          { bank: 'ICICI', label: 'Apple India Instant Savings', amount: 8000, emiProcessingFee: 0 },
          { bank: 'AXIS', label: 'Apple India Instant Savings', amount: 8000, emiProcessingFee: 0 },
        ],
        fees: [
          {
            id: 'ap-delivery',
            label: 'Free Direct Delivery',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Zero delivery, zero packaging, and zero platform fees nationwide.',
            sourceLabel: 'Apple India Shipping',
            sourceUrl: 'https://www.apple.com/in/shop/help/shipping_delivery',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: 'Direct BlueDart insured shipment + store pickup at Mumbai/Delhi',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:15 AM IST',
        trustScore: 97,
        returnPolicy: {
          policyFound: true,
          windowLabel: '14 Days',
          windowDays: 14,
          windowSignal: 'good',
          returnShippingLabel: 'Free BlueDart pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '3–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0 (Even if opened)',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes — Full Exchange or Refund',
          exchangeSignal: 'good',
          conditions: 'Full 14-calendar-day no-questions-asked return window from delivery date, even if opened and tested.',
          plainEnglishSummary: 'Gold-standard policy: open it, test it, and return it within 14 days for a 100% refund with zero hidden fees.',
          policyScore: 98,
          sourceUrl: 'https://www.apple.com/in/shop/help/returns_refund',
          timeline: [
            { step: '1-Click Return', duration: 'Day 0–14', detail: 'Initiate online — no defect certificate needed.' },
            { step: 'Free Pickup', duration: 'Day 1–2', detail: 'Insured courier collects directly from your address.' },
            { step: 'Warehouse Check', duration: 'Day 3', detail: 'Basic serial & accessory verification.' },
            { step: 'Card Refund', duration: 'Day 4–5', detail: 'Full rupee amount refunded to original card/UPI.' },
          ],
        },
      },
      {
        storeId: 'croma',
        storeName: 'Croma',
        shortCode: 'CR',
        storeDomain: 'croma.com',
        storeAccentBg: '#065F46',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.croma.com/searchB?q=macbook%20pro%2016',
        inStock: true,
        listedPrice: 274900,
        mrp: 279900,
        coupons: [{ code: 'CROMA1500', label: 'Tata Neu / Croma Web Voucher', amount: 1500, autoApplied: false }],
        bankOffers: [
          { bank: 'ICICI', label: 'ICICI Instant Bank Discount', amount: 5000, emiProcessingFee: 249 },
          { bank: 'SBI', label: 'SBI Instant Bank Discount', amount: 4000, emiProcessingFee: 249 },
          { bank: 'HDFC', label: 'Tata Neu HDFC Offer', amount: 3000, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'cr-delivery',
            label: 'Express Store Dispatch',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Free delivery from nearest Croma hub.',
            sourceLabel: 'Croma Delivery Terms',
            sourceUrl: 'https://www.croma.com/lp-terms-of-use',
            remotePincodeSurcharge: 299,
          },
          {
            id: 'cr-handling',
            label: 'ZipCare Inspection & Handling',
            category: 'handling',
            amount: 249,
            isHidden: true,
            explanation: 'Checkout handling charge added for express doorstep dispatch.',
            sourceLabel: 'Croma Cart Breakdown',
            sourceUrl: 'https://www.croma.com/lp-terms-of-use',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Same-day pickup available at nearby Croma stores',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: 'Today, 06:12 AM IST',
        trustScore: 84,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free in-store drop / pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment / Store Credit',
          refundMethodSignal: 'warn',
          refundSpeed: '5–8 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0 (Unopened) · No open return',
          restockingFeePercent: 0,
          restockingSignal: 'warn',
          exchangeAllowed: 'DOA Exchange at Store',
          exchangeSignal: 'good',
          conditions: 'Sealed-box returns accepted within 7 days; opened units require Apple DOA certificate for in-store swap.',
          plainEnglishSummary: 'Strong offline store support for sealed returns, but opened laptops need a DOA check.',
          policyScore: 76,
          sourceUrl: 'https://www.croma.com/lp-return-policy',
          timeline: [
            { step: 'Store or Online Request', duration: 'Day 0–7', detail: 'Walk into any Croma store or raise online ticket.' },
            { step: 'Seal / DOA Check', duration: 'Day 1–2', detail: 'Technician inspects seal or Apple DOA letter.' },
            { step: 'Refund Approval', duration: 'Day 3–4', detail: 'Approved to card or instant store credit.' },
            { step: 'Bank Credit', duration: 'Day 5–8', detail: 'Original payment credited in 5–8 working days.' },
          ],
        },
      },
      {
        storeId: 'reliance',
        storeName: 'Reliance Digital',
        shortCode: 'RD',
        storeDomain: 'reliancedigital.in',
        storeAccentBg: '#991B1B',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.reliancedigital.in/search?q=macbook%20pro%2016',
        inStock: true,
        listedPrice: 277990,
        mrp: 279900,
        coupons: [],
        bankOffers: [
          { bank: 'ICICI', label: 'ICICI Instant Cashback', amount: 3000, emiProcessingFee: 299 },
          { bank: 'HDFC', label: 'HDFC Instant Cashback', amount: 2500, emiProcessingFee: 299 },
        ],
        fees: [
          {
            id: 'rd-delivery',
            label: 'Insured Logistics Fee',
            category: 'delivery',
            amount: 499,
            isHidden: false,
            explanation: 'High-value electronics shipping charge.',
            sourceLabel: 'Reliance Digital Shipping',
            sourceUrl: 'https://www.reliancedigital.in/content/shipping-and-delivery-policy',
            remotePincodeSurcharge: 350,
          },
          {
            id: 'rd-handling',
            label: 'resQ Setup & Handling Charge',
            category: 'handling',
            amount: 599,
            isHidden: true,
            explanation: 'Pre-selected resQ delivery handling surcharge that increases checkout total unless manually removed.',
            sourceLabel: 'Reliance Digital Cart Terms',
            sourceUrl: 'https://www.reliancedigital.in/content/terms-and-conditions',
          },
          {
            id: 'rd-cod',
            label: 'COD Verification Fee',
            category: 'cod',
            amount: 249,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Cash on delivery processing fee.',
            sourceLabel: 'Reliance Payment Policy',
            sourceUrl: 'https://www.reliancedigital.in/content/terms-and-conditions',
          },
        ],
        baseDeliveryDays: 4,
        deliveryNote: '4-day regional warehouse dispatch',
        verifiedAgo: '4H AGO',
        verifiedTimestamp: 'Today, 05:22 AM IST',
        trustScore: 73,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days (DOA Only)',
          windowDays: 7,
          windowSignal: 'bad',
          returnShippingLabel: 'Buyer drops at store',
          returnShippingSignal: 'bad',
          refundMethod: 'Store Credit / Replacement',
          refundMethodSignal: 'bad',
          refundSpeed: '10–14 business days',
          refundSpeedSignal: 'bad',
          restockingFeeLabel: '10% if seal broken',
          restockingFeePercent: 10,
          restockingSignal: 'bad',
          exchangeAllowed: 'DOA Only',
          exchangeSignal: 'bad',
          conditions: 'No returns after box seal is broken unless certified DOA by Apple. Refunds often default to Reliance store credit.',
          plainEnglishSummary: 'Highest total price after ₹1,098 in fees and restrictive store-credit/DOA return terms.',
          policyScore: 48,
          sourceUrl: 'https://www.reliancedigital.in/content/cancellation-and-returns-policy',
          timeline: [
            { step: 'DOA Inspection', duration: 'Day 0–7', detail: 'Bring unit to Reliance Digital / Apple service center.' },
            { step: 'resQ Approval', duration: 'Day 4–6', detail: 'Regional manager verifies DOA report.' },
            { step: 'Credit / Swap', duration: 'Day 10–14', detail: 'Store credit or replacement issued.' },
          ],
        },
      },
      {
        storeId: 'jiomart',
        storeName: 'JioMart',
        shortCode: 'JM',
        storeDomain: 'jiomart.com',
        storeAccentBg: '#1D4ED8',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.jiomart.com/search/macbook%20pro%2016',
        inStock: false,
        stockNote: 'Out of stock for 400001 — restock unconfirmed',
        listedPrice: 272990,
        mrp: 279900,
        coupons: [],
        bankOffers: [{ bank: 'SBI', label: 'SBI Instant Offer', amount: 2500 }],
        fees: [
          {
            id: 'jm-handling',
            label: 'Marketplace Handling Fee',
            category: 'handling',
            amount: 399,
            isHidden: true,
            explanation: 'Added at payment step for third-party electronics sellers.',
            sourceLabel: 'JioMart Terms',
            sourceUrl: 'https://www.jiomart.com/terms-and-conditions',
          },
        ],
        baseDeliveryDays: 5,
        deliveryNote: 'Currently out of stock',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:10 AM IST',
        trustScore: 68,
        returnPolicy: {
          policyFound: false,
          windowLabel: 'Policy Not Found',
          windowDays: 0,
          windowSignal: 'not_found',
          returnShippingLabel: 'Not disclosed',
          returnShippingSignal: 'not_found',
          refundMethod: 'Not disclosed',
          refundMethodSignal: 'not_found',
          refundSpeed: 'Not disclosed',
          refundSpeedSignal: 'not_found',
          restockingFeeLabel: 'Not disclosed',
          restockingFeePercent: 0,
          restockingSignal: 'not_found',
          exchangeAllowed: 'Unverified',
          exchangeSignal: 'not_found',
          conditions: 'Third-party seller listing did not publish verifiable return terms during our last crawl.',
          plainEnglishSummary: 'Policy not found for this seller listing — treat as non-returnable until verified.',
          policyScore: 30,
          sourceUrl: 'https://www.jiomart.com/return-refund-and-cancellation-policy',
          timeline: [],
        },
      },
    ],
  },
  {
    id: 'iphone-16-pro-256',
    slug: 'iphone-16-pro-256gb-titanium',
    name: 'Apple iPhone 16 Pro (256GB, Natural Titanium)',
    shortName: 'iPhone 16 Pro 256GB',
    brand: 'Apple',
    categoryId: 'smartphones',
    categoryName: 'Smartphones',
    subCategory: 'Flagship Smartphones',
    images: [STUDIO_IMAGES.iphone, STUDIO_IMAGES.heroDesk, STUDIO_IMAGES.watch],
    updatedAgo: '45M AGO',
    storesChecked: 11,
    feesChecked: 34,
    spotlightRank: 2,
    verdictQuote:
      'Vijay Sales beats Flipkart by ₹1,298 once you include Flipkart’s ₹199 packaging + ₹99 platform fee, while Apple Direct remains best for returns.',
    verdictSummary:
      'Sticker prices look identical at ₹1,29,900 across stores, but bank discounts and hidden checkout surcharges create a ₹8,298 spread between the best and worst final payable total.',
    askQuestions: [
      'Which Indian store gives the lowest price with ICICI credit card?',
      'Why does Flipkart add packaging and protect promise fees?',
      'Can I return an opened iPhone on Amazon India?',
    ],
    priceHistory: [
      { date: '22 Oct', lowestTruePrice: 129900, avgListedPrice: 129900, store: 'Apple Store' },
      { date: '29 Oct', lowestTruePrice: 125900, avgListedPrice: 129900, store: 'Croma' },
      { date: '05 Nov', lowestTruePrice: 124400, avgListedPrice: 128900, store: 'Flipkart' },
      { date: '12 Nov', lowestTruePrice: 123900, avgListedPrice: 128500, store: 'Vijay Sales' },
      { date: '21 Nov', lowestTruePrice: 121900, avgListedPrice: 127900, store: 'Vijay Sales' },
    ],
    specs: [
      { label: 'Chipset', value: 'Apple A18 Pro (3nm, 6-core GPU)' },
      { label: 'Display', value: '6.3" Super Retina XDR OLED · 120Hz' },
      { label: 'Camera System', value: '48MP Fusion + 48MP Ultra Wide + 5x Telephoto' },
      { label: 'Storage', value: '256GB NVMe' },
      { label: 'India 5G Support', value: 'Jio True 5G & Airtel 5G Plus (Dual eSIM + Nano)' },
      { label: 'India MRP', value: '₹1,29,900 (incl. 18% GST)' },
    ],
    inTheBox: ['iPhone 16 Pro', 'USB-C Braided Charge Cable (1m)', 'Documentation (Adapter sold separately)'],
    warrantyNote: '1-year Apple India warranty valid across all authorised service providers in India.',
    listings: [
      {
        storeId: 'vijaysales',
        storeName: 'Vijay Sales',
        shortCode: 'VS',
        storeDomain: 'vijaysales.com',
        storeAccentBg: '#B91C1C',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.vijaysales.com/search/iphone-16-pro',
        inStock: true,
        listedPrice: 126900,
        mrp: 129900,
        coupons: [],
        bankOffers: [
          { bank: 'ICICI', label: 'ICICI Credit Card Instant Discount', amount: 5000, emiProcessingFee: 199 },
          { bank: 'HDFC', label: 'HDFC Instant Bank Discount', amount: 4500, emiProcessingFee: 199 },
          { bank: 'SBI', label: 'SBI Credit Card Offer', amount: 4000, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'vs-del',
            label: 'Insured Express Shipping',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Free insured shipping across India.',
            sourceLabel: 'Vijay Sales Shipping',
            sourceUrl: 'https://www.vijaysales.com/shipping-policy',
            remotePincodeSurcharge: 199,
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Same-day pickup at 140+ Vijay Sales outlets',
        verifiedAgo: '45M AGO',
        verifiedTimestamp: 'Today, 08:20 AM IST',
        trustScore: 87,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days (Sealed)',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free in-store return',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'DOA Swap via Brand',
          exchangeSignal: 'warn',
          conditions: 'Unopened units returnable within 7 days; opened phones handled through Apple DOA verification.',
          plainEnglishSummary: 'Zero hidden checkout fees and lowest card-adjusted price; opened returns need Apple DOA.',
          policyScore: 78,
          sourceUrl: 'https://www.vijaysales.com/return-policy',
          timeline: [
            { step: 'Submit Request', duration: 'Day 0–7', detail: 'Call helpline or visit store with GST invoice.' },
            { step: 'Inspection', duration: 'Day 1–2', detail: 'Box seal or Apple DOA verification.' },
            { step: 'Refund Processed', duration: 'Day 5–7', detail: 'Credited back to original bank card.' },
          ],
        },
      },
      {
        storeId: 'flipkart',
        storeName: 'Flipkart',
        shortCode: 'FK',
        storeDomain: 'flipkart.com',
        storeAccentBg: '#1E3A8A',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.flipkart.com/search?q=iphone+16+pro+256gb',
        inStock: true,
        listedPrice: 127900,
        mrp: 129900,
        coupons: [{ code: 'PHONE1K', label: 'Prepaid Mobile Coupon', amount: 1000, autoApplied: true }],
        bankOffers: [
          { bank: 'ICICI', label: 'ICICI Instant Discount', amount: 4000, emiProcessingFee: 299 },
          { bank: 'HDFC', label: 'HDFC Instant Discount', amount: 4000, emiProcessingFee: 299 },
          { bank: 'AXIS', label: 'Axis Flipkart Card Cashback', amount: 4500, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'fk-ip-pkg',
            label: 'Secured Packaging Fee',
            category: 'packaging',
            amount: 199,
            isHidden: true,
            explanation: 'Mandatory non-refundable fee added at checkout for smartphones.',
            sourceLabel: 'Flipkart Fee Schedule',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
          {
            id: 'fk-ip-plat',
            label: 'Protect Promise Fee',
            category: 'platform',
            amount: 99,
            isHidden: true,
            explanation: 'Checkout assurance fee for open-box mobile delivery.',
            sourceLabel: 'Flipkart Checkout Terms',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
          {
            id: 'fk-ip-cod',
            label: 'COD Handling Charge',
            category: 'cod',
            amount: 149,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Added only when Cash on Delivery is selected.',
            sourceLabel: 'Flipkart Payment Fees',
            sourceUrl: 'https://www.flipkart.com/pages/paymentsecurity',
          },
        ],
        baseDeliveryDays: 1,
        deliveryNote: 'Next-day Open-Box Delivery',
        verifiedAgo: '45M AGO',
        verifiedTimestamp: 'Today, 08:20 AM IST',
        trustScore: 79,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Service Center Drop',
          returnShippingSignal: 'bad',
          refundMethod: 'Replacement Only',
          refundMethodSignal: 'bad',
          refundSpeed: '7–10 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0 (Fees non-refundable)',
          restockingFeePercent: 0,
          restockingSignal: 'warn',
          exchangeAllowed: 'DOA Only',
          exchangeSignal: 'warn',
          conditions: 'No return after OTP confirmation on Open-Box Delivery; hardware faults routed to Apple Service Center.',
          plainEnglishSummary: 'Fastest delivery, but adds ₹298 in hidden packaging/platform fees and strict service-center-only returns.',
          policyScore: 60,
          sourceUrl: 'https://www.flipkart.com/pages/returnpolicy',
          timeline: [
            { step: 'Doorstep Open-Box', duration: 'Day 0', detail: 'Check IMEI & physical condition before OTP.' },
            { step: 'Apple Center Visit', duration: 'Day 1–4', detail: 'Required for any post-delivery defect.' },
            { step: 'Replacement', duration: 'Day 7–10', detail: 'Replacement unit approved.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#111827',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.amazon.in/s?k=iphone+16+pro+256gb',
        inStock: true,
        listedPrice: 128900,
        mrp: 129900,
        coupons: [],
        bankOffers: [
          { bank: 'ICICI', label: 'Amazon Pay ICICI Unlimited 5%', amount: 5000, emiProcessingFee: 199 },
          { bank: 'SBI', label: 'SBI Credit Card Instant Discount', amount: 4000, emiProcessingFee: 199 },
          { bank: 'HDFC', label: 'HDFC Instant Discount', amount: 3000, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'az-ip-plat',
            label: 'Offer Processing Fee',
            category: 'platform',
            amount: 99,
            isHidden: true,
            explanation: 'Non-refundable bank offer processing charge on smartphones.',
            sourceLabel: 'Amazon.in Terms',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
          {
            id: 'az-ip-cod',
            label: 'Pay on Delivery Fee',
            category: 'cod',
            amount: 99,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Cash-handling fee if COD is chosen.',
            sourceLabel: 'Amazon POD Terms',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 1,
        deliveryNote: 'Prime Next-Day Delivery',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: 'Today, 08:00 AM IST',
        trustScore: 84,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Brand Replacement',
          refundMethodSignal: 'warn',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes (Defects)',
          exchangeSignal: 'warn',
          conditions: '7-day Service Center Replacement policy.',
          plainEnglishSummary: 'Best value for Amazon Pay ICICI cardholders, with transparent shipping and 7-day brand replacement.',
          policyScore: 73,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Support Ticket', duration: 'Day 0–7', detail: 'Contact Amazon & Apple Support.' },
            { step: 'Pickup', duration: 'Day 2–3', detail: 'Free courier pickup.' },
            { step: 'Resolution', duration: 'Day 5–7', detail: 'Replacement or refund to source.' },
          ],
        },
      },
      {
        storeId: 'apple',
        storeName: 'Apple India Store',
        shortCode: 'AP',
        storeDomain: 'apple.com/in',
        storeAccentBg: '#0E0E0E',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.apple.com/in/shop/buy-iphone/iphone-16-pro',
        inStock: true,
        listedPrice: 129900,
        mrp: 129900,
        coupons: [],
        bankOffers: [
          { bank: 'ICICI', label: 'Apple India Instant Savings', amount: 5000, emiProcessingFee: 0 },
          { bank: 'AXIS', label: 'Apple India Instant Savings', amount: 5000, emiProcessingFee: 0 },
          { bank: 'HDFC', label: 'Apple India Instant Savings', amount: 5000, emiProcessingFee: 0 },
        ],
        fees: [],
        baseDeliveryDays: 2,
        deliveryNote: 'Free delivery or BKC / Saket pickup',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: 'Today, 08:05 AM IST',
        trustScore: 98,
        returnPolicy: {
          policyFound: true,
          windowLabel: '14 Days',
          windowDays: 14,
          windowSignal: 'good',
          returnShippingLabel: 'Free pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '3–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes — Full Exchange',
          exchangeSignal: 'good',
          conditions: '14-day unconditional return policy with full refund even after opening.',
          plainEnglishSummary: 'Zero fees and India’s only unconditional 14-day open-box refund policy on iPhones.',
          policyScore: 99,
          sourceUrl: 'https://www.apple.com/in/shop/help/returns_refund',
          timeline: [
            { step: 'Initiate Online', duration: 'Day 0–14', detail: 'Instant online return label.' },
            { step: 'BlueDart Pickup', duration: 'Day 1–2', detail: 'Free insured doorstep pickup.' },
            { step: 'Refund Credited', duration: 'Day 4–5', detail: 'Full amount back to card.' },
          ],
        },
      },
      {
        storeId: 'jiomart',
        storeName: 'JioMart',
        shortCode: 'JM',
        storeDomain: 'jiomart.com',
        storeAccentBg: '#1D4ED8',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.jiomart.com/search/iphone%2016%20pro',
        inStock: true,
        listedPrice: 129500,
        mrp: 129900,
        coupons: [],
        bankOffers: [{ bank: 'SBI', label: 'SBI Instant Offer', amount: 2000 }],
        fees: [
          {
            id: 'jm-ip-hand',
            label: 'Platform Handling & Transit Insurance',
            category: 'handling',
            amount: 698,
            isHidden: true,
            explanation: 'Non-refundable handling + transit protection added on final checkout page.',
            sourceLabel: 'JioMart Checkout',
            sourceUrl: 'https://www.jiomart.com/terms-and-conditions',
          },
          {
            id: 'jm-ip-cod',
            label: 'COD Surcharge',
            category: 'cod',
            amount: 199,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Cash-handling fee if Pay on Delivery is enabled.',
            sourceLabel: 'JioMart Payments',
            sourceUrl: 'https://www.jiomart.com/terms-and-conditions',
          },
        ],
        baseDeliveryDays: 4,
        deliveryNote: '4-day standard delivery',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:05 AM IST',
        trustScore: 70,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days (DOA)',
          windowDays: 7,
          windowSignal: 'bad',
          returnShippingLabel: 'Buyer pays ₹249',
          returnShippingSignal: 'bad',
          refundMethod: 'JioMart Wallet Credit',
          refundMethodSignal: 'bad',
          refundSpeed: '10–14 business days',
          refundSpeedSignal: 'bad',
          restockingFeeLabel: '5% Open-Box Fee',
          restockingFeePercent: 5,
          restockingSignal: 'bad',
          exchangeAllowed: 'DOA Only',
          exchangeSignal: 'bad',
          conditions: 'Refunds for cancelled/returned third-party electronics frequently settle to JioMart wallet.',
          plainEnglishSummary: 'Avoid unless heavily discounted — adds ₹698 in hidden fees and deducts shipping on returns.',
          policyScore: 45,
          sourceUrl: 'https://www.jiomart.com/return-refund-and-cancellation-policy',
          timeline: [
            { step: 'Ticket Logged', duration: 'Day 0–7', detail: 'Upload unboxing video & DOA letter.' },
            { step: 'Courier Return', duration: 'Day 4–6', detail: '₹249 return logistics deducted.' },
            { step: 'Wallet Credit', duration: 'Day 10–14', detail: 'Settled to JioMart wallet.' },
          ],
        },
      },
    ],
  },
  {
    id: 'sony-wh1000xm5',
    slug: 'sony-wh-1000xm5-wireless-anc',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    shortName: 'Sony WH-1000XM5 ANC',
    brand: 'Sony',
    categoryId: 'audio',
    categoryName: 'Headphones & Audio',
    subCategory: 'ANC Headphones',
    images: [STUDIO_IMAGES.headphones, STUDIO_IMAGES.heroAudio, STUDIO_IMAGES.macbook],
    updatedAgo: '1H AGO',
    storesChecked: 9,
    feesChecked: 28,
    spotlightRank: 3,
    verdictQuote:
      'ShopAtSC (Sony Direct) has ₹0 hidden fees and a clean 10-day return, beating "cheaper" marketplace listings that tack on ₹1,200+ at checkout.',
    verdictSummary:
      'Croma wins by ₹500 when HDFC/ICICI card offers apply, while Amazon India offers the fastest 1-day delivery with zero packaging surcharges.',
    askQuestions: [
      'Is Croma cheaper than Amazon after all fees?',
      'Which store lets me return headphones if the fit is uncomfortable?',
      'Are there any hidden handling or COD charges here?',
    ],
    priceHistory: [
      { date: '22 Oct', lowestTruePrice: 27990, avgListedPrice: 29990, store: 'Amazon India' },
      { date: '30 Oct', lowestTruePrice: 26490, avgListedPrice: 28990, store: 'Croma' },
      { date: '08 Nov', lowestTruePrice: 25990, avgListedPrice: 28490, store: 'Sony Direct' },
      { date: '15 Nov', lowestTruePrice: 24990, avgListedPrice: 27990, store: 'Croma' },
      { date: '21 Nov', lowestTruePrice: 24490, avgListedPrice: 27490, store: 'Croma' },
    ],
    specs: [
      { label: 'Driver Unit', value: '30mm Carbon Fiber Composite Dome' },
      { label: 'Active Noise Cancellation', value: 'Dual Processor (V1 + QN1) · 8 Microphones' },
      { label: 'Battery Life', value: '30 Hours (ANC On) · USB-PD Quick Charge' },
      { label: 'Codecs', value: 'LDAC, AAC, SBC · Multipoint Bluetooth 5.2' },
      { label: 'Warranty', value: '1-Year Sony India Official Warranty' },
    ],
    inTheBox: ['WH-1000XM5 Headphones', 'Collapsible Carrying Case', '3.5mm Audio Cable', 'USB-C Charging Cable'],
    warrantyNote: 'Official 1-year Sony India warranty requires GST tax invoice from authorised dealer.',
    listings: [
      {
        storeId: 'croma',
        storeName: 'Croma',
        shortCode: 'CR',
        storeDomain: 'croma.com',
        storeAccentBg: '#065F46',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.croma.com/searchB?q=sony%20wh-1000xm5',
        inStock: true,
        listedPrice: 26990,
        mrp: 34990,
        coupons: [{ code: 'AUDIO500', label: 'Croma Audio Coupon', amount: 500, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Instant Card Discount', amount: 2000, emiProcessingFee: 199 },
          { bank: 'ICICI', label: 'ICICI Instant Card Discount', amount: 2000, emiProcessingFee: 199 },
          { bank: 'SBI', label: 'SBI Instant Card Discount', amount: 1500, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'cr-xm5-del',
            label: 'Standard Delivery',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Free delivery across India.',
            sourceLabel: 'Croma Shipping',
            sourceUrl: 'https://www.croma.com/lp-terms-of-use',
            remotePincodeSurcharge: 149,
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Free delivery or 3-hour store pickup',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: 'Today, 08:05 AM IST',
        trustScore: 90,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'good',
          returnShippingLabel: 'Free pickup / store drop',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '4–6 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes — In-store & Online',
          exchangeSignal: 'good',
          conditions: 'Returnable within 7 days with original packaging and accessories intact.',
          plainEnglishSummary: 'Lowest final price with card offers, zero hidden fees, and clean 7-day refund to original payment.',
          policyScore: 88,
          sourceUrl: 'https://www.croma.com/lp-return-policy',
          timeline: [
            { step: 'Return Request', duration: 'Day 0–7', detail: 'Online or walk into any Croma store.' },
            { step: 'QC Inspection', duration: 'Day 1–2', detail: 'Verify case, cable, and serial number.' },
            { step: 'Bank Refund', duration: 'Day 4–6', detail: 'Full refund back to card/UPI.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#111827',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.amazon.in/s?k=sony+wh-1000xm5',
        inStock: true,
        listedPrice: 26990,
        mrp: 34990,
        coupons: [],
        bankOffers: [
          { bank: 'ICICI', label: 'Amazon Pay ICICI 5% Back', amount: 1349 },
          { bank: 'HDFC', label: 'HDFC Instant Offer', amount: 1500, emiProcessingFee: 199 },
          { bank: 'SBI', label: 'SBI Card Instant Offer', amount: 1500, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'az-xm5-cod',
            label: 'Pay on Delivery Fee',
            category: 'cod',
            amount: 59,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Small cash-handling fee on COD orders.',
            sourceLabel: 'Amazon POD Terms',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 1,
        deliveryNote: 'Same-day / Next-day Prime shipping',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: 'Today, 08:10 AM IST',
        trustScore: 88,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free doorstep pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Replacement First',
          refundMethodSignal: 'warn',
          refundSpeed: '3–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes — Instant Swap',
          exchangeSignal: 'good',
          conditions: '7-day replacement for damaged/defective items; refund on second issue.',
          plainEnglishSummary: 'Fastest 1-day delivery and transparent pricing, though first return is replacement-only.',
          policyScore: 80,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Tap Return', duration: 'Day 0–7', detail: 'Instant pickup slot in Orders.' },
            { step: 'Doorstep Pickup', duration: 'Day 1', detail: 'Free courier pickup.' },
            { step: 'Swap / Refund', duration: 'Day 3–5', detail: 'Replacement shipped or refunded.' },
          ],
        },
      },
      {
        storeId: 'flipkart',
        storeName: 'Flipkart',
        shortCode: 'FK',
        storeDomain: 'flipkart.com',
        storeAccentBg: '#1E3A8A',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.flipkart.com/search?q=sony+wh+1000xm5',
        inStock: true,
        listedPrice: 25990,
        mrp: 34990,
        coupons: [],
        bankOffers: [
          { bank: 'AXIS', label: 'Flipkart Axis 5% Offer', amount: 1250 },
          { bank: 'HDFC', label: 'HDFC Offer', amount: 1000, emiProcessingFee: 249 },
        ],
        fees: [
          {
            id: 'fk-xm5-pkg',
            label: 'Secured Packaging Fee',
            category: 'packaging',
            amount: 99,
            isHidden: true,
            explanation: 'Non-refundable protective box fee added at checkout.',
            sourceLabel: 'Flipkart Fee Schedule',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
          {
            id: 'fk-xm5-hand',
            label: 'Seller Handling & Platform Fee',
            category: 'handling',
            amount: 149,
            isHidden: true,
            explanation: 'Marketplace handling fee surfaced only at final review.',
            sourceLabel: 'Flipkart Checkout',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
          {
            id: 'fk-xm5-cod',
            label: 'Cash on Delivery Fee',
            category: 'cod',
            amount: 79,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Cash-handling surcharge for Pay on Delivery.',
            sourceLabel: 'Flipkart Payment Fees',
            sourceUrl: 'https://www.flipkart.com/pages/paymentsecurity',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: '2-day Open-Box Delivery',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:10 AM IST',
        trustScore: 76,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Service Center Visit',
          returnShippingSignal: 'bad',
          refundMethod: 'Replacement Only',
          refundMethodSignal: 'bad',
          refundSpeed: '7–10 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0 (Fees lost)',
          restockingFeePercent: 0,
          restockingSignal: 'warn',
          exchangeAllowed: 'DOA Only',
          exchangeSignal: 'warn',
          conditions: 'No change-of-mind returns; defects require Sony service center DOA report.',
          plainEnglishSummary: 'Sticker looks ₹1,000 cheaper, but hidden fees + weaker bank offer make Croma cheaper overall.',
          policyScore: 58,
          sourceUrl: 'https://www.flipkart.com/pages/returnpolicy',
          timeline: [
            { step: 'Open-Box Check', duration: 'Day 0', detail: 'Inspect headphones before giving OTP.' },
            { step: 'Sony Service Check', duration: 'Day 2–4', detail: 'Required for post-delivery defect claims.' },
            { step: 'Replacement', duration: 'Day 7–10', detail: 'Replacement unit shipped.' },
          ],
        },
      },
      {
        storeId: 'tatacliq',
        storeName: 'Tata CLiQ',
        shortCode: 'TC',
        storeDomain: 'tatacliq.com',
        storeAccentBg: '#7C2D12',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.tatacliq.com/search/?text=sony%20wh-1000xm5',
        inStock: true,
        listedPrice: 26490,
        mrp: 34990,
        coupons: [{ code: 'CLIQ500', label: 'First Tech Order Coupon', amount: 500, autoApplied: false }],
        bankOffers: [{ bank: 'ICICI', label: 'ICICI 10% Cap Offer', amount: 1500 }],
        fees: [
          {
            id: 'tc-xm5-del',
            label: 'Insured Courier Fee',
            category: 'delivery',
            amount: 149,
            isHidden: false,
            explanation: 'Flat courier fee for electronics shipped from brand warehouse.',
            sourceLabel: 'Tata CLiQ Shipping',
            sourceUrl: 'https://www.tatacliq.com/shipping-policy',
            remotePincodeSurcharge: 150,
          },
          {
            id: 'tc-xm5-hand',
            label: 'Platform Convenience Fee',
            category: 'platform',
            amount: 99,
            isHidden: true,
            explanation: 'Non-refundable convenience fee charged at checkout.',
            sourceLabel: 'Tata CLiQ Terms',
            sourceUrl: 'https://www.tatacliq.com/terms-of-use',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: '3-day brand-fulfilled shipping',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:05 AM IST',
        trustScore: 82,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment / CLiQ Cash',
          refundMethodSignal: 'good',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes',
          exchangeSignal: 'good',
          conditions: 'Original seal & accessories required for non-defective returns.',
          plainEnglishSummary: 'Authentic brand-direct fulfilment with clear refund-to-bank policy.',
          policyScore: 81,
          sourceUrl: 'https://www.tatacliq.com/return-policy',
          timeline: [
            { step: 'Online Return', duration: 'Day 0–7', detail: 'Raise in Tata CLiQ app.' },
            { step: 'Courier Pickup', duration: 'Day 2', detail: 'Free doorstep collection.' },
            { step: 'Refund Credit', duration: 'Day 5–7', detail: 'Credited to original payment.' },
          ],
        },
      },
    ],
  },
  {
    id: 'garmin-fenix-8',
    slug: 'garmin-fenix-8-titanium-47mm',
    name: 'Garmin Fenix 8 AMOLED (47mm, Brushed Titanium)',
    shortName: 'Garmin Fenix 8 Titanium',
    brand: 'Garmin',
    categoryId: 'wearables',
    categoryName: 'Wearables',
    subCategory: 'GPS & Titanium Watches',
    images: [STUDIO_IMAGES.watch, STUDIO_IMAGES.heroDesk, STUDIO_IMAGES.headphones],
    updatedAgo: '3H AGO',
    storesChecked: 7,
    feesChecked: 21,
    spotlightRank: 4,
    verdictQuote:
      'Garmin India Direct charges ₹0 checkout fees and includes a 2-year official warranty — marketplace resellers add ₹1,899 in handling charges.',
    verdictSummary:
      'For high-ticket GPS wearables in India, buying directly or via Tata CLiQ Luxury prevents grey-market warranty rejection.',
    askQuestions: [
      'Does Amazon India include the 2-year official Garmin India warranty?',
      'Which store has zero hidden fees on Garmin Fenix 8?',
    ],
    priceHistory: [
      { date: '24 Oct', lowestTruePrice: 99990, avgListedPrice: 104990, store: 'Garmin Direct' },
      { date: '04 Nov', lowestTruePrice: 97490, avgListedPrice: 102990, store: 'Tata CLiQ' },
      { date: '14 Nov', lowestTruePrice: 95990, avgListedPrice: 101990, store: 'Tata CLiQ' },
      { date: '21 Nov', lowestTruePrice: 94990, avgListedPrice: 101490, store: 'Tata CLiQ' },
    ],
    specs: [
      { label: 'Case Material', value: '47mm Brushed Titanium · Sapphire Crystal' },
      { label: 'Display', value: '1.4" AMOLED Always-On (454 × 454)' },
      { label: 'Battery', value: 'Up to 16 Days Smartwatch · 47 Hours GPS' },
      { label: 'Dive Rating', value: '10 ATM / 40m Recreational Dive Certified' },
      { label: 'Warranty', value: '2-Year Official Garmin India Warranty' },
    ],
    inTheBox: ['Fenix 8 47mm Titanium', 'Silicone Strap', 'USB-C Charging/Data Cable', 'India Warranty Card'],
    warrantyNote: 'Garmin India strictly requires an authorised India GST invoice for 2-year warranty claims.',
    listings: [
      {
        storeId: 'tatacliq',
        storeName: 'Tata CLiQ',
        shortCode: 'TC',
        storeDomain: 'tatacliq.com',
        storeAccentBg: '#7C2D12',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.tatacliq.com/search/?text=garmin%20fenix%208',
        inStock: true,
        listedPrice: 98990,
        mrp: 104990,
        coupons: [{ code: 'LUX1000', label: 'Tata CLiQ Watch Voucher', amount: 1000, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Luxury Instant Discount', amount: 3000 },
          { bank: 'ICICI', label: 'ICICI Instant Discount', amount: 2500 },
        ],
        fees: [],
        baseDeliveryDays: 2,
        deliveryNote: 'Free insured White-Glove delivery',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: 'Today, 06:00 AM IST',
        trustScore: 92,
        returnPolicy: {
          policyFound: true,
          windowLabel: '10 Days',
          windowDays: 10,
          windowSignal: 'good',
          returnShippingLabel: 'Free pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '4–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes',
          exchangeSignal: 'good',
          conditions: 'Unworn watch with tags & protective film intact eligible for full 10-day refund.',
          plainEnglishSummary: 'Lowest final cost, zero hidden charges, and generous 10-day bank refund.',
          policyScore: 91,
          sourceUrl: 'https://www.tatacliq.com/return-policy',
          timeline: [
            { step: 'Schedule Return', duration: 'Day 0–10', detail: 'One-tap return in orders.' },
            { step: 'Insured Pickup', duration: 'Day 1–2', detail: 'Free tamper-proof pickup.' },
            { step: 'Refund Credited', duration: 'Day 4–5', detail: '100% refunded to original card.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#111827',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.amazon.in/s?k=garmin+fenix+8',
        inStock: true,
        listedPrice: 99990,
        mrp: 104990,
        coupons: [],
        bankOffers: [{ bank: 'ICICI', label: 'Amazon Pay ICICI Cashback', amount: 2500 }],
        fees: [
          {
            id: 'az-gm-hand',
            label: 'High-Value Handling Fee',
            category: 'handling',
            amount: 249,
            isHidden: true,
            explanation: 'Third-party luxury watch seller handling surcharge.',
            sourceLabel: 'Amazon Seller Fee',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: '2-day insured shipping',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: 'Today, 06:00 AM IST',
        trustScore: 83,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Replacement Only',
          refundMethodSignal: 'warn',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Replacement for Defects',
          exchangeSignal: 'warn',
          conditions: '7-day replacement only for smartwatch electronics.',
          plainEnglishSummary: 'Reliable shipping, but Tata CLiQ beats it on both final price and cash refund rights.',
          policyScore: 74,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Raise Return', duration: 'Day 0–7', detail: 'Select defect reason in Orders.' },
            { step: 'Pickup', duration: 'Day 2', detail: 'Free courier pickup.' },
            { step: 'Replacement', duration: 'Day 5–7', detail: 'Replacement unit dispatched.' },
          ],
        },
      },
      {
        storeId: 'reliance',
        storeName: 'Reliance Digital',
        shortCode: 'RD',
        storeDomain: 'reliancedigital.in',
        storeAccentBg: '#991B1B',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.reliancedigital.in/search?q=garmin%20fenix%208',
        inStock: true,
        listedPrice: 102990,
        mrp: 104990,
        coupons: [],
        bankOffers: [{ bank: 'SBI', label: 'SBI Instant Offer', amount: 1500 }],
        fees: [
          {
            id: 'rd-gm-ins',
            label: 'Transit Protection & Handling',
            category: 'handling',
            amount: 899,
            isHidden: true,
            explanation: 'Non-refundable handling and transit surcharge.',
            sourceLabel: 'Reliance Digital Terms',
            sourceUrl: 'https://www.reliancedigital.in/content/terms-and-conditions',
          },
        ],
        baseDeliveryDays: 4,
        deliveryNote: '4-day regional courier',
        verifiedAgo: '4H AGO',
        verifiedTimestamp: 'Today, 05:10 AM IST',
        trustScore: 71,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days (DOA)',
          windowDays: 7,
          windowSignal: 'bad',
          returnShippingLabel: 'Store drop-off',
          returnShippingSignal: 'bad',
          refundMethod: 'Store Credit Only',
          refundMethodSignal: 'bad',
          refundSpeed: '10–14 business days',
          refundSpeedSignal: 'bad',
          restockingFeeLabel: '10% Restocking',
          restockingFeePercent: 10,
          restockingSignal: 'bad',
          exchangeAllowed: 'DOA Only',
          exchangeSignal: 'bad',
          conditions: 'Strict sealed-box rule; DOA replacements take up to 2 weeks.',
          plainEnglishSummary: '₹8,899 costlier than Tata CLiQ after hidden fees and weak return terms.',
          policyScore: 46,
          sourceUrl: 'https://www.reliancedigital.in/content/cancellation-and-returns-policy',
          timeline: [
            { step: 'Store Inspection', duration: 'Day 0–7', detail: 'Physical check at Reliance Digital.' },
            { step: 'Credit Note', duration: 'Day 10–14', detail: 'Store credit issued.' },
          ],
        },
      },
    ],
  },
  {
    id: 'fujifilm-xt5-kit',
    slug: 'fujifilm-xt5-35mm-kit',
    name: 'Fujifilm X-T5 Mirrorless Camera + XF 35mm f/1.4 Kit',
    shortName: 'Fujifilm X-T5 + 35mm Kit',
    brand: 'Fujifilm',
    categoryId: 'cameras',
    categoryName: 'Cameras & Optics',
    subCategory: 'Mirrorless Cameras',
    images: [STUDIO_IMAGES.camera, STUDIO_IMAGES.heroDesk, STUDIO_IMAGES.macbook],
    updatedAgo: '2H AGO',
    storesChecked: 8,
    feesChecked: 26,
    spotlightRank: 5,
    verdictQuote:
      'Amazon India saves ₹7,450 over boutique resellers after bank discounts, with zero hidden transit insurance fees.',
    verdictSummary:
      'Camera retailers often add mandatory ₹1,500–₹2,500 transit insurance on mirrorless kits. Amazon and Croma keep total fees transparent.',
    askQuestions: [
      'Which camera store avoids mandatory transit insurance fees?',
      'Are shutter-actuated cameras returnable on Amazon or Flipkart?',
    ],
    priceHistory: [
      { date: '25 Oct', lowestTruePrice: 184990, avgListedPrice: 189990, store: 'Croma' },
      { date: '06 Nov', lowestTruePrice: 181490, avgListedPrice: 187990, store: 'Amazon India' },
      { date: '21 Nov', lowestTruePrice: 177990, avgListedPrice: 186490, store: 'Amazon India' },
    ],
    specs: [
      { label: 'Sensor', value: '40.2MP APS-C X-Trans CMOS 5 HR' },
      { label: 'Stabilisation', value: '7.0-Stop 5-Axis In-Body IS' },
      { label: 'Included Lens', value: 'Fujinon XF 35mm f/1.4 R' },
      { label: 'Warranty', value: '2-Year Fujifilm India Official Warranty' },
    ],
    inTheBox: ['X-T5 Camera Body', 'XF 35mm f/1.4 Lens', 'NP-W235 Battery', 'Shoulder Strap', 'India Warranty Card'],
    warrantyNote: 'Register serial on Fujifilm India portal within 15 days for full 2-year coverage.',
    listings: [
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#111827',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.amazon.in/s?k=fujifilm+x-t5',
        inStock: true,
        listedPrice: 182990,
        mrp: 194990,
        coupons: [{ code: 'CAM1000', label: 'Camera Instant Coupon', amount: 1000, autoApplied: true }],
        bankOffers: [
          { bank: 'ICICI', label: 'ICICI Instant Bank Discount', amount: 4000 },
          { bank: 'HDFC', label: 'HDFC Instant Bank Discount', amount: 4000 },
        ],
        fees: [],
        baseDeliveryDays: 2,
        deliveryNote: 'Insured OTP-verified camera delivery',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:10 AM IST',
        trustScore: 89,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Replacement Only',
          refundMethodSignal: 'warn',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes (Defective/Damaged)',
          exchangeSignal: 'good',
          conditions: '7-day replacement for sensor/lens defects.',
          plainEnglishSummary: 'Lowest final payable price with ₹0 hidden courier or insurance surcharges.',
          policyScore: 79,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Report Defect', duration: 'Day 0–7', detail: 'Upload sample photo showing defect.' },
            { step: 'Pickup', duration: 'Day 2', detail: 'Free insured courier pickup.' },
            { step: 'Replacement', duration: 'Day 5–7', detail: 'Sealed replacement unit sent.' },
          ],
        },
      },
      {
        storeId: 'flipkart',
        storeName: 'Flipkart',
        shortCode: 'FK',
        storeDomain: 'flipkart.com',
        storeAccentBg: '#1E3A8A',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.flipkart.com/search?q=fujifilm+xt5',
        inStock: true,
        listedPrice: 181990,
        mrp: 194990,
        coupons: [],
        bankOffers: [{ bank: 'AXIS', label: 'Axis Card Offer', amount: 2500 }],
        fees: [
          {
            id: 'fk-cam-ins',
            label: 'High-Value Transit & Packaging Fee',
            category: 'packaging',
            amount: 1499,
            isHidden: true,
            explanation: 'Mandatory insured foam packaging surcharge for camera kits.',
            sourceLabel: 'Flipkart Fee Schedule',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
          {
            id: 'fk-cam-plat',
            label: 'Platform Protect Fee',
            category: 'platform',
            amount: 199,
            isHidden: true,
            explanation: 'Non-refundable checkout handling fee.',
            sourceLabel: 'Flipkart Checkout',
            sourceUrl: 'https://www.flipkart.com/helpcentre',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: 'Open-Box Delivery mandatory',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: 'Today, 07:10 AM IST',
        trustScore: 74,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days (DOA)',
          windowDays: 7,
          windowSignal: 'bad',
          returnShippingLabel: 'Service Center',
          returnShippingSignal: 'bad',
          refundMethod: 'Replacement Only',
          refundMethodSignal: 'bad',
          refundSpeed: '10 business days',
          refundSpeedSignal: 'bad',
          restockingFeeLabel: '₹0 (Fees lost)',
          restockingFeePercent: 0,
          restockingSignal: 'warn',
          exchangeAllowed: 'DOA Only',
          exchangeSignal: 'warn',
          conditions: 'Requires Fujifilm service center DOA report after Open-Box acceptance.',
          plainEnglishSummary: 'Lower sticker price is wiped out by ₹1,698 in hidden packaging & platform charges.',
          policyScore: 55,
          sourceUrl: 'https://www.flipkart.com/pages/returnpolicy',
          timeline: [
            { step: 'Open-Box Check', duration: 'Day 0', detail: 'Check lens mount & sensor.' },
            { step: 'Fujifilm Center', duration: 'Day 3–5', detail: 'Obtain DOA confirmation.' },
            { step: 'Replacement', duration: 'Day 8–10', detail: 'Replacement shipped.' },
          ],
        },
      },
    ],
  },
  {
    id: 'breville-barista-express',
    slug: 'breville-barista-express-impress',
    name: 'Breville Barista Express Impress Espresso Machine (230V India)',
    shortName: 'Breville Barista Express',
    brand: 'Breville',
    categoryId: 'appliances',
    categoryName: 'Home & Espresso',
    subCategory: 'Espresso Machines',
    images: [STUDIO_IMAGES.appliance, STUDIO_IMAGES.heroDesk, STUDIO_IMAGES.camera],
    updatedAgo: '3H AGO',
    storesChecked: 6,
    feesChecked: 24,
    verdictQuote:
      'Croma includes free doorstep installation and ₹0 heavy-appliance handling, saving ₹3,249 over marketplace listings that add installation + freight fees.',
    verdictSummary:
      'Heavy kitchen appliances in India carry hidden freight, stair-carry, and mandatory demo/installation charges. Always compare installed total price.',
    askQuestions: [
      'Is installation included in the final price on Amazon vs Croma?',
      'What happens if I return a heavy espresso machine?',
    ],
    priceHistory: [
      { date: '26 Oct', lowestTruePrice: 74990, avgListedPrice: 79990, store: 'Croma' },
      { date: '10 Nov', lowestTruePrice: 72490, avgListedPrice: 78490, store: 'Croma' },
      { date: '21 Nov', lowestTruePrice: 69990, avgListedPrice: 77990, store: 'Croma' },
    ],
    specs: [
      { label: 'Voltage', value: '220–240V / 50Hz (Official Indian Plug)' },
      { label: 'Grinder', value: 'Integrated Conical Burr (25 Grind Settings)' },
      { label: 'Pump Pressure', value: '15-Bar Italian Pump · PID Temp Control' },
      { label: 'Installation', value: 'Countertop Demo Included at Select Stores' },
    ],
    inTheBox: ['Barista Express Machine', '54mm Stainless Portafilter', 'Milk Jug', 'Water Filter & Cleaning Kit'],
    warrantyNote: '2-year authorised India importer warranty; avoid 110V US imports sold by unverified sellers.',
    listings: [
      {
        storeId: 'croma',
        storeName: 'Croma',
        shortCode: 'CR',
        storeDomain: 'croma.com',
        storeAccentBg: '#065F46',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.croma.com/searchB?q=espresso%20machine',
        inStock: true,
        listedPrice: 72990,
        mrp: 79990,
        coupons: [],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Instant Card Offer', amount: 3000 },
          { bank: 'ICICI', label: 'ICICI Instant Card Offer', amount: 2500 },
        ],
        fees: [
          {
            id: 'cr-esp-inst',
            label: 'Home Demo & Installation',
            category: 'installation',
            amount: 0,
            isHidden: false,
            explanation: 'Complimentary technician setup included.',
            sourceLabel: 'Croma ZipCare',
            sourceUrl: 'https://www.croma.com/lp-terms-of-use',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: 'Free heavy-appliance scheduled slot',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: 'Today, 06:00 AM IST',
        trustScore: 91,
        returnPolicy: {
          policyFound: true,
          windowLabel: '10 Days',
          windowDays: 10,
          windowSignal: 'good',
          returnShippingLabel: 'Free van pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Yes',
          exchangeSignal: 'good',
          conditions: 'Free pickup for transit damage or unused machines within 10 days.',
          plainEnglishSummary: 'Best total value — zero heavy freight or installation add-ons and free van pickup.',
          policyScore: 89,
          sourceUrl: 'https://www.croma.com/lp-return-policy',
          timeline: [
            { step: 'Book Pickup', duration: 'Day 0–10', detail: 'Schedule heavy-item van pickup.' },
            { step: 'Inspection', duration: 'Day 2–3', detail: 'Technician confirms accessories.' },
            { step: 'Bank Refund', duration: 'Day 5–7', detail: 'Full refund to original payment.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#111827',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.amazon.in/s?k=breville+barista+express',
        inStock: true,
        listedPrice: 71990,
        mrp: 79990,
        coupons: [],
        bankOffers: [{ bank: 'ICICI', label: 'ICICI Offer', amount: 1500 }],
        fees: [
          {
            id: 'az-esp-freight',
            label: 'Heavy Appliance Shipping Fee',
            category: 'delivery',
            amount: 999,
            isHidden: false,
            explanation: 'Heavy parcel freight fee (14kg boxed weight).',
            sourceLabel: 'Amazon Heavy Shipping',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
            remotePincodeSurcharge: 450,
          },
          {
            id: 'az-esp-inst',
            label: 'Mandatory Technician Demo Fee',
            category: 'installation',
            amount: 1250,
            isHidden: true,
            explanation: 'Charged separately by seller partner to activate warranty.',
            sourceLabel: 'Seller Warranty Terms',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 4,
        deliveryNote: 'Scheduled heavy-cargo delivery',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: 'Today, 06:00 AM IST',
        trustScore: 76,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Buyer pays ₹799 return freight',
          returnShippingSignal: 'bad',
          refundMethod: 'Replacement Only',
          refundMethodSignal: 'bad',
          refundSpeed: '7–10 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Damaged Only',
          exchangeSignal: 'warn',
          conditions: 'Non-returnable once water tank is filled unless defective.',
          plainEnglishSummary: 'Lower sticker price hides ₹2,249 in heavy freight + demo fees and ₹799 return freight.',
          policyScore: 60,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Report Issue', duration: 'Day 0–7', detail: 'Upload unboxing video.' },
            { step: 'Heavy Pickup', duration: 'Day 3–5', detail: '₹799 return freight if non-defective.' },
            { step: 'Replacement', duration: 'Day 7–10', detail: 'Replacement unit delivered.' },
          ],
        },
      },
    ],
  },
  // =========================================================================
  // 7. NIKE AIR FORCE 1 '07 LOW (TRIPLE WHITE) — FOOTWEAR
  // =========================================================================
  {
    id: 'nike-air-force-1-white',
    slug: 'nike-air-force-1-07-triple-white',
    name: "Nike Air Force 1 '07 Low Leather Sneakers (Triple White)",
    shortName: "Nike Air Force 1 '07 White",
    brand: 'Nike',
    categoryId: 'footwear',
    categoryName: 'Sneakers & Footwear',
    subCategory: 'Lifestyle Sneakers',
    images: [STUDIO_IMAGES.sneakers],
    updatedAgo: '1H AGO',
    storesChecked: 4,
    feesChecked: 11,
    spotlightRank: 6,
    verdictQuote: 'Myntra beats Nike Direct by ₹1,830 once Nike’s ₹1,250 cross-border shipping charge is exposed.',
    verdictSummary:
      'Nike India Direct lists at MRP ₹7,495 but adds a ₹1,250 Singapore-dispatch shipping fee on orders under ₹14,000. Myntra’s small ₹20 platform fee plus HDFC card discount delivers the lowest true price with 14-day easy size exchange.',
    askQuestions: [
      'Why does Nike India Direct add ₹1,250 shipping on Air Force 1?',
      'Which Indian store has the easiest sneaker size exchange?',
      'Does Ajio deduct a fee if I return sneakers?',
    ],
    priceHistory: [
      { date: '18 Oct', lowestTruePrice: 7495, avgListedPrice: 7595, store: 'Myntra' },
      { date: '26 Oct', lowestTruePrice: 7120, avgListedPrice: 7495, store: 'Ajio' },
      { date: '04 Nov', lowestTruePrice: 6995, avgListedPrice: 7495, store: 'Myntra' },
      { date: '12 Nov', lowestTruePrice: 7195, avgListedPrice: 7495, store: 'Amazon India' },
      { date: 'Today', lowestTruePrice: 6915, avgListedPrice: 7495, store: 'Myntra' },
    ],
    specs: [
      { label: 'Upper Material', value: 'Full-grain stitched leather overlays' },
      { label: 'Cushioning', value: 'Encapsulated Nike Air unit midsole' },
      { label: 'Outsole', value: 'Non-marking pivot-circle rubber' },
      { label: 'Sizing Note', value: 'Runs slightly roomy (UK 6 to UK 12)' },
      { label: 'Origin / Authenticity', value: 'Verified Nike India retail box + QR tag' },
    ],
    inTheBox: ['Nike Air Force 1 ’07 Pair (Triple White)', 'Original Nike Box', 'Care & Authenticity Insert'],
    warrantyNote: '6-month manufacturing defect warranty via Nike India authorized sellers.',
    listings: [
      {
        storeId: 'myntra',
        storeName: 'Myntra',
        shortCode: 'MY',
        storeDomain: 'myntra.com',
        storeAccentBg: '#E11D48',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.myntra.com/nike-air-force-1',
        inStock: true,
        listedPrice: 7495,
        mrp: 7495,
        coupons: [{ code: 'SNEAK200', label: 'Myntra Footwear Coupon', amount: 200, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Instant Card Discount', amount: 400, emiProcessingFee: 199 },
          { bank: 'ICICI', label: 'ICICI Coral/Rubyx Offer', amount: 350, emiProcessingFee: 199 },
          { bank: 'UPI', label: 'Myntra UPI Cashback', amount: 100 },
        ],
        fees: [
          {
            id: 'my-platform',
            label: 'Platform Fee',
            category: 'platform',
            amount: 20,
            isHidden: true,
            explanation: 'Non-refundable Myntra platform fee added at final checkout bag.',
            sourceLabel: 'Myntra Checkout Bag',
            sourceUrl: 'https://www.myntra.com/faqs',
          },
          {
            id: 'my-cod',
            label: 'Pay on Delivery Convenience Fee',
            category: 'cod',
            amount: 49,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Myntra charges ₹49 extra when paying via Cash on Delivery.',
            sourceLabel: 'Myntra COD Policy',
            sourceUrl: 'https://www.myntra.com/faqs',
          },
          {
            id: 'my-del',
            label: 'Standard Delivery',
            category: 'delivery',
            amount: 0,
            remotePincodeSurcharge: 79,
            isHidden: false,
            explanation: 'Free delivery for metros above ₹1,199; remote pincodes may add ₹79.',
            sourceLabel: 'Myntra Shipping',
            sourceUrl: 'https://www.myntra.com/faqs',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Try & Buy eligible in select metros',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: '2026-11-21T09:05:00Z',
        trustScore: 91,
        returnPolicy: {
          policyFound: true,
          windowLabel: '14 Days',
          windowDays: 14,
          windowSignal: 'good',
          returnShippingLabel: 'Free doorstep pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment / Myntra Credit',
          refundMethodSignal: 'good',
          refundSpeed: '2–4 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0 (Platform fee ₹20 non-refundable)',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Free instant size exchange',
          exchangeSignal: 'good',
          conditions: 'Unworn outdoors, original box and tags intact.',
          plainEnglishSummary: 'Best overall value with hassle-free 14-day size exchange and fast refund.',
          policyScore: 92,
          sourceUrl: 'https://www.myntra.com/faqs',
          timeline: [
            { step: 'Request Return/Exchange', duration: 'Day 0–14', detail: 'One-tap size swap or refund in Myntra app.' },
            { step: 'Doorstep Pickup', duration: 'Day 1–2', detail: 'Courier verifies shoe sole & box tags at door.' },
            { step: 'Refund Credited', duration: 'Day 2–4', detail: 'Full shoe price credited back to bank/card.' },
          ],
        },
      },
      {
        storeId: 'ajio',
        storeName: 'Ajio',
        shortCode: 'AJ',
        storeDomain: 'ajio.com',
        storeAccentBg: '#2C4152',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.ajio.com/search/?text=nike%20air%20force%201',
        inStock: true,
        listedPrice: 7495,
        mrp: 7495,
        coupons: [{ code: 'TRENDS300', label: 'Ajio Sneaker Coupon', amount: 300, autoApplied: false }],
        bankOffers: [
          { bank: 'SBI', label: 'SBI Credit Card Offer', amount: 450, emiProcessingFee: 235 },
          { bank: 'AXIS', label: 'Axis Bank Instant Discount', amount: 300, emiProcessingFee: 235 },
        ],
        fees: [
          {
            id: 'aj-platform',
            label: 'Platform & Convenience Fee',
            category: 'platform',
            amount: 99,
            isHidden: true,
            explanation: 'Ajio adds a ₹99 non-refundable platform & convenience charge at checkout.',
            sourceLabel: 'Ajio Bag Summary',
            sourceUrl: 'https://www.ajio.com/help',
          },
          {
            id: 'aj-cod',
            label: 'COD Handling Fee',
            category: 'cod',
            amount: 49,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Extra ₹49 fee for Cash on Delivery orders.',
            sourceLabel: 'Ajio COD Terms',
            sourceUrl: 'https://www.ajio.com/help',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: 'Dispatched from Reliance Retail warehouse',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: '2026-11-21T08:15:00Z',
        trustScore: 81,
        returnPolicy: {
          policyFound: true,
          windowLabel: '10 Days',
          windowDays: 10,
          windowSignal: 'good',
          returnShippingLabel: 'Free pickup (₹99 platform fee retained)',
          returnShippingSignal: 'warn',
          refundMethod: 'Original Payment / Ajio Wallet',
          refundMethodSignal: 'good',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Size exchange if in stock',
          exchangeSignal: 'good',
          conditions: 'Original shoe box must be undamaged; ₹99 convenience fee is never refunded.',
          plainEnglishSummary: 'Strong SBI card discount, but ₹99 convenience fee is non-refundable even on returns.',
          policyScore: 80,
          sourceUrl: 'https://www.ajio.com/help',
          timeline: [
            { step: 'Initiate Return', duration: 'Day 0–10', detail: 'Raise return inside Ajio Orders.' },
            { step: 'Quality Pickup', duration: 'Day 2–3', detail: 'Courier checks box and sole condition.' },
            { step: 'Bank Refund', duration: 'Day 5–7', detail: 'Refund minus ₹99 convenience fee.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#232F3E',
        storeAccentText: '#FF9900',
        productUrl: 'https://www.amazon.in/s?k=nike+air+force+1+07+white',
        inStock: true,
        listedPrice: 7495,
        mrp: 7495,
        coupons: [],
        bankOffers: [
          { bank: 'ICICI', label: 'Amazon Pay ICICI 5% Back', amount: 375, emiProcessingFee: 199 },
          { bank: 'HDFC', label: 'HDFC Fashion Offer', amount: 250, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'az-af1-del',
            label: 'Prime Standard Delivery',
            category: 'delivery',
            amount: 0,
            remotePincodeSurcharge: 80,
            isHidden: false,
            explanation: 'Free delivery for metro hubs; ₹80 surcharge on remote pincodes.',
            sourceLabel: 'Amazon Shipping',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
          {
            id: 'az-af1-cod',
            label: 'Pay on Delivery Fee',
            category: 'cod',
            amount: 25,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Amazon charges a ₹25 Pay on Delivery fee on select footwear listings.',
            sourceLabel: 'Amazon POD Policy',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Fulfilled by Cocoblu Retail',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: '2026-11-21T09:10:00Z',
        trustScore: 88,
        returnPolicy: {
          policyFound: true,
          windowLabel: '10 Days',
          windowDays: 10,
          windowSignal: 'good',
          returnShippingLabel: 'Free doorstep pickup',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment / Amazon Pay',
          refundMethodSignal: 'good',
          refundSpeed: '2–3 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Free size replacement',
          exchangeSignal: 'good',
          conditions: 'Must be returned unused in original Nike box.',
          plainEnglishSummary: 'Clean ₹0 hidden fees and reliable 10-day free return/exchange.',
          policyScore: 90,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Return Request', duration: 'Day 0–10', detail: 'Select size mismatch or refund.' },
            { step: 'Pickup', duration: 'Day 1', detail: 'Next-day courier pickup in metros.' },
            { step: 'Refund', duration: 'Day 2–3', detail: 'Instant to Amazon Pay or 3 days to bank.' },
          ],
        },
      },
      {
        storeId: 'nike',
        storeName: 'Nike India Direct',
        shortCode: 'NK',
        storeDomain: 'nike.com/in',
        storeAccentBg: '#111111',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.nike.com/in/w?q=air%20force%201%2007',
        inStock: true,
        listedPrice: 7495,
        mrp: 7495,
        coupons: [],
        bankOffers: [],
        fees: [
          {
            id: 'nk-ship',
            label: 'Cross-Border Standard Delivery Fee',
            category: 'delivery',
            amount: 1250,
            isHidden: true,
            explanation: 'Nike.com/in ships from Singapore and charges ₹1,250 delivery on all orders below ₹14,000, plus KYC upload.',
            sourceLabel: 'Nike India Shipping Policy',
            sourceUrl: 'https://www.nike.com/in/help/a/shipping-delivery-gs',
          },
        ],
        baseDeliveryDays: 7,
        deliveryNote: 'Dispatched internationally; KYC required for customs',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: '2026-11-21T07:30:00Z',
        trustScore: 76,
        returnPolicy: {
          policyFound: true,
          windowLabel: '30 Days',
          windowDays: 30,
          windowSignal: 'good',
          returnShippingLabel: 'Free return pickup (₹1,250 outward ship non-refundable)',
          returnShippingSignal: 'warn',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '7–10 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0 (₹1,250 delivery lost)',
          restockingFeePercent: 0,
          restockingSignal: 'warn',
          exchangeAllowed: 'Return & Re-order Only',
          exchangeSignal: 'warn',
          conditions: '30-day wear test allowed, but initial ₹1,250 shipping fee is not refunded.',
          plainEnglishSummary: 'Best 30-day return window, but ₹1,250 shipping fee makes single-pair orders much pricier.',
          policyScore: 78,
          sourceUrl: 'https://www.nike.com/in/help/a/returns-policy-gs',
          timeline: [
            { step: 'KYC & Delivery', duration: 'Day 5–7', detail: 'Aramex customs KYC required before delivery.' },
            { step: '30-Day Trial', duration: 'Day 0–30', detail: 'Generous 30-day Nike return window.' },
            { step: 'Refund', duration: 'Day 7–10', detail: 'Product cost refunded; ₹1,250 shipping not returned.' },
          ],
        },
      },
    ],
  },
  // =========================================================================
  // 8. WAKEFIT ORTHOPEDIC MEMORY FOAM MATTRESS (QUEEN) — HOME & FURNITURE
  // =========================================================================
  {
    id: 'wakefit-orthopedic-mattress',
    slug: 'wakefit-orthopedic-memory-foam-queen-8inch',
    name: 'Wakefit Orthopedic Memory Foam Mattress (Queen · 78×60×8 inch)',
    shortName: 'Wakefit Ortho Mattress (Queen)',
    brand: 'Wakefit',
    categoryId: 'furniture',
    categoryName: 'Home & Mattresses',
    subCategory: 'Orthopedic Mattresses',
    images: [STUDIO_IMAGES.mattress],
    updatedAgo: '45M AGO',
    storesChecked: 4,
    feesChecked: 12,
    spotlightRank: 7,
    verdictQuote: 'Wakefit Direct costs ₹1,548 less than Pepperfry AND is the only store giving a 100-Night Free Home Trial.',
    verdictSummary:
      'Marketplace mattress listings look similar on sticker price, but Pepperfry and Flipkart add ₹699–₹999 heavy-item/floor delivery charges and block returns once the vacuum-rolled plastic is opened. Wakefit Direct charges ₹0 fees and lets you sleep on it for 100 nights.',
    askQuestions: [
      'Do I still get the 100-night Wakefit trial if I buy from Amazon or Flipkart?',
      'Which store charges extra for heavy mattress floor delivery?',
      'What happens if the mattress size does not fit my bed frame?',
    ],
    priceHistory: [
      { date: '18 Oct', lowestTruePrice: 13498, avgListedPrice: 14199, store: 'Wakefit Direct' },
      { date: '26 Oct', lowestTruePrice: 12799, avgListedPrice: 13899, store: 'Wakefit Direct' },
      { date: '04 Nov', lowestTruePrice: 13199, avgListedPrice: 13999, store: 'Amazon India' },
      { date: '12 Nov', lowestTruePrice: 12998, avgListedPrice: 13899, store: 'Wakefit Direct' },
      { date: 'Today', lowestTruePrice: 12448, avgListedPrice: 13799, store: 'Wakefit Direct' },
    ],
    specs: [
      { label: 'Dimensions', value: 'Queen Size — 78 × 60 × 8 inches (20 cm)' },
      { label: 'Foam Architecture', value: 'Next-gen memory foam + 7-zone support base' },
      { label: 'Firmness', value: 'Medium-Firm (Orthopedic Spine Alignment)' },
      { label: 'Outer Cover', value: 'Removable & washable breathable AeroTex fabric' },
      { label: 'Warranty', value: '10-Year Manufacturer Warranty (Sagging > 1.5 in)' },
    ],
    inTheBox: ['Vacuum-Rolled Queen Mattress', 'Zippered Breathable Cover (Pre-fitted)', '10-Year Warranty Card'],
    warrantyNote: '10-year manufacturer warranty directly registered with Wakefit India.',
    listings: [
      {
        storeId: 'wakefit',
        storeName: 'Wakefit Direct',
        shortCode: 'WF',
        storeDomain: 'wakefit.co',
        storeAccentBg: '#4C1D95',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.wakefit.co/mattress/orthopaedic-memory-foam-mattress',
        inStock: true,
        listedPrice: 13498,
        mrp: 19998,
        coupons: [{ code: 'SLEEP550', label: 'Wakefit Direct Instant Coupon', amount: 550, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Card Instant Savings', amount: 500, emiProcessingFee: 199 },
          { bank: 'ICICI', label: 'ICICI Card Discount', amount: 500, emiProcessingFee: 199 },
          { bank: 'UPI', label: 'Prepaid UPI Instant Off', amount: 300 },
        ],
        fees: [
          {
            id: 'wf-del',
            label: 'Free Doorstep Delivery (All Floors)',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Zero delivery or floor-carrying charges across serviceable pincodes.',
            sourceLabel: 'Wakefit Delivery Policy',
            sourceUrl: 'https://www.wakefit.co/shipping-policy',
          },
          {
            id: 'wf-cod',
            label: 'Cash on Delivery Fee',
            category: 'cod',
            amount: 199,
            isHidden: true,
            conditionalOnCod: true,
            explanation: '₹199 COD verification surcharge on bulky furniture orders.',
            sourceLabel: 'Wakefit Payment Terms',
            sourceUrl: 'https://www.wakefit.co/terms-and-conditions',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: 'Factory-direct compressed roll box',
        verifiedAgo: '45M AGO',
        verifiedTimestamp: '2026-11-21T09:20:00Z',
        trustScore: 96,
        returnPolicy: {
          policyFound: true,
          windowLabel: '100-Night Trial',
          windowDays: 100,
          windowSignal: 'good',
          returnShippingLabel: 'Free doorstep pickup',
          returnShippingSignal: 'good',
          refundMethod: '100% Original Payment Refund',
          refundMethodSignal: 'good',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Free size/firmness swap',
          exchangeSignal: 'good',
          conditions: 'Full 100-night home sleep trial on standard sizes without stains or cuts.',
          plainEnglishSummary: 'Unmatched 100-night home trial with ₹0 hidden fees and full bank refund.',
          policyScore: 98,
          sourceUrl: 'https://www.wakefit.co/return-policy',
          timeline: [
            { step: 'Sleep Trial', duration: 'Day 1–100', detail: 'Use the mattress at home for up to 100 nights.' },
            { step: 'Free Pickup', duration: 'Day 3–5', detail: 'Wakefit logistics collects unwrapped mattress.' },
            { step: '100% Refund', duration: 'Day 5–7', detail: 'Full rupee amount refunded to source account.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#232F3E',
        storeAccentText: '#FF9900',
        productUrl: 'https://www.amazon.in/s?k=wakefit+orthopedic+memory+foam+mattress+queen+8+inch',
        inStock: true,
        listedPrice: 13698,
        mrp: 19998,
        coupons: [{ code: 'CLIP300', label: 'Amazon Page Coupon', amount: 300, autoApplied: true }],
        bankOffers: [
          { bank: 'ICICI', label: 'Amazon Pay ICICI 5% Back', amount: 670, emiProcessingFee: 235 },
          { bank: 'SBI', label: 'SBI Card Home Offer', amount: 600, emiProcessingFee: 235 },
        ],
        fees: [
          {
            id: 'az-wf-del',
            label: 'Heavy & Bulky Scheduled Delivery',
            category: 'delivery',
            amount: 0,
            remotePincodeSurcharge: 399,
            isHidden: false,
            explanation: 'Free in metros; ₹399 remote bulky-goods surcharge in non-metro zones.',
            sourceLabel: 'Amazon Heavy Shipping',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
          {
            id: 'az-wf-cod',
            label: 'Bulky COD Handling Fee',
            category: 'cod',
            amount: 99,
            isHidden: true,
            conditionalOnCod: true,
            explanation: '₹99 surcharge when choosing Cash on Delivery for heavy furniture.',
            sourceLabel: 'Amazon POD Terms',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: 'Sold by Wakefit Innovations via Amazon',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: '2026-11-21T09:00:00Z',
        trustScore: 84,
        returnPolicy: {
          policyFound: true,
          windowLabel: '10 Days (Replacement)',
          windowDays: 10,
          windowSignal: 'warn',
          returnShippingLabel: 'Free pickup for defects',
          returnShippingSignal: 'good',
          refundMethod: 'Replacement Only (100-Night via Brand)',
          refundMethodSignal: 'warn',
          refundSpeed: '7 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Defective / wrong size only',
          exchangeSignal: 'warn',
          conditions: 'Amazon only handles 10-day damage/wrong-size replacement; comfort returns require separate Wakefit claim.',
          plainEnglishSummary: 'Strong ICICI cashback, but return handling is split between Amazon and Wakefit.',
          policyScore: 76,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Inspect Delivery', duration: 'Day 0–10', detail: 'Verify size before cutting vacuum wrap.' },
            { step: 'Replacement Pickup', duration: 'Day 3–5', detail: 'Amazon bulky courier collects.' },
            { step: 'Resolution', duration: 'Day 7', detail: 'Replacement dispatched.' },
          ],
        },
      },
      {
        storeId: 'flipkart',
        storeName: 'Flipkart',
        shortCode: 'FK',
        storeDomain: 'flipkart.com',
        storeAccentBg: '#2874F0',
        storeAccentText: '#FFE500',
        productUrl: 'https://www.flipkart.com/search?q=wakefit+orthopedic+memory+foam+mattress+queen',
        inStock: true,
        listedPrice: 13299,
        mrp: 19998,
        coupons: [],
        bankOffers: [
          { bank: 'AXIS', label: 'Flipkart Axis 5% Cashback', amount: 665, emiProcessingFee: 235 },
          { bank: 'HDFC', label: 'HDFC Home Offer', amount: 400, emiProcessingFee: 235 },
        ],
        fees: [
          {
            id: 'fk-wf-pkg',
            label: 'Heavy Furniture Handling & Packaging Fee',
            category: 'packaging',
            amount: 299,
            isHidden: true,
            explanation: 'Mandatory bulky-item handling charge added at Flipkart payment screen.',
            sourceLabel: 'Flipkart Furniture Checkout',
            sourceUrl: 'https://www.flipkart.com/pages/shipping',
          },
          {
            id: 'fk-wf-plat',
            label: 'Protect Promise & Platform Fee',
            category: 'platform',
            amount: 99,
            isHidden: true,
            explanation: 'Non-refundable platform protection fee.',
            sourceLabel: 'Flipkart Checkout',
            sourceUrl: 'https://www.flipkart.com/pages/terms',
          },
          {
            id: 'fk-wf-cod',
            label: 'Pay on Delivery Charge',
            category: 'cod',
            amount: 99,
            isHidden: true,
            conditionalOnCod: true,
            explanation: 'Extra COD charge on large items.',
            sourceLabel: 'Flipkart COD Policy',
            sourceUrl: 'https://www.flipkart.com/pages/paymentsecurity',
          },
        ],
        baseDeliveryDays: 4,
        deliveryNote: 'Lower sticker, ₹398 checkout fees added',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: '2026-11-21T08:10:00Z',
        trustScore: 73,
        returnPolicy: {
          policyFound: true,
          windowLabel: '10 Days (Defective Only)',
          windowDays: 10,
          windowSignal: 'bad',
          returnShippingLabel: 'Free pickup for transit damage',
          returnShippingSignal: 'warn',
          refundMethod: 'Replacement Only',
          refundMethodSignal: 'bad',
          refundSpeed: '7–10 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Damaged / Wrong Size Only',
          exchangeSignal: 'bad',
          conditions: 'Non-returnable for comfort preference once vacuum seal is unboxed.',
          plainEnglishSummary: 'Lowest sticker price is a trap: ₹398 extra fees and no comfort-trial refund.',
          policyScore: 62,
          sourceUrl: 'https://www.flipkart.com/pages/returnpolicy',
          timeline: [
            { step: 'Open-Box Check', duration: 'Day 0', detail: 'Check dimensions on label before unrolling.' },
            { step: 'Claim Review', duration: 'Day 1–3', detail: 'Photo evidence needed for defects.' },
            { step: 'Replacement', duration: 'Day 7–10', detail: 'Replacement only, no comfort refund.' },
          ],
        },
      },
      {
        storeId: 'pepperfry',
        storeName: 'Pepperfry',
        shortCode: 'PF',
        storeDomain: 'pepperfry.com',
        storeAccentBg: '#F16521',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.pepperfry.com/site_product/search?q=wakefit+orthopedic+mattress',
        inStock: true,
        listedPrice: 13799,
        mrp: 19998,
        coupons: [{ code: 'PF500', label: 'Pepperfry First-Home Coupon', amount: 500, autoApplied: false }],
        bankOffers: [{ bank: 'HDFC', label: 'HDFC Furniture Offer', amount: 300, emiProcessingFee: 299 }],
        fees: [
          {
            id: 'pf-ship',
            label: 'Heavy Freight & Floor Carry Charge',
            category: 'delivery',
            amount: 799,
            remotePincodeSurcharge: 300,
            isHidden: true,
            explanation: 'Pepperfry adds ₹799 shipping + floor-carry fee on bulky mattresses during checkout.',
            sourceLabel: 'Pepperfry Shipping Policy',
            sourceUrl: 'https://www.pepperfry.com/shipping-policy.html',
          },
          {
            id: 'pf-handle',
            label: 'Order Handling Charge',
            category: 'handling',
            amount: 199,
            isHidden: true,
            explanation: 'Non-refundable furniture warehouse handling fee.',
            sourceLabel: 'Pepperfry Cart',
            sourceUrl: 'https://www.pepperfry.com/terms-of-use.html',
          },
        ],
        baseDeliveryDays: 5,
        deliveryNote: '₹998 hidden freight + handling fees',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: '2026-11-21T07:20:00Z',
        trustScore: 67,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days (Transit Damage)',
          windowDays: 7,
          windowSignal: 'bad',
          returnShippingLabel: 'Buyer pays reverse freight if non-defective',
          returnShippingSignal: 'bad',
          refundMethod: 'Pepperfry Credits / Replacement',
          refundMethodSignal: 'bad',
          refundSpeed: '10–14 business days',
          refundSpeedSignal: 'bad',
          restockingFeeLabel: '10% Cancellation After Dispatch',
          restockingFeePercent: 10,
          restockingSignal: 'bad',
          exchangeAllowed: 'Damaged in Transit Only',
          exchangeSignal: 'bad',
          conditions: 'No comfort return; post-dispatch cancellation deducts 10% + freight.',
          plainEnglishSummary: 'Highest hidden freight charges (₹998) and strict no-trial return policy.',
          policyScore: 52,
          sourceUrl: 'https://www.pepperfry.com/return-policy.html',
          timeline: [
            { step: 'Delivery Check', duration: 'Day 0', detail: 'Report transit damage within 48 hours.' },
            { step: 'Inspection', duration: 'Day 3–5', detail: 'Support verifies photos.' },
            { step: 'Credit/Swap', duration: 'Day 10–14', detail: 'Store credit or replacement.' },
          ],
        },
      },
    ],
  },
  // =========================================================================
  // 9. FOREST ESSENTIALS SOUNDARYA RADIANCE CREAM — BEAUTY & SKINCARE
  // =========================================================================
  {
    id: 'forest-essentials-soundarya-cream',
    slug: 'forest-essentials-soundarya-radiance-cream-50g',
    name: 'Forest Essentials Soundarya Radiance Cream with 24K Gold & SPF 25 (50g)',
    shortName: 'Forest Essentials Soundarya 50g',
    brand: 'Forest Essentials',
    categoryId: 'beauty',
    categoryName: 'Beauty & Skincare',
    subCategory: 'Luxury Skincare',
    images: [STUDIO_IMAGES.skincare],
    updatedAgo: '1H AGO',
    storesChecked: 4,
    feesChecked: 10,
    verdictQuote: 'Every store lists MRP ₹5,950—Tata CLiQ saves ₹645 via bank offers, while opened skincare jars are non-returnable everywhere.',
    verdictSummary:
      'Luxury skincare in India is strictly MRP-locked at ₹5,950 across Nykaa, Tata CLiQ, Myntra, and Amazon. Real savings come from bank card offers and avoiding platform/COD surcharges—and buyers must know that skincare is non-returnable once the hygiene seal breaks.',
    askQuestions: [
      'Can I return a luxury skincare cream if it does not suit my skin?',
      'Which Indian beauty store gives the lowest true price on Forest Essentials?',
      'Does Nykaa charge extra platform or COD fees?',
    ],
    priceHistory: [
      { date: '18 Oct', lowestTruePrice: 5650, avgListedPrice: 5950, store: 'Nykaa' },
      { date: '26 Oct', lowestTruePrice: 5395, avgListedPrice: 5950, store: 'Tata CLiQ' },
      { date: '04 Nov', lowestTruePrice: 5500, avgListedPrice: 5950, store: 'Myntra' },
      { date: '12 Nov', lowestTruePrice: 5450, avgListedPrice: 5950, store: 'Tata CLiQ' },
      { date: 'Today', lowestTruePrice: 5305, avgListedPrice: 5950, store: 'Tata CLiQ' },
    ],
    specs: [
      { label: 'Net Quantity', value: '50 g Heavy Glass Jar' },
      { label: 'Key Ingredients', value: '24K Gold Bhasma, Kashmiri Saffron, Pure Cow’s Ghee' },
      { label: 'Sun Protection', value: 'Natural SPF 25 Mineral Shield' },
      { label: 'Shelf Life', value: '24 Months from Manufacturing' },
      { label: 'Hygiene Return Rule', value: 'Non-returnable once outer seal is opened' },
    ],
    inTheBox: ['50g Soundarya Radiance Glass Jar', 'Golden Spatula Applicator', 'Tamper-Evident Outer Box'],
    warrantyNote: 'Batch-verified authentic Ayurvedic formulation; inspect expiry date on delivery.',
    listings: [
      {
        storeId: 'tatacliq',
        storeName: 'Tata CLiQ',
        shortCode: 'TC',
        storeDomain: 'tatacliq.com',
        storeAccentBg: '#9B1D64',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.tatacliq.com/search/?text=forest+essentials+soundarya+radiance+cream',
        inStock: true,
        listedPrice: 5950,
        mrp: 5950,
        coupons: [{ code: 'LUXE250', label: 'Tata CLiQ Beauty Coupon', amount: 250, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Luxury Instant Off', amount: 450, emiProcessingFee: 199 },
          { bank: 'ICICI', label: 'ICICI Beauty Offer', amount: 400, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'tc-fe-handle',
            label: 'Fragile Glass Handling Fee',
            category: 'packaging',
            amount: 55,
            isHidden: true,
            explanation: 'Cushioned glass-jar dispatch fee added at checkout.',
            sourceLabel: 'Tata CLiQ Bag',
            sourceUrl: 'https://www.tatacliq.com/faq',
          },
          {
            id: 'tc-fe-cod',
            label: 'COD Collection Fee',
            category: 'cod',
            amount: 49,
            isHidden: true,
            conditionalOnCod: true,
            explanation: '₹49 Cash on Delivery surcharge.',
            sourceLabel: 'Tata CLiQ COD',
            sourceUrl: 'https://www.tatacliq.com/faq',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Authorized Forest Essentials brand stock',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: '2026-11-21T09:05:00Z',
        trustScore: 86,
        returnPolicy: {
          policyFound: true,
          windowLabel: '7 Days (Sealed/Damaged)',
          windowDays: 7,
          windowSignal: 'warn',
          returnShippingLabel: 'Free pickup for damaged/expired jar',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment Method',
          refundMethodSignal: 'good',
          refundSpeed: '4–6 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Damaged / Leak / Wrong Item Only',
          exchangeSignal: 'warn',
          conditions: 'Non-returnable for skin reaction or once hygiene seal is broken.',
          plainEnglishSummary: 'Lowest net payable price with HDFC/ICICI cards; standard sealed-only beauty return rule.',
          policyScore: 76,
          sourceUrl: 'https://www.tatacliq.com/return-policy',
          timeline: [
            { step: 'Check Seal & Expiry', duration: 'Day 0–7', detail: 'Inspect glass jar & batch date before breaking seal.' },
            { step: 'Photo Verification', duration: 'Day 1–2', detail: 'Upload jar photos if damaged/leaking.' },
            { step: 'Bank Refund', duration: 'Day 4–6', detail: 'Full refund once verified.' },
          ],
        },
      },
      {
        storeId: 'nykaa',
        storeName: 'Nykaa',
        shortCode: 'NY',
        storeDomain: 'nykaa.com',
        storeAccentBg: '#FC2779',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.nykaa.com/search/result/?q=forest+essentials+soundarya+radiance+cream',
        inStock: true,
        listedPrice: 5950,
        mrp: 5950,
        coupons: [{ code: 'NYKLUXE', label: 'Nykaa Luxe Bag Discount', amount: 200, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Nykaa Instant Discount', amount: 300, emiProcessingFee: 199 },
          { bank: 'SBI', label: 'SBI Beauty Card Offer', amount: 350, emiProcessingFee: 199 },
        ],
        fees: [
          {
            id: 'ny-plat',
            label: 'Platform & Packaging Fee',
            category: 'platform',
            amount: 29,
            isHidden: true,
            explanation: 'Non-refundable Nykaa platform fee shown in bag summary.',
            sourceLabel: 'Nykaa Checkout Bag',
            sourceUrl: 'https://www.nykaa.com/shipping-policy',
          },
          {
            id: 'ny-cod',
            label: 'Cash on Delivery Fee',
            category: 'cod',
            amount: 49,
            isHidden: true,
            conditionalOnCod: true,
            explanation: '₹49 COD handling fee.',
            sourceLabel: 'Nykaa COD Terms',
            sourceUrl: 'https://www.nykaa.com/shipping-policy',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Includes 2 mini Forest Essentials samples',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: '2026-11-21T09:10:00Z',
        trustScore: 84,
        returnPolicy: {
          policyFound: true,
          windowLabel: '15 Days (Unopened Only)',
          windowDays: 15,
          windowSignal: 'good',
          returnShippingLabel: 'Free pickup for unopened/damaged',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment / Nykaa Wallet',
          refundMethodSignal: 'good',
          refundSpeed: '3–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Damaged / Wrong Product Only',
          exchangeSignal: 'warn',
          conditions: 'Strict hygiene rule: opened or used jars are strictly non-returnable.',
          plainEnglishSummary: 'Longest 15-day unopened window and reliable authenticity, slightly higher net total than Tata CLiQ.',
          policyScore: 80,
          sourceUrl: 'https://www.nykaa.com/cancellation-policy',
          timeline: [
            { step: 'Raise Return', duration: 'Day 0–15', detail: 'Must remain sealed in original tamper box.' },
            { step: 'Pickup', duration: 'Day 2', detail: 'Nykaa courier verifies seal.' },
            { step: 'Refund', duration: 'Day 3–5', detail: 'Credited to original payment source.' },
          ],
        },
      },
      {
        storeId: 'myntra',
        storeName: 'Myntra',
        shortCode: 'MY',
        storeDomain: 'myntra.com',
        storeAccentBg: '#E11D48',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.myntra.com/forest-essentials-soundarya-radiance-cream',
        inStock: true,
        listedPrice: 5950,
        mrp: 5950,
        coupons: [{ code: 'BEAUTY150', label: 'Myntra Beauty Coupon', amount: 150, autoApplied: false }],
        bankOffers: [{ bank: 'AXIS', label: 'Axis Bank Beauty Offer', amount: 300 }],
        fees: [
          {
            id: 'my-fe-plat',
            label: 'Platform Fee',
            category: 'platform',
            amount: 20,
            isHidden: true,
            explanation: 'Standard ₹20 Myntra checkout platform fee.',
            sourceLabel: 'Myntra Checkout',
            sourceUrl: 'https://www.myntra.com/faqs',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Fast 2-day metro delivery',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: '2026-11-21T08:00:00Z',
        trustScore: 81,
        returnPolicy: {
          policyFound: true,
          windowLabel: 'Non-Returnable (Hygiene)',
          windowDays: 0,
          windowSignal: 'bad',
          returnShippingLabel: 'Damaged/Expired Claim Only (48h)',
          returnShippingSignal: 'bad',
          refundMethod: 'Refund only if broken/expired on arrival',
          refundMethodSignal: 'bad',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: 'N/A',
          restockingFeePercent: 0,
          restockingSignal: 'warn',
          exchangeAllowed: 'Not Allowed',
          exchangeSignal: 'bad',
          conditions: 'Marked non-returnable on Myntra Beauty; only broken-in-transit claims accepted within 48 hours.',
          plainEnglishSummary: 'Marked strictly non-returnable—only buy if you are 100% sure of the shade/formula.',
          policyScore: 58,
          sourceUrl: 'https://www.myntra.com/faqs',
          timeline: [
            { step: 'Unboxing Video', duration: 'Within 48h', detail: 'Record video in case glass jar broke in transit.' },
            { step: 'Escalation', duration: 'Day 2–4', detail: 'Support reviews damage proof.' },
            { step: 'Refund', duration: 'Day 5–7', detail: 'Refund only for transit damage.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#232F3E',
        storeAccentText: '#FF9900',
        productUrl: 'https://www.amazon.in/s?k=forest+essentials+soundarya+radiance+cream+50g',
        inStock: true,
        listedPrice: 5950,
        mrp: 5950,
        coupons: [],
        bankOffers: [{ bank: 'ICICI', label: 'Amazon Pay ICICI 5% Back', amount: 298 }],
        fees: [
          {
            id: 'az-fe-del',
            label: 'Prime Delivery',
            category: 'delivery',
            amount: 0,
            isHidden: false,
            explanation: 'Free delivery for metro pincodes.',
            sourceLabel: 'Amazon Shipping',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 1,
        deliveryNote: 'Next-day metro delivery via RK World Infocom',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: '2026-11-21T09:15:00Z',
        trustScore: 82,
        returnPolicy: {
          policyFound: true,
          windowLabel: 'Non-Returnable (Beauty)',
          windowDays: 0,
          windowSignal: 'bad',
          returnShippingLabel: 'Replacement/Refund if damaged',
          returnShippingSignal: 'warn',
          refundMethod: 'Damaged/Expired Claim Only',
          refundMethodSignal: 'warn',
          refundSpeed: '3–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Damaged / Wrong Item Only',
          exchangeSignal: 'warn',
          conditions: 'Non-returnable personal care category; refund applies only if damaged or expired.',
          plainEnglishSummary: 'Fastest 1-day delivery with ₹0 fees, but non-returnable after purchase unless damaged.',
          policyScore: 66,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Check Batch', duration: 'Day 0', detail: 'Verify authenticity hologram & expiry.' },
            { step: 'Damage Claim', duration: 'Day 0–7', detail: 'Contact Amazon support if leaked/broken.' },
            { step: 'Refund', duration: 'Day 3–5', detail: 'Issued to original method.' },
          ],
        },
      },
    ],
  },
  // =========================================================================
  // 10. OPTIMUM NUTRITION GOLD STANDARD 100% WHEY (2.27 KG) — FITNESS
  // =========================================================================
  {
    id: 'on-gold-standard-whey-5lb',
    slug: 'optimum-nutrition-gold-standard-whey-2-27kg',
    name: 'Optimum Nutrition (ON) Gold Standard 100% Whey Protein (2.27 kg / 5 lbs)',
    shortName: 'ON Gold Standard Whey 2.27 kg',
    brand: 'Optimum Nutrition',
    categoryId: 'fitness',
    categoryName: 'Fitness & Nutrition',
    subCategory: 'Whey Protein',
    images: [STUDIO_IMAGES.fitness],
    updatedAgo: '35M AGO',
    storesChecked: 4,
    feesChecked: 11,
    verdictQuote: 'HealthKart beats JioMart by ₹1,039—and includes an authorized Glanbia seal authenticity guarantee.',
    verdictSummary:
      'Whey protein prices swing wildly across Indian platforms, and supplements are strictly non-returnable once opened. HealthKart combines authorized importer stock with low fees and automatic prepaid discounts, whereas Flipkart adds secured packaging & platform charges.',
    askQuestions: [
      'Which Indian store is safest and cheapest for authentic ON Whey Protein?',
      'Can I return whey protein if I do not like the flavour?',
      'What hidden fees does Flipkart add on 5lb protein tubs?',
    ],
    priceHistory: [
      { date: '18 Oct', lowestTruePrice: 7099, avgListedPrice: 7499, store: 'HealthKart' },
      { date: '26 Oct', lowestTruePrice: 6799, avgListedPrice: 7399, store: 'HealthKart' },
      { date: '04 Nov', lowestTruePrice: 6999, avgListedPrice: 7449, store: 'Amazon India' },
      { date: '12 Nov', lowestTruePrice: 6899, avgListedPrice: 7399, store: 'HealthKart' },
      { date: 'Today', lowestTruePrice: 6678, avgListedPrice: 7349, store: 'HealthKart' },
    ],
    specs: [
      { label: 'Net Weight', value: '2.27 kg (5 lbs) · 73 Servings' },
      { label: 'Protein per Scoop', value: '24 g Whey Protein Isolate + Concentrate' },
      { label: 'BCAAs & Glutamine', value: '5.5 g BCAAs + 4 g Glutamine per serving' },
      { label: 'Flavour Audited', value: 'Double Rich Chocolate' },
      { label: 'Verification', value: 'ON India Hologram Scratch Code (AuthenticateOn.in)' },
    ],
    inTheBox: ['2.27 kg Sealed Tub (Double Rich Chocolate)', '30.4g Measuring Scoop Inside', 'Glanbia India Authenticity Seal'],
    warrantyNote: 'Consumable nutrition product; always verify scratch code on AuthenticateOn.in before breaking inner seal.',
    listings: [
      {
        storeId: 'healthkart',
        storeName: 'HealthKart',
        shortCode: 'HK',
        storeDomain: 'healthkart.com',
        storeAccentBg: '#00B5B7',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.healthkart.com/search?txtQ=optimum+nutrition+gold+standard+whey+5+lb',
        inStock: true,
        listedPrice: 7199,
        mrp: 8699,
        coupons: [{ code: 'HKWHEY250', label: 'HealthKart Whey Coupon', amount: 250, autoApplied: true }],
        bankOffers: [
          { bank: 'HDFC', label: 'HDFC Fitness Instant Off', amount: 300, emiProcessingFee: 199 },
          { bank: 'UPI', label: 'Prepaid UPI Instant Savings', amount: 150 },
        ],
        fees: [
          {
            id: 'hk-plat',
            label: 'Handling & Tamper-Proof Packing',
            category: 'packaging',
            amount: 29,
            isHidden: true,
            explanation: 'Tamper-evident wrap charge added in HealthKart cart.',
            sourceLabel: 'HealthKart Cart',
            sourceUrl: 'https://www.healthkart.com/shipping-policy',
          },
          {
            id: 'hk-cod',
            label: 'COD Verification Fee',
            category: 'cod',
            amount: 59,
            isHidden: true,
            conditionalOnCod: true,
            explanation: '₹59 extra charge for Cash on Delivery.',
            sourceLabel: 'HealthKart COD',
            sourceUrl: 'https://www.healthkart.com/shipping-policy',
          },
        ],
        baseDeliveryDays: 2,
        deliveryNote: 'Direct authorized ON India importer stock',
        verifiedAgo: '35M AGO',
        verifiedTimestamp: '2026-11-21T09:30:00Z',
        trustScore: 91,
        returnPolicy: {
          policyFound: true,
          windowLabel: '14 Days (Unopened)',
          windowDays: 14,
          windowSignal: 'good',
          returnShippingLabel: 'Free pickup for unopened / failed auth check',
          returnShippingSignal: 'good',
          refundMethod: 'Original Payment / HK Cash',
          refundMethodSignal: 'good',
          refundSpeed: '3–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Unopened Seal / Damaged Tub',
          exchangeSignal: 'good',
          conditions: 'Returnable within 14 days ONLY if outer neck seal is completely unbroken.',
          plainEnglishSummary: 'Lowest true price with authorized ON authenticity guarantee and 14-day unopened return.',
          policyScore: 86,
          sourceUrl: 'https://www.healthkart.com/return-policy',
          timeline: [
            { step: 'Verify Hologram', duration: 'Day 0', detail: 'Check ON scratch code BEFORE opening seal.' },
            { step: 'Free Pickup', duration: 'Day 1–2', detail: 'Unopened tub picked up from doorstep.' },
            { step: 'Refund', duration: 'Day 3–5', detail: 'Full rupee refund to original payment mode.' },
          ],
        },
      },
      {
        storeId: 'amazon',
        storeName: 'Amazon India',
        shortCode: 'AZ',
        storeDomain: 'amazon.in',
        storeAccentBg: '#232F3E',
        storeAccentText: '#FF9900',
        productUrl: 'https://www.amazon.in/s?k=optimum+nutrition+gold+standard+whey+2.27kg',
        inStock: true,
        listedPrice: 7299,
        mrp: 8699,
        coupons: [{ code: 'FIT100', label: 'Amazon Subscribe/Clip Coupon', amount: 100, autoApplied: true }],
        bankOffers: [
          { bank: 'ICICI', label: 'Amazon Pay ICICI 5% Back', amount: 360, emiProcessingFee: 199 },
          { bank: 'HDFC', label: 'HDFC Health Offer', amount: 200 },
        ],
        fees: [
          {
            id: 'az-on-del',
            label: 'Prime Delivery',
            category: 'delivery',
            amount: 0,
            remotePincodeSurcharge: 80,
            isHidden: false,
            explanation: 'Free Prime metro shipping; ₹80 on remote pincodes.',
            sourceLabel: 'Amazon Shipping',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
          {
            id: 'az-on-cod',
            label: 'Pay on Delivery Fee',
            category: 'cod',
            amount: 29,
            isHidden: true,
            conditionalOnCod: true,
            explanation: '₹29 POD fee on supplements.',
            sourceLabel: 'Amazon POD',
            sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          },
        ],
        baseDeliveryDays: 1,
        deliveryNote: 'Seller: RK World Infocom (Authorized)',
        verifiedAgo: '1H AGO',
        verifiedTimestamp: '2026-11-21T09:00:00Z',
        trustScore: 84,
        returnPolicy: {
          policyFound: true,
          windowLabel: 'Non-Returnable (Consumable)',
          windowDays: 0,
          windowSignal: 'bad',
          returnShippingLabel: 'Refund via support if damaged/unverified',
          returnShippingSignal: 'warn',
          refundMethod: 'Damaged / Fake-Code Escalation Only',
          refundMethodSignal: 'warn',
          refundSpeed: '3–5 business days',
          refundSpeedSignal: 'good',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Not Allowed (Consumable)',
          exchangeSignal: 'bad',
          conditions: 'Consumables are marked non-returnable; customer support refunds only for broken seal or transit damage.',
          plainEnglishSummary: 'Fastest 1-day Prime delivery and zero checkout fees, but non-returnable once delivered.',
          policyScore: 68,
          sourceUrl: 'https://www.amazon.in/gp/help/customer/display.html',
          timeline: [
            { step: 'Inspect Seal', duration: 'Day 0', detail: 'Check neck seal and scratch code immediately.' },
            { step: 'Support Claim', duration: 'Day 0–7', detail: 'Chat with support if seal arrived broken.' },
            { step: 'Refund', duration: 'Day 3–5', detail: 'Refund credited without pickup.' },
          ],
        },
      },
      {
        storeId: 'flipkart',
        storeName: 'Flipkart',
        shortCode: 'FK',
        storeDomain: 'flipkart.com',
        storeAccentBg: '#2874F0',
        storeAccentText: '#FFE500',
        productUrl: 'https://www.flipkart.com/search?q=optimum+nutrition+gold+standard+whey+2.27+kg',
        inStock: true,
        listedPrice: 7149,
        mrp: 8699,
        coupons: [],
        bankOffers: [
          { bank: 'AXIS', label: 'Flipkart Axis 5% Cashback', amount: 357 },
          { bank: 'SBI', label: 'SBI Fitness Offer', amount: 250 },
        ],
        fees: [
          {
            id: 'fk-on-pkg',
            label: 'Secured Packaging Fee',
            category: 'packaging',
            amount: 99,
            isHidden: true,
            explanation: 'Mandatory Flipkart secured packaging fee on heavy nutrition tubs.',
            sourceLabel: 'Flipkart Checkout',
            sourceUrl: 'https://www.flipkart.com/pages/shipping',
          },
          {
            id: 'fk-on-plat',
            label: 'Platform & Handling Fee',
            category: 'platform',
            amount: 49,
            isHidden: true,
            explanation: 'Non-refundable platform fee added at payment step.',
            sourceLabel: 'Flipkart Payment Step',
            sourceUrl: 'https://www.flipkart.com/pages/terms',
          },
          {
            id: 'fk-on-cod',
            label: 'Pay on Delivery Charge',
            category: 'cod',
            amount: 50,
            isHidden: true,
            conditionalOnCod: true,
            explanation: '₹50 extra for COD.',
            sourceLabel: 'Flipkart COD',
            sourceUrl: 'https://www.flipkart.com/pages/paymentsecurity',
          },
        ],
        baseDeliveryDays: 3,
        deliveryNote: '₹148 packaging + platform fees added at payment',
        verifiedAgo: '2H AGO',
        verifiedTimestamp: '2026-11-21T08:15:00Z',
        trustScore: 72,
        returnPolicy: {
          policyFound: true,
          windowLabel: 'Non-Returnable (Open-Box Check)',
          windowDays: 0,
          windowSignal: 'bad',
          returnShippingLabel: 'Reject at doorstep if seal broken',
          returnShippingSignal: 'warn',
          refundMethod: 'Doorstep Rejection Only',
          refundMethodSignal: 'bad',
          refundSpeed: '5–7 business days',
          refundSpeedSignal: 'warn',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Not Allowed After OTP',
          exchangeSignal: 'bad',
          conditions: 'Once delivery OTP is shared under Open-Box Delivery, returns are not accepted.',
          plainEnglishSummary: 'Lowest advertised sticker, but ₹148 hidden fees push it above HealthKart with strict no-return rules.',
          policyScore: 56,
          sourceUrl: 'https://www.flipkart.com/pages/returnpolicy',
          timeline: [
            { step: 'Open-Box OTP Check', duration: 'Day 0', detail: 'Check seal & expiry BEFORE giving OTP.' },
            { step: 'Post-Delivery', duration: 'Locked', detail: 'No return accepted once OTP is shared.' },
          ],
        },
      },
      {
        storeId: 'jiomart',
        storeName: 'JioMart',
        shortCode: 'JM',
        storeDomain: 'jiomart.com',
        storeAccentBg: '#0078AD',
        storeAccentText: '#FFFFFF',
        productUrl: 'https://www.jiomart.com/search/optimum%20nutrition%20gold%20standard%20whey',
        inStock: true,
        listedPrice: 7549,
        mrp: 8699,
        coupons: [],
        bankOffers: [{ bank: 'UPI', label: 'JioMart UPI Cashback', amount: 100 }],
        fees: [
          {
            id: 'jm-on-handle',
            label: 'Heavy Grocery Handling & Delivery',
            category: 'handling',
            amount: 168,
            isHidden: true,
            explanation: 'JioMart partner-seller handling and heavy parcel fee.',
            sourceLabel: 'JioMart Checkout',
            sourceUrl: 'https://www.jiomart.com/customer/help',
          },
        ],
        baseDeliveryDays: 4,
        deliveryNote: 'Highest final cost by ₹1,039',
        verifiedAgo: '3H AGO',
        verifiedTimestamp: '2026-11-21T07:05:00Z',
        trustScore: 68,
        returnPolicy: {
          policyFound: true,
          windowLabel: 'Non-Returnable',
          windowDays: 0,
          windowSignal: 'bad',
          returnShippingLabel: 'Damaged only within 48h',
          returnShippingSignal: 'bad',
          refundMethod: 'JioMart Wallet / Replacement',
          refundMethodSignal: 'bad',
          refundSpeed: '7–10 business days',
          refundSpeedSignal: 'bad',
          restockingFeeLabel: '₹0',
          restockingFeePercent: 0,
          restockingSignal: 'good',
          exchangeAllowed: 'Damaged Only',
          exchangeSignal: 'bad',
          conditions: 'Consumable supplement cannot be returned after delivery.',
          plainEnglishSummary: 'Highest total price plus ₹168 handling fee and slower refund timelines.',
          policyScore: 54,
          sourceUrl: 'https://www.jiomart.com/return-policy',
          timeline: [
            { step: 'Check Parcel', duration: 'Within 48h', detail: 'Report broken seal immediately.' },
            { step: 'Resolution', duration: 'Day 7–10', detail: 'Wallet credit or replacement.' },
          ],
        },
      },
    ],
  },
];

const METRO_PINCODE_PREFIXES = ['11', '40', '56', '60', '50', '70', '41', '38', '12', '20'];

export function getPincodeMeta(pincode: string): {
  cityLabel: string;
  isRemote: boolean;
  extraDays: number;
  stateTaxNote: string;
} {
  const clean = pincode.replace(/\D/g, '').slice(0, 6);
  const exactMap: Record<string, string> = {
    '400001': 'Mumbai, MH (Metro)',
    '560001': 'Bengaluru, KA (Metro)',
    '110001': 'New Delhi, DL (Metro)',
    '600001': 'Chennai, TN (Metro)',
    '500001': 'Hyderabad, TS (Metro)',
    '411001': 'Pune, MH (Metro)',
    '700001': 'Kolkata, WB (Metro)',
    '302001': 'Jaipur, RJ (Tier-2)',
    '682001': 'Kochi, KL (Tier-2)',
    '781001': 'Guwahati, AS (Remote Zone)',
  };

  if (exactMap[clean]) {
    const isRemote = clean === '781001' || clean === '302001' || clean === '682001';
    return {
      cityLabel: exactMap[clean],
      isRemote,
      extraDays: clean === '781001' ? 3 : isRemote ? 1 : 0,
      stateTaxNote: '18% GST included (IGST/CGST+SGST parity)',
    };
  }

  if (clean.length < 6) {
    return {
      cityLabel: 'Mumbai, MH (Default Metro)',
      isRemote: false,
      extraDays: 0,
      stateTaxNote: '18% GST included',
    };
  }

  const prefix = clean.slice(0, 2);
  const isMetro = METRO_PINCODE_PREFIXES.includes(prefix);
  return {
    cityLabel: isMetro ? `Pincode ${clean} (Metro Hub)` : `Pincode ${clean} (Non-Metro Zone)`,
    isRemote: !isMetro,
    extraDays: isMetro ? 0 : 2,
    stateTaxNote: isMetro
      ? '18% GST included · Zero remote-area surcharge'
      : '18% GST included · Remote delivery surcharge applies on some stores',
  };
}

function formatEstimatedDate(daysFromNow: number): string {
  const target = new Date();
  target.setDate(target.getDate() + daysFromNow);
  return target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function computeStoreBreakdown(
  listing: StoreListing,
  prefs: UserPricePreferences
): ComputedStoreOffer {
  const pincodeMeta = getPincodeMeta(prefs.pincode);

  // 1. Coupons
  const appliedCoupons = listing.coupons.filter((c) => prefs.applyAllCoupons || c.autoApplied);
  const couponSavings = appliedCoupons.reduce((sum, c) => sum + c.amount, 0);

  // 2. Bank Offer
  const matchedBank =
    prefs.bankCard === 'NONE'
      ? null
      : listing.bankOffers.find((b) => b.bank === prefs.bankCard) || null;
  const bankSavings = matchedBank
    ? matchedBank.amount + (prefs.paymentMode === 'EMI' ? matchedBank.emiExtraDiscount || 0 : 0)
    : 0;
  const emiProcessingFee =
    prefs.paymentMode === 'EMI' ? (matchedBank?.emiProcessingFee ?? 199) : 0;

  // 3. Fees (with pincode remote surcharge & COD toggle)
  const activeFeeLines: Array<StoreFeeLine & { effectiveAmount: number }> = [];
  for (const fee of listing.fees) {
    if (fee.conditionalOnCod && !prefs.includeCodFee) continue;
    const remoteExtra = pincodeMeta.isRemote ? fee.remotePincodeSurcharge || 0 : 0;
    const effectiveAmount = fee.amount + remoteExtra;
    if (effectiveAmount > 0 || fee.category === 'delivery') {
      activeFeeLines.push({
        ...fee,
        effectiveAmount,
        label: remoteExtra > 0 ? `${fee.label} (+Remote Pincode)` : fee.label,
      });
    }
  }

  if (emiProcessingFee > 0) {
    activeFeeLines.push({
      id: `${listing.storeId}-emi-proc`,
      label: 'Bank EMI Processing Fee (+18% GST)',
      category: 'tax',
      amount: emiProcessingFee,
      effectiveAmount: emiProcessingFee,
      isHidden: true,
      explanation: 'Banks charge a one-time EMI processing fee + 18% GST on your first statement even on "No-Cost EMI".',
      sourceLabel: 'RBI / Bank EMI Disclosure',
      sourceUrl: listing.productUrl,
    });
  }

  const sumByCat = (cat: StoreFeeLine['category']) =>
    activeFeeLines
      .filter((f) => f.category === cat)
      .reduce((s, f) => s + f.effectiveAmount, 0);

  const deliveryFee = sumByCat('delivery');
  const handlingFee = sumByCat('handling');
  const packagingFee = sumByCat('packaging');
  const codFee = sumByCat('cod');
  const platformFee = sumByCat('platform');
  const installationFee = sumByCat('installation');
  const taxAdjustment = sumByCat('tax');

  const totalFees = activeFeeLines.reduce((s, f) => s + f.effectiveAmount, 0);
  const hiddenLines = activeFeeLines.filter((f) => f.isHidden && f.effectiveAmount > 0);
  const hiddenFeesCount = hiddenLines.length;
  const hiddenFeesTotal = hiddenLines.reduce((s, f) => s + f.effectiveAmount, 0);

  const totalOffersSavings = couponSavings + bankSavings;
  const finalPayablePrice = Math.max(0, listing.listedPrice - totalOffersSavings + totalFees);
  const deltaVsListed = finalPayablePrice - listing.listedPrice;

  const estimatedDeliveryDays = listing.baseDeliveryDays + pincodeMeta.extraDays;
  const estimatedDeliveryLabel = listing.inStock
    ? `${formatEstimatedDate(estimatedDeliveryDays)} (${estimatedDeliveryDays}d)`
    : 'Out of stock';

  const monthlyEmi6m = Math.round(finalPayablePrice / 6);

  return {
    listing,
    listedPrice: listing.listedPrice,
    couponSavings,
    appliedCoupons,
    bankSavings,
    appliedBankOffer: matchedBank,
    emiProcessingFee,
    totalOffersSavings,
    deliveryFee,
    handlingFee,
    packagingFee,
    codFee,
    platformFee,
    installationFee,
    taxAdjustment,
    totalFees,
    hiddenFeesCount,
    hiddenFeesTotal,
    finalPayablePrice,
    deltaVsListed,
    estimatedDeliveryDays,
    estimatedDeliveryLabel,
    monthlyEmi6m,
    activeFeeLines,
    isBestPrice: false,
  };
}

export function computeProductOffers(
  product: CatalogProduct,
  prefs: UserPricePreferences,
  sortBy: SortKey = 'FINAL_PRICE'
): ComputedStoreOffer[] {
  const computed = product.listings.map((l) => computeStoreBreakdown(l, prefs));
  const inStockOffers = computed.filter((o) => o.listing.inStock);
  const minFinal =
    inStockOffers.length > 0
      ? Math.min(...inStockOffers.map((o) => o.finalPayablePrice))
      : Infinity;

  let markedWinner = false;
  for (const offer of computed) {
    if (offer.listing.inStock && offer.finalPayablePrice === minFinal && !markedWinner) {
      offer.isBestPrice = true;
      markedWinner = true;
    }
  }

  return [...computed].sort((a, b) => {
    // Always keep out-of-stock at bottom
    if (a.listing.inStock !== b.listing.inStock) {
      return a.listing.inStock ? -1 : 1;
    }
    switch (sortBy) {
      case 'FASTEST_DELIVERY':
        return a.estimatedDeliveryDays - b.estimatedDeliveryDays || a.finalPayablePrice - b.finalPayablePrice;
      case 'BEST_RETURN':
        return b.listing.returnPolicy.policyScore - a.listing.returnPolicy.policyScore || a.finalPayablePrice - b.finalPayablePrice;
      case 'FEWEST_HIDDEN_FEES':
        return a.hiddenFeesTotal - b.hiddenFeesTotal || a.finalPayablePrice - b.finalPayablePrice;
      case 'FINAL_PRICE':
      default:
        return a.finalPayablePrice - b.finalPayablePrice;
    }
  });
}

export function getProductSpread(product: CatalogProduct, prefs: UserPricePreferences) {
  const computed = computeProductOffers(product, prefs, 'FINAL_PRICE');
  const inStock = computed.filter((c) => c.listing.inStock);
  const lowest = inStock[0] || computed[0];
  const highest = inStock[inStock.length - 1] || computed[computed.length - 1];
  const spread = highest.finalPayablePrice - lowest.finalPayablePrice;
  const maxTrust = Math.max(...product.listings.map((l) => l.trustScore));
  return { lowest, highest, spread, maxTrust, all: computed };
}

export const FAQ_ITEMS = [
  {
    q: 'Why does the final price on PriceProof differ from the price shown on Google or store listings?',
    a: 'Marketplaces advertise pre-checkout sticker prices that omit mandatory Secured Packaging fees (₹99–₹1,499), Protect Promise/platform fees (₹49–₹199), Pay-on-Delivery surcharges, heavy-appliance installation fees, and EMI processing GST. We calculate the true payable rupee total at checkout.',
  },
  {
    q: 'How do you calculate the Trust Score (out of 100)?',
    a: 'Trust Score weights two concrete facts: 50% Fee Transparency (penalising hidden checkout surcharges that only appear at payment) and 50% Return & Refund Fairness (rewarding original-payment refunds, longer return windows, free return pickup, and ₹0 restocking deductions).',
  },
  {
    q: 'Are bank discounts and coupons applied automatically?',
    a: 'Only unconditional coupons are applied by default. You can select your exact bank card (HDFC, ICICI, SBI, Axis, or UPI), toggle "Apply all coupons", add COD fees, or switch to EMI above the store table to recalculate every store instantly.',
  },
  {
    q: 'What does "Service Center Replacement Only" mean on Indian electronics stores?',
    a: 'Unlike Apple India Direct (which gives a 14-day no-questions refund), Amazon and Flipkart route defective phones and laptops through an authorised brand service center to issue a Dead-on-Arrival (DOA) certificate before approving a replacement.',
  },
];
