/**
 * Demo Product Data Provider (Indian Rupee / INR Edition)
 * Clearly labelled, fictionalized multi-seller offer dataset for offline hackathon demonstration.
 * Formatted in Indian Rupees (₹ / INR).
 * Covers nuanced real-world fee traps: hidden delivery fees, platform convenience fees,
 * restocking fees, return shipping deductions, and conditional payment discounts.
 */

import { calculateOfferCost, RawOfferInput } from '../core/cost-calculator.ts';
import { Offer, ProviderDiagnostic } from '../types/product.ts';
import { BaseProductProvider, ProviderSearchResult, SearchOptions } from './base-provider.ts';

const DEMO_CATALOG: RawOfferInput[] = [
  // ==========================================
  // PRODUCT 1: Sony WH-1000XM5 Wireless Headphones
  // ==========================================
  {
    id: 'demo-sony-xm5-seller-a',
    productId: 'sony-wh-1000xm5',
    title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones - Black',
    brand: 'Sony',
    category: 'Audio & Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/sony-xm5-gadgetzone',
    seller: {
      name: 'GadgetZone Direct (Marketplace)',
      sellerRating: 4.2,
      totalReviews: 840,
      isDirectPlatform: false,
      country: 'IN',
    },
    basePrice: 26990, // Deceptive low sticker price!
    currency: 'INR',
    originalStickerPrice: 34990,
    delivery: {
      fee: 499,
      isFree: false,
      isUnknown: false,
      estimatedDays: 4,
      notes: 'Standard ground courier',
    },
    mandatoryFees: [
      { name: 'Order Processing Fee', amount: 149, isMandatory: true, description: 'Mandatory checkout handling' },
      { name: 'Electronics Recycling Levy', amount: 99, isMandatory: true, description: 'Mandatory state recycling charge' }
    ],
    discounts: [],
    returnPolicy: {
      windowDays: 14,
      isFreeReturn: false,
      shippingCharge: 350,
      restockingFeePercentage: 15,
      condition: 'Unopened box only',
      details: 'Customer pays ₹350 return label fee + 15% restocking fee if opened.'
    },
    warranty: {
      durationMonths: 6,
      provider: 'SELLER',
      coverage: 'Limited store replacement warranty'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Marketplace seller with disguised shipping/handling surcharge',
    }
  },
  {
    id: 'demo-sony-xm5-seller-b',
    productId: 'sony-wh-1000xm5',
    title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones (Authorized Dealer)',
    brand: 'Sony',
    category: 'Audio & Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/sony-xm5-audiopro',
    seller: {
      name: 'AudioPro Official Store',
      sellerRating: 4.9,
      totalReviews: 4520,
      isDirectPlatform: true,
      country: 'IN',
    },
    basePrice: 27490, // Higher sticker price, but genuinely lowest total cost!
    currency: 'INR',
    originalStickerPrice: 34990,
    delivery: {
      fee: 0,
      isFree: true,
      isUnknown: false,
      estimatedDays: 2,
      notes: 'Free Express Air Delivery'
    },
    mandatoryFees: [],
    discounts: [
      { name: 'Festival Audio Instant Voucher', amount: 500, isConditional: false, applied: true }
    ],
    returnPolicy: {
      windowDays: 30,
      isFreeReturn: true,
      shippingCharge: 0,
      restockingFeePercentage: 0,
      condition: 'Full refund within 30 days',
      details: 'Free courier pickup included.'
    },
    warranty: {
      durationMonths: 24,
      provider: 'MANUFACTURER',
      coverage: '2-Year Official Sony India Manufacturer Warranty'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Authorized dealer with free shipping and zero hidden charges',
    }
  },
  {
    id: 'demo-sony-xm5-seller-c',
    productId: 'sony-wh-1000xm5',
    title: 'Sony WH-1000XM5 Over-Ear Headphones - Platinum Silver / Black',
    brand: 'Sony',
    category: 'Audio & Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/sony-xm5-megamart',
    seller: {
      name: 'MegaMart Online India',
      sellerRating: 4.0,
      totalReviews: 12000,
      isDirectPlatform: true,
      country: 'IN',
    },
    basePrice: 29990,
    currency: 'INR',
    originalStickerPrice: 34990,
    delivery: {
      fee: 0,
      isFree: true,
      isUnknown: false,
      estimatedDays: 3,
    },
    mandatoryFees: [
      { name: 'Platform Convenience Fee', amount: 49, isMandatory: true }
    ],
    discounts: [
      {
        name: 'HDFC / ICICI Credit Card 10% Off',
        amount: 1500,
        isConditional: true,
        conditionDescription: 'Requires active HDFC/ICICI Bank Credit Card at checkout',
        applied: false
      }
    ],
    membershipRequired: {
      name: 'MegaMart Plus Membership',
      annualCost: 999,
      isOptional: true,
      savingsWithMembership: 1000
    },
    returnPolicy: {
      windowDays: 30,
      isFreeReturn: false,
      shippingCharge: 199,
      condition: 'Must retain serial number and packaging',
      details: '₹199 return shipping deducted from refund.'
    },
    warranty: {
      durationMonths: 12,
      provider: 'MANUFACTURER',
      coverage: '1-Year Sony standard warranty'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Retailer with conditional bank card discount & platform fee',
    }
  },
  {
    id: 'demo-sony-xm5-seller-d',
    productId: 'sony-wh-1000xm5',
    title: 'Sony WH-1000XM5 Wireless Headphones (Open-Box / Pristine)',
    brand: 'Sony',
    category: 'Audio & Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/sony-xm5-liquidation',
    seller: {
      name: 'ElectroLiquidators Hub',
      sellerRating: 3.8,
      totalReviews: 240,
      isDirectPlatform: false,
    },
    basePrice: 22990, // Very low sticker price, but unknown shipping and no warranty
    currency: 'INR',
    delivery: {
      fee: 0,
      isUnknown: true, // Pincode required!
      notes: 'Shipping calculated at final checkout based on pincode and delivery weight'
    },
    mandatoryFees: [
      { name: 'Warehousing & Packaging Surcharge', amount: 299, isMandatory: true }
    ],
    discounts: [],
    returnPolicy: {
      windowDays: 7,
      isFreeReturn: false,
      shippingCharge: -1,
      restockingFeePercentage: 20,
      condition: 'Final sale on open box items unless completely defective',
      details: 'Buyer arranges and pays return postage. 20% restocking fee.'
    },
    warranty: {
      durationMonths: 0,
      provider: 'NONE',
      coverage: 'No manufacturer warranty. As-is refurbished condition.'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Partial pricing estimate with undisclosed checkout delivery',
    }
  },

  // ==========================================
  // PRODUCT 2: Logitech G Pro X Superlight 2 Gaming Mouse
  // ==========================================
  {
    id: 'demo-logitech-mouse-seller-a',
    productId: 'logitech-g-pro-x-superlight-2',
    title: 'Logitech G PRO X SUPERLIGHT 2 Lightspeed Wireless Gaming Mouse - Magenta',
    brand: 'Logitech G',
    category: 'Computer Peripherals',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/logitech-g-pro-mouse-esports',
    seller: {
      name: 'ESports Gear India',
      sellerRating: 4.8,
      totalReviews: 3200,
      isDirectPlatform: true,
    },
    basePrice: 13995,
    currency: 'INR',
    originalStickerPrice: 15995,
    delivery: {
      fee: 0,
      isFree: true,
      freeThreshold: 999,
      estimatedDays: 2,
    },
    mandatoryFees: [],
    discounts: [],
    returnPolicy: {
      windowDays: 30,
      isFreeReturn: true,
      shippingCharge: 0,
      condition: 'Any condition within 30 days',
      details: 'Hassle-free prepaid return'
    },
    warranty: {
      durationMonths: 24,
      provider: 'MANUFACTURER',
      coverage: '2-Year limited hardware warranty'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Transparent gaming specialist with free delivery over ₹999',
    }
  },
  {
    id: 'demo-logitech-mouse-seller-b',
    productId: 'logitech-g-pro-x-superlight-2',
    title: 'Logitech G PRO X SUPERLIGHT 2 Wireless Ultra-Light Gaming Mouse',
    brand: 'Logitech G',
    category: 'Computer Peripherals',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/logitech-mouse-cheapdeals',
    seller: {
      name: 'FastDeal Express',
      sellerRating: 3.9,
      totalReviews: 610,
      isDirectPlatform: false,
    },
    basePrice: 12990, // Sticker price trap! Base is ₹12,990 vs ₹13,995, but total is ₹14,240
    currency: 'INR',
    delivery: {
      fee: 999,
      isFree: false,
      isUnknown: false,
      estimatedDays: 5,
    },
    mandatoryFees: [
      { name: 'Safe Shipping Insurance', amount: 251, isMandatory: true }
    ],
    discounts: [],
    returnPolicy: {
      windowDays: 14,
      isFreeReturn: false,
      shippingCharge: 499,
      condition: 'Unused in sealed retail blister pack',
      details: '₹499 handling fee deducted on all returns.'
    },
    warranty: {
      durationMonths: 12,
      provider: 'SELLER',
      coverage: '1-Year seller replacement'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Classic sticker trap where shipping & insurance inflate cost',
    }
  },

  // ==========================================
  // PRODUCT 3: Apple MacBook Air 13-inch M3 (Laptop)
  // ==========================================
  {
    id: 'demo-macbook-air-seller-a',
    productId: 'macbook-air-13-m3',
    title: 'Apple MacBook Air 13-inch (M3 chip, 8GB RAM, 256GB SSD) - Space Gray',
    brand: 'Apple',
    category: 'Laptops & Computers',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/macbook-air-m3-appleauth',
    seller: {
      name: 'Authorized Campus Tech India',
      sellerRating: 4.9,
      totalReviews: 8900,
      isDirectPlatform: true,
    },
    basePrice: 104900,
    currency: 'INR',
    originalStickerPrice: 114900,
    delivery: {
      fee: 0,
      isFree: true,
      estimatedDays: 2,
    },
    mandatoryFees: [
      { name: 'E-Waste Regulatory Handling', amount: 250, isMandatory: true, description: 'Statutory compliance levy' }
    ],
    discounts: [
      { name: 'Student Education Discount', amount: 5000, isConditional: true, conditionDescription: 'Requires active student ID verification', applied: false }
    ],
    returnPolicy: {
      windowDays: 14,
      isFreeReturn: true,
      shippingCharge: 0,
      condition: 'Factory reset condition',
      details: 'Full 14-day standard return window.'
    },
    warranty: {
      durationMonths: 12,
      provider: 'MANUFACTURER',
      coverage: 'Apple 1-Year Limited Warranty + 90 days technical support'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Authorized campus tech dealer with transparent compliance',
    }
  },
  {
    id: 'demo-macbook-air-seller-b',
    productId: 'macbook-air-13-m3',
    title: 'Apple MacBook Air 13" M3 Processor 256GB SSD Midnight Blue',
    brand: 'Apple',
    category: 'Laptops & Computers',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/macbook-air-m3-warehouse',
    seller: {
      name: 'National Computer Depot',
      sellerRating: 4.4,
      totalReviews: 12400,
      isDirectPlatform: true,
    },
    basePrice: 102990, // Lower base price, but higher total!
    currency: 'INR',
    originalStickerPrice: 114900,
    delivery: {
      fee: 1499,
      isFree: false,
      estimatedDays: 3,
      notes: 'Insured signature ground delivery'
    },
    mandatoryFees: [
      { name: 'High-Value Order Handling Fee', amount: 499, isMandatory: true }
    ],
    discounts: [],
    returnPolicy: {
      windowDays: 30,
      isFreeReturn: false,
      shippingCharge: 999,
      restockingFeePercentage: 10,
      condition: 'Restocking fee applies if box opened',
      details: '10% restocking fee deducted on opened computing devices.'
    },
    warranty: {
      durationMonths: 12,
      provider: 'MANUFACTURER',
      coverage: '1-Year Apple warranty'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Competitor with mandatory insured courier charge',
    }
  },

  // ==========================================
  // PRODUCT 4: Keychron Q1 Pro Wireless Mechanical Keyboard
  // ==========================================
  {
    id: 'demo-keychron-seller-a',
    productId: 'keychron-q1-pro',
    title: 'Keychron Q1 Pro QMK/VIA Wireless Custom Mechanical Keyboard (Red Switches)',
    brand: 'Keychron',
    category: 'Keyboards',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/keychron-q1-keygeek',
    seller: {
      name: 'KeyGeek Labs India',
      sellerRating: 4.9,
      totalReviews: 1820,
      isDirectPlatform: true,
    },
    basePrice: 17999,
    currency: 'INR',
    delivery: {
      fee: 0,
      isFree: true,
      estimatedDays: 3,
    },
    mandatoryFees: [],
    discounts: [
      { name: 'Keyboard Enthusiast Club ₹1,000 Off', amount: 1000, isConditional: false, applied: true }
    ],
    returnPolicy: {
      windowDays: 30,
      isFreeReturn: true,
      shippingCharge: 0,
      condition: 'With all keycaps and switches intact',
      details: 'Free return shipping label provided.'
    },
    warranty: {
      durationMonths: 12,
      provider: 'MANUFACTURER',
      coverage: '1-Year Keychron hardware warranty'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Specialty keyboard shop with clear, honest pricing',
    }
  },
  {
    id: 'demo-keychron-seller-b',
    productId: 'keychron-q1-pro',
    title: 'Keychron Q1 Pro Aluminum Mechanical Wireless RGB Keyboard',
    brand: 'Keychron',
    category: 'Keyboards',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    productUrl: 'https://www.example.com/demo/keychron-q1-importzone',
    seller: {
      name: 'Global Imports Express',
      sellerRating: 3.7,
      totalReviews: 410,
    },
    basePrice: 16499, // Sticker ₹16,499 vs ₹17,999, but ₹1,800 shipping + ₹450 handling = ₹18,749!
    currency: 'INR',
    delivery: {
      fee: 1800,
      isFree: false,
      estimatedDays: 7,
      notes: 'Overseas air shipping'
    },
    mandatoryFees: [
      { name: 'Customs Clearance Fee', amount: 450, isMandatory: true }
    ],
    discounts: [],
    returnPolicy: {
      windowDays: 14,
      isFreeReturn: false,
      shippingCharge: 2200,
      condition: 'Customer pays overseas return shipping to warehouse',
      details: 'Return shipping costs estimated at ₹2,200 minimum.'
    },
    warranty: {
      durationMonths: 3,
      provider: 'SELLER',
      coverage: '90-Day distributor replacement only'
    },
    dataSource: {
      providerId: 'demo_provider',
      providerName: 'PriceProof Verified Demo Catalog',
      isLive: false,
      attribution: 'Demo Simulation: Cross-border seller with international shipping fees',
    }
  }
];

export class DemoProductProvider extends BaseProductProvider {
  readonly id = 'demo_provider';
  readonly name = 'PriceProof Demo Catalog';
  readonly isLive = false;
  readonly docsUrl = 'https://github.com/priceproof/docs#demo-provider';
  readonly authMethod = 'None (Built-in static reference dataset)';
  readonly description = 'Comprehensive fictional dataset in Indian Rupees (INR) demonstrating hidden fees, delivery surcharges, return policies, and deceptive sticker prices.';
  readonly supportedRegions = ['IN (India)', 'GLOBAL'];

  getDiagnostic(): ProviderDiagnostic {
    return {
      id: this.id,
      name: this.name,
      type: 'DEMO',
      status: 'DEMO',
      isConfigured: true,
      requiredEnvVars: [],
      docsUrl: this.docsUrl,
      authMethod: this.authMethod,
      description: this.description,
      supportedRegions: this.supportedRegions,
    };
  }

  async search(query: string, options?: SearchOptions): Promise<ProviderSearchResult> {
    const startTime = Date.now();
    const cleanQuery = (query || '').toLowerCase().trim();

    if (!cleanQuery) {
      return {
        providerId: this.id,
        providerName: this.name,
        isLive: false,
        status: 'DEMO',
        offers: [],
        latencyMs: Date.now() - startTime,
        message: 'Empty query',
      };
    }

    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

    const matches = DEMO_CATALOG.filter((item) => {
      const searchBlob = `${item.title} ${item.brand || ''} ${item.category || ''} ${item.productId}`.toLowerCase();
      return queryTokens.some((token) => searchBlob.includes(token));
    });

    const effectiveItems = matches.length > 0 ? matches : DEMO_CATALOG.slice(0, 4);

    const offers: Offer[] = effectiveItems.map((raw) => calculateOfferCost(raw));

    return {
      providerId: this.id,
      providerName: this.name,
      isLive: false,
      status: 'DEMO',
      offers,
      latencyMs: Date.now() - startTime,
      message: matches.length > 0
        ? `Found ${offers.length} demo offers in INR matching "${query}".`
        : `No direct keyword match for "${query}". Showing featured comparison products in INR.`,
    };
  }
}
