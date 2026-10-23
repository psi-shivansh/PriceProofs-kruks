# PriceProof — Reveal the Real Cost of Online Shopping

PriceProof is a full-stack product price comparison web application built for a 24-hour hackathon. Instead of naive "sticker price" scraping, PriceProof computes the **True Total Known Cost** of online purchases by factoring in hidden delivery surcharges, mandatory platform convenience fees, return shipping expenses, and conditional card discounts.

---

## 1. Problem & Core Solution

Online e-commerce platforms frequently engage in "drip pricing" or "sticker price deception":
- **The Delivery Fee Mirage**: Advertising a product at $349 with an unadvertised $15 ground delivery surcharge at checkout, losing out to an authorized dealer selling at $359 with free 2-day shipping.
- **Mandatory Convenience Levies**: Adding $1.50–$3.50 checkout processing fees on the final credit card step.
- **Return Shipping Traps**: "30-day return policy", but customer is billed $8.50 for return shipping plus a 15% open-box restocking fee.
- **Conditional Discount Traps**: Advertising a 10% lower price that is only valid if the shopper signs up for a proprietary store credit card or annual club membership.

**PriceProof solves this by ranking offers strictly on comparable out-of-pocket costs and highlighting deceptive sticker prices with full fee transparency.**

---

## 2. Architecture & Folder Structure

```
├── server.ts                       # Express backend server with Vite middleware integration (Port 3000)
├── index.html                      # HTML entry point with synchronized metadata & fonts
├── metadata.json                   # Applet metadata & permissions
├── package.json                    # Full-stack scripts & dependencies
├── .env.example                    # Template for optional live provider API credentials
├── src/
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Main dashboard, search orchestration, modal control
│   ├── index.css                   # Tailwind CSS imports & theme styling
│   ├── types/
│   │   └── product.ts              # Normalized domain types (Offer, FeeItem, ReturnPolicy, etc.)
│   ├── core/
│   │   └── cost-calculator.ts      # Pure core comparison engine, formula calculation, sticker trap detection
│   ├── providers/
│   │   ├── base-provider.ts        # BaseProductProvider abstract class & interfaces
│   │   ├── demo-provider.ts        # Rich multi-seller comparison dataset simulating hidden fees
│   │   ├── dummyjson-live-provider.ts # Genuine live HTTP e-commerce search with latency tracking
│   │   ├── amazon-paapi-provider.ts # Official Amazon PA-API v5 adapter with SigV4 support
│   │   ├── flipkart-affiliate-provider.ts # Flipkart Affiliate API feed adapter
│   │   └── provider-registry.ts    # Fault-tolerant orchestrator for parallel provider querying
│   ├── components/
│   │   ├── Navbar.tsx              # Brand header, active provider status indicator
│   │   ├── SearchBar.tsx           # Search input with quick-tag comparisons and provider filter toggles
│   │   ├── FiltersAndSortBar.tsx   # Sort by Total Cost / Sticker / Transparency, policy filters
│   │   ├── OfferCard.tsx           # Offer presentation with Winner callout, fee pills, sticker trap alerts
│   │   ├── FeeBreakdownModal.tsx   # Itemized financial receipt & return policy inspection
│   │   ├── ComparisonMatrix.tsx    # Side-by-side comparison table of selected offers
│   │   ├── ProviderDiagnosticsModal.tsx # Live API connection health & credential setup guide
│   │   ├── EmptyState.tsx          # Zero-state and helpful suggestions
│   │   └── EducationalSection.tsx  # Deep dive into the 4 hidden fee traps
│   └── tests/
│       └── run-tests.ts            # Complete unit test suite verifying all 8 evaluation criteria
```

---

## 3. Quick Start & Installation

### Prerequisites
- Node.js v18+ or v20+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/priceproof.git
cd priceproof

# Install dependencies
npm install

# Run automated tests
npm test

# Start the full-stack development server (Express API + React Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 4. Total Cost Calculation Formula

For every offer retrieved from any provider, PriceProof calculates:

$$\text{Known Total Cost} = \text{Base Price} + \sum \text{Mandatory Fees} + \text{Delivery Fee} - \sum \text{Unconditional Discounts}$$

- **Delivery Fee**: If marked `isUnknown`, the offer is categorized as `PARTIAL_ESTIMATE` and a warning is issued that shipping requires a destination zip code.
- **Conditional Discounts**: Cardholder-exclusive offers or membership discounts are noted in warnings and excluded from baseline fair comparison totals.
- **Deceptive Sticker Trap**: If Seller A has a lower base price than Seller B, but Seller A's mandatory shipping and fees make the total higher, Seller A is explicitly tagged with `STICKER PRICE TRAP DETECTED`.

---

## 5. Authorised Data Provider Integration Guide

PriceProof features a pluggable provider adapter architecture (`BaseProductProvider`). All credentials stay securely on the backend in environment variables.

### 1. Open E-Commerce Live API (`DummyJsonLiveProvider`)
- **Status**: **Genuinely Active & Integrated**.
- **Auth**: Public authorized HTTP REST API.
- **Function**: Executes real-time HTTP queries, returns live prices, images, stock, authentic warranty terms, and return policies. Measures live roundtrip latency.

### 2. PriceProof Verified Demo Catalog (`DemoProductProvider`)
- **Status**: **Active Reference Simulation**.
- **Auth**: None (Offline deterministic mock dataset).
- **Function**: Provides multi-seller comparisons on popular electronics (Sony WH-1000XM5 headphones, Logitech G Pro X Superlight 2 mouse, Apple MacBook Air M3, Keychron Q1 Pro keyboard) demonstrating tricky edge cases like 15% open-box restocking fees and buyer-paid return shipping.

### 3. Amazon Product Advertising API v5 (`AmazonPaapiProvider`)
- **Status**: **Adapter Implemented** (Reports `REQUIRES_AUTH` when credentials are omitted).
- **Auth**: AWS Signature Version 4 (HMAC-SHA256).
- **Requirements**:
  - `AMAZON_PAAPI_ACCESS_KEY`
  - `AMAZON_PAAPI_SECRET_KEY`
  - `AMAZON_ASSOCIATE_TAG` (e.g., `tag-20` for US, `tag-21` for India)
  - `AMAZON_PAAPI_REGION` (default: `us-east-1` for `webservices.amazon.com`, `eu-west-1` for `webservices.amazon.in`)
- **How to obtain**:
  1. Join the [Amazon Associates Program](https://affiliate-program.amazon.com).
  2. Achieve at least 3 qualifying sales within 180 days to unlock PA-API access.
  3. Generate API credentials in the Amazon Associates Console under **Tools -> Product Advertising API**.
  4. Add the credentials to your `.env` file on the backend.

### 4. Flipkart Affiliate API (`FlipkartAffiliateProvider`)
- **Status**: **Adapter Implemented** (Reports `REQUIRES_AUTH` when credentials are omitted).
- **Auth**: HTTP Headers (`Fk-Affiliate-Id`, `Fk-Affiliate-Token`).
- **Requirements**:
  - `FLIPKART_AFFILIATE_ID`
  - `FLIPKART_AFFILIATE_TOKEN`
- **How to obtain**:
  1. Register on [Flipkart Affiliate Portal](https://affiliate.flipkart.com).
  2. Locate your Affiliate ID and Token in API credentials.
  3. Add credentials to your `.env` file.

---

## 6. Testing & Verification

Run the test suite using:
```bash
npm test
```

The test runner (`src/tests/run-tests.ts`) executes pure unit tests validating all 8 hackathon criteria:
1. **Total-cost calculations**: Correctly sums base + shipping + mandatory fees.
2. **Discounts and mandatory fees**: Distinguishes unconditional coupons from conditional card discounts.
3. **Unknown charges**: Flags unknown delivery without improperly treating it as $0.
4. **Membership-dependent offers**: Warns about paid memberships without misrepresenting standard totals.
5. **Duplicate / incomparable products & Sticker Trap**: Identifies deceptive sticker price traps where cheaper base price results in higher total cost.
6. **Empty search results**: Gracefully handles empty queries and whitespace.
7. **Provider failures and timeouts**: Fault-tolerant architecture isolates failing providers so other active sources continue delivering results.
8. **Incorrect or missing data**: Identifies negative/corrupt prices and flags them as `UNVERIFIED_CHARGES`.

All 8 test suites pass with 100% success.

---

## 7. Deliverables & Integration Status

| Component | Status | Notes |
|---|---|---|
| Search & Instant Auto-suggestions | Complete | Fast instant search with quick tags |
| True Total Cost Engine | Complete | Accurate itemized calculations & formula |
| Deceptive Sticker Price Trap Detection | Complete | Flags offers that look cheap but cost more |
| Side-by-Side Comparison Matrix | Complete | Itemized comparison of multiple selected offers |
| Fee Breakdown & Policy Audit Modal | Complete | Return windows, restocking fees, and warranty |
| Live Open E-Commerce API | Live | Real-time HTTP network fetch via DummyJSON |
| Multi-Seller Demo Catalog | Complete | Covers complex real-world pricing anomalies |
| Amazon PA-API Adapter | Implemented | Verified AWS SigV4 adapter; requires credentials |
| Flipkart Affiliate Adapter | Implemented | Header auth adapter; requires credentials |
| Provider Diagnostics Drawer | Complete | Full transparency into source origins and latencies |
| 100% Automated Test Suite | Complete | Run via `npm test` |
