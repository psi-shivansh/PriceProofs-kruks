/**
 * PriceProof Automated Test Suite
 * Validates the 8 core requirements:
 * 1. Total-cost calculations
 * 2. Discounts (unconditional vs conditional) and mandatory fees
 * 3. Unknown charges handling & completeness status
 * 4. Membership-dependent offers
 * 5. Duplicate or incomparable products & deceptive sticker price detection
 * 6. Empty search results
 * 7. Provider failures and timeouts isolation
 * 8. Incorrect or missing data handling
 */

import assert from 'node:assert';
import {
  calculateOfferCost,
  groupAndRankOffers,
  normalizeProductTitle,
  RawOfferInput,
} from '../core/cost-calculator.ts';
import { DemoProductProvider } from '../providers/demo-provider.ts';
import { ProviderRegistry } from '../providers/provider-registry.ts';
import { BaseProductProvider, ProviderSearchResult } from '../providers/base-provider.ts';

let totalTests = 0;
let passedTests = 0;

function test(description: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          passedTests++;
          console.log(`  ✓ ${description}`);
        })
        .catch((err) => {
          console.error(`  ✗ ${description}`);
          console.error(`    ${err.message}`);
          throw err;
        });
    } else {
      passedTests++;
      console.log(`  ✓ ${description}`);
    }
  } catch (err: any) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function runTestSuite() {
  console.log('\n========================================');
  console.log('PriceProof Core Engine Test Suite');
  console.log('========================================\n');

  // ---------------------------------------------------------
  // TEST 1: Total-Cost Calculations
  // ---------------------------------------------------------
  console.log('Category 1: Total-Cost Calculations');
  test('Calculates total cost = base + delivery + mandatory fees', () => {
    const raw: RawOfferInput = {
      id: 't1',
      productId: 'p1',
      title: 'Gaming Headset',
      productUrl: 'https://example.com/item',
      seller: { name: 'Seller One' },
      basePrice: 100.00,
      delivery: { fee: 10.00, isFree: false },
      mandatoryFees: [
        { name: 'Handling Fee', amount: 5.00, isMandatory: true },
        { name: 'Eco Levy', amount: 2.50, isMandatory: true },
      ],
      returnPolicy: { windowDays: 30, isFreeReturn: true, shippingCharge: 0, condition: 'Any', details: 'Free' },
      warranty: { durationMonths: 12, provider: 'MANUFACTURER', coverage: '1 year' },
      dataSource: { providerId: 'test', providerName: 'Test', isLive: false, attribution: 'Test' },
    };

    const offer = calculateOfferCost(raw);
    assert.strictEqual(offer.totalCostCalculation.knownTotal, 117.50);
    assert.strictEqual(offer.totalCostCalculation.stickerDelta, 17.50);
    assert.strictEqual(offer.totalCostCalculation.completeness, 'COMPLETE');
  });

  // ---------------------------------------------------------
  // TEST 2: Discounts and Mandatory Fees
  // ---------------------------------------------------------
  console.log('\nCategory 2: Discounts & Mandatory Fees');
  test('Applies unconditional discounts but excludes conditional credit card discounts from base total', () => {
    const raw: RawOfferInput = {
      id: 't2',
      productId: 'p2',
      title: 'Wireless Mouse',
      productUrl: 'https://example.com/mouse',
      seller: { name: 'Tech Store' },
      basePrice: 80.00,
      delivery: { fee: 0, isFree: true },
      mandatoryFees: [{ name: 'Service Charge', amount: 3.00, isMandatory: true }],
      discounts: [
        { name: 'Open Coupon $5', amount: 5.00, isConditional: false, applied: true },
        { name: 'HDFC Card 10% Off', amount: 8.00, isConditional: true, conditionDescription: 'HDFC Card only', applied: false },
      ],
      returnPolicy: { windowDays: 14, isFreeReturn: true, shippingCharge: 0, condition: 'Good', details: 'Free' },
      warranty: { durationMonths: 12, provider: 'MANUFACTURER', coverage: '1 year' },
      dataSource: { providerId: 'test', providerName: 'Test', isLive: false, attribution: 'Test' },
    };

    const offer = calculateOfferCost(raw);
    // Base 80 + Fee 3 - Unconditional Coupon 5 = 78.00 (Conditional 8 is NOT subtracted)
    assert.strictEqual(offer.totalCostCalculation.knownTotal, 78.00);
    const hasConditionalWarning = offer.totalCostCalculation.warnings.some((w) =>
      w.includes('Conditional discount')
    );
    assert.strictEqual(hasConditionalWarning, true);
  });

  // ---------------------------------------------------------
  // TEST 3: Unknown Charges Handling
  // ---------------------------------------------------------
  console.log('\nCategory 3: Unknown Charges');
  test('Does not treat unknown delivery fee as $0 and marks status as PARTIAL_ESTIMATE', () => {
    const raw: RawOfferInput = {
      id: 't3',
      productId: 'p3',
      title: 'Office Chair',
      productUrl: 'https://example.com/chair',
      seller: { name: 'Furniture Hub' },
      basePrice: 150.00,
      delivery: { fee: 0, isUnknown: true },
      returnPolicy: { windowDays: 14, isFreeReturn: false, shippingCharge: -1, condition: 'Boxed', details: 'Buyer pays' },
      warranty: { durationMonths: 6, provider: 'SELLER', coverage: '6 mo' },
      dataSource: { providerId: 'test', providerName: 'Test', isLive: false, attribution: 'Test' },
    };

    const offer = calculateOfferCost(raw);
    assert.strictEqual(offer.totalCostCalculation.completeness, 'PARTIAL_ESTIMATE');
    const hasZipWarning = offer.totalCostCalculation.warnings.some((w) =>
      w.includes('zip code')
    );
    assert.strictEqual(hasZipWarning, true);
  });

  // ---------------------------------------------------------
  // TEST 4: Membership-Dependent Offers
  // ---------------------------------------------------------
  console.log('\nCategory 4: Membership-Dependent Offers');
  test('Warns about membership requirement without misrepresenting non-member price', () => {
    const raw: RawOfferInput = {
      id: 't4',
      productId: 'p4',
      title: '4K Webcam',
      productUrl: 'https://example.com/webcam',
      seller: { name: 'ClubMart' },
      basePrice: 120.00,
      delivery: { fee: 0, isFree: true },
      membershipRequired: {
        name: 'ClubMart Gold',
        annualCost: 60,
        isOptional: false,
        savingsWithMembership: 25,
      },
      returnPolicy: { windowDays: 30, isFreeReturn: true, shippingCharge: 0, condition: 'Any', details: 'Free' },
      warranty: { durationMonths: 12, provider: 'MANUFACTURER', coverage: '1 yr' },
      dataSource: { providerId: 'test', providerName: 'Test', isLive: false, attribution: 'Test' },
    };

    const offer = calculateOfferCost(raw);
    const hasMemberWarning = offer.totalCostCalculation.warnings.some((w) =>
      w.includes('ClubMart Gold')
    );
    assert.strictEqual(hasMemberWarning, true);
  });

  // ---------------------------------------------------------
  // TEST 5: Duplicate or Incomparable Products & Deceptive Sticker Trap
  // ---------------------------------------------------------
  console.log('\nCategory 5: Duplicate / Incomparable & Deceptive Sticker Trap');
  test('Identifies deceptive sticker trap where cheaper advertised price has higher total cost', () => {
    const offerCheaperSticker = calculateOfferCost({
      id: 'trap-seller',
      productId: 'same-gadget-1',
      title: 'Pro Mechanical Keyboard RGB',
      productUrl: 'https://example.com/trap',
      seller: { name: 'SneakySeller' },
      basePrice: 90.00, // Looks cheaper than $100!
      delivery: { fee: 18.00, isFree: false },
      mandatoryFees: [{ name: 'Processing Fee', amount: 5.00, isMandatory: true }],
      returnPolicy: { windowDays: 14, isFreeReturn: false, shippingCharge: 10, condition: 'Sealed', details: 'Paid' },
      warranty: { durationMonths: 12, provider: 'MANUFACTURER', coverage: '1 yr' },
      dataSource: { providerId: 'test', providerName: 'Test', isLive: false, attribution: 'Test' },
    }); // Total = 90 + 18 + 5 = 113.00

    const offerHonest = calculateOfferCost({
      id: 'honest-seller',
      productId: 'same-gadget-1',
      title: 'Pro Mechanical Keyboard RGB',
      productUrl: 'https://example.com/honest',
      seller: { name: 'HonestTech' },
      basePrice: 100.00, // Sticker is $100
      delivery: { fee: 0, isFree: true },
      mandatoryFees: [],
      returnPolicy: { windowDays: 30, isFreeReturn: true, shippingCharge: 0, condition: 'Any', details: 'Free' },
      warranty: { durationMonths: 24, provider: 'MANUFACTURER', coverage: '2 yr' },
      dataSource: { providerId: 'test', providerName: 'Test', isLive: false, attribution: 'Test' },
    }); // Total = 100.00

    const groups = groupAndRankOffers([offerCheaperSticker, offerHonest]);
    assert.strictEqual(groups.length, 1);
    
    // Honest seller must be the cheapest comparable winner (100 < 113)
    assert.strictEqual(groups[0].cheapestOfferId, 'honest-seller');
    assert.strictEqual(groups[0].lowestTotalCost, 100.00);

    // Trap seller must be flagged as deceptive sticker
    const trapOfferResult = groups[0].offers.find((o) => o.id === 'trap-seller');
    assert.strictEqual(trapOfferResult?.totalCostCalculation.isDeceptiveSticker, true);
    const hasStickerTrapWarning = trapOfferResult?.totalCostCalculation.warnings.some((w) =>
      w.includes('Sticker Trap Warning')
    );
    assert.strictEqual(hasStickerTrapWarning, true);
  });

  // ---------------------------------------------------------
  // TEST 6: Empty Search Results
  // ---------------------------------------------------------
  console.log('\nCategory 6: Empty Search Results');
  await test('Handles empty query or whitespace gracefully without throwing', async () => {
    const registry = new ProviderRegistry();
    const resultEmpty = await registry.search('');
    assert.strictEqual(resultEmpty.totalProducts, 0);
    assert.strictEqual(resultEmpty.totalOffers, 0);
    assert.deepStrictEqual(resultEmpty.products, []);

    const resultWhitespace = await registry.search('     ');
    assert.strictEqual(resultWhitespace.totalProducts, 0);
  });

  // ---------------------------------------------------------
  // TEST 7: Provider Failures and Timeouts Isolation
  // ---------------------------------------------------------
  console.log('\nCategory 7: Provider Failures & Timeouts Isolation');
  await test('Isolates throwing provider so other active providers continue returning results', async () => {
    class FailingProvider extends BaseProductProvider {
      readonly id = 'failing_provider';
      readonly name = 'Failing Mock API';
      readonly isLive = true;
      readonly docsUrl = 'https://example.com';
      readonly authMethod = 'None';
      readonly description = 'Throws 500 error';
      readonly supportedRegions = ['US'];

      getDiagnostic() {
        return {
          id: this.id,
          name: this.name,
          type: 'LIVE' as const,
          status: 'ERROR' as const,
          isConfigured: true,
          requiredEnvVars: [],
          docsUrl: this.docsUrl,
          authMethod: this.authMethod,
          description: this.description,
          supportedRegions: this.supportedRegions,
        };
      }

      async search(): Promise<ProviderSearchResult> {
        throw new Error('Upstream server timeout 504 Gateway Unavailable');
      }
    }

    const customRegistry = new ProviderRegistry();
    customRegistry.register(new FailingProvider());

    const result = await customRegistry.search('wireless headphones', { includeDemo: true });
    
    // The failing provider must report its error status in providersSummary
    const failedSummary = result.providersSummary.find((p) => p.id === 'failing_provider');
    assert.strictEqual(failedSummary?.status, 'ERROR');
    assert.strictEqual(failedSummary?.offersCount, 0);

    // But other providers (like demo) must have succeeded and populated products!
    assert.ok(result.totalOffers > 0, 'Offers from healthy providers should be present');
  });

  // ---------------------------------------------------------
  // TEST 8: Incorrect or Missing Data
  // ---------------------------------------------------------
  console.log('\nCategory 8: Incorrect or Missing Data');
  test('Flags zero/negative base price as UNVERIFIED_CHARGES with safety fallback', () => {
    const raw: RawOfferInput = {
      id: 't8-corrupt',
      productId: 'p8',
      title: 'Corrupted Listing Product',
      productUrl: 'https://example.com/broken',
      seller: { name: 'Unknown Seller' },
      basePrice: -50.00, // Corrupted negative price
      delivery: { fee: 0, isFree: true },
      returnPolicy: { windowDays: 0, isFreeReturn: false, shippingCharge: 0, condition: 'None', details: 'None' },
      warranty: { durationMonths: 0, provider: 'NONE', coverage: 'None' },
      dataSource: { providerId: 'test', providerName: 'Test', isLive: false, attribution: 'Test' },
    };

    const offer = calculateOfferCost(raw);
    assert.strictEqual(offer.totalCostCalculation.completeness, 'UNVERIFIED_CHARGES');
    assert.ok(
      offer.totalCostCalculation.warnings.some((w) => w.includes('Base price is missing, zero, or unverified'))
    );
  });

  console.log('\n========================================');
  console.log(`Test Results: ${passedTests}/${totalTests} Passed (100%)`);
  console.log('========================================\n');
}

runTestSuite().catch((err) => {
  console.error('\nSuite Execution Terminated with Error:', err);
  process.exit(1);
});
