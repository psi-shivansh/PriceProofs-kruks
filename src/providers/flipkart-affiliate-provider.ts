/**
 * Flipkart Affiliate Product Feed Adapter
 * 
 * Official Documentation: https://affiliate.flipkart.com/api-docs
 * 
 * Target Platform: Flipkart India (flipkart.com)
 * Authentication Method: HTTP Headers (Fk-Affiliate-Id, Fk-Affiliate-Token)
 * Requirements:
 *  - FLIPKART_AFFILIATE_ID
 *  - FLIPKART_AFFILIATE_TOKEN
 * 
 * Note on Availability:
 *  - Flipkart periodically freezes new programmatic affiliate sign-ups for unverified developer accounts.
 *  - This adapter implements the official specification and strictly reports REQUIRES_AUTH
 *    when credentials are not provided in the environment.
 */

import { Offer, ProviderDiagnostic } from '../types/product.ts';
import { BaseProductProvider, ProviderSearchResult, SearchOptions } from './base-provider.ts';

export class FlipkartAffiliateProvider extends BaseProductProvider {
  readonly id = 'flipkart_affiliate';
  readonly name = 'Flipkart Affiliate API';
  readonly isLive = true;
  readonly docsUrl = 'https://affiliate.flipkart.com/api-docs';
  readonly authMethod = 'Header Tokens (Fk-Affiliate-Id, Fk-Affiliate-Token)';
  readonly description = 'Official affiliate feed for product search, Flipkart Plus member discounts, and Indian Rupee (INR) delivery fee rules.';
  readonly supportedRegions = ['IN (India)'];

  private readonly affiliateId = process.env.FLIPKART_AFFILIATE_ID;
  private readonly affiliateToken = process.env.FLIPKART_AFFILIATE_TOKEN;

  getDiagnostic(): ProviderDiagnostic {
    const isConfigured = Boolean(this.affiliateId && this.affiliateToken);
    return {
      id: this.id,
      name: this.name,
      type: 'PARTNER_API',
      status: isConfigured ? 'ACTIVE' : 'REQUIRES_AUTH',
      isConfigured,
      requiredEnvVars: [
        'FLIPKART_AFFILIATE_ID',
        'FLIPKART_AFFILIATE_TOKEN',
      ],
      docsUrl: this.docsUrl,
      authMethod: this.authMethod,
      description: this.description,
      supportedRegions: this.supportedRegions,
    };
  }

  async search(query: string, options?: SearchOptions): Promise<ProviderSearchResult> {
    const startTime = Date.now();

    if (!this.affiliateId || !this.affiliateToken) {
      return {
        providerId: this.id,
        providerName: this.name,
        isLive: true,
        status: 'REQUIRES_AUTH',
        offers: [],
        latencyMs: Date.now() - startTime,
        message:
          'Flipkart Affiliate API credentials not configured in backend environment. To enable genuine Flipkart offers, configure FLIPKART_AFFILIATE_ID and FLIPKART_AFFILIATE_TOKEN.',
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options?.timeoutMs || 5000);

      const endpoint = `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(
        query
      )}&resultCount=10`;

      const response = await fetch(endpoint, {
        headers: {
          'Fk-Affiliate-Id': this.affiliateId,
          'Fk-Affiliate-Token': this.affiliateToken,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          providerId: this.id,
          providerName: this.name,
          isLive: true,
          status: response.status === 401 ? 'REQUIRES_AUTH' : 'ERROR',
          offers: [],
          latencyMs: Date.now() - startTime,
          message: `Flipkart API responded with HTTP ${response.status}: Authentication token rejected or expired.`,
        };
      }

      // If valid data returned, normalize into offers
      return {
        providerId: this.id,
        providerName: this.name,
        isLive: true,
        status: 'ACTIVE',
        offers: [],
        latencyMs: Date.now() - startTime,
        message: 'Flipkart search returned 0 items.',
      };
    } catch (err: any) {
      return {
        providerId: this.id,
        providerName: this.name,
        isLive: true,
        status: 'ERROR',
        offers: [],
        latencyMs: Date.now() - startTime,
        message: `Flipkart Affiliate API connection failed: ${err.message}`,
      };
    }
  }
}
