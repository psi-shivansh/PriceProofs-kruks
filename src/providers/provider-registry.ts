/**
 * PriceProof Provider Registry & Orchestrator
 * Coordinates parallel multi-provider searches, aggregates results,
 * calculates total true costs, and isolates faults so single provider failures
 * never take down the application.
 */

import { groupAndRankOffers } from '../core/cost-calculator.ts';
import { Offer, ProviderDiagnostic, SearchResultResponse } from '../types/product.ts';
import { AmazonPaapiProvider } from './amazon-paapi-provider.ts';
import { BaseProductProvider, ProviderSearchResult } from './base-provider.ts';
import { DemoProductProvider } from './demo-provider.ts';
import { DummyJsonLiveProvider } from './dummyjson-live-provider.ts';
import { FlipkartAffiliateProvider } from './flipkart-affiliate-provider.ts';

export class ProviderRegistry {
  private providers: Map<string, BaseProductProvider> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.register(new DemoProductProvider());
    this.register(new DummyJsonLiveProvider());
    this.register(new AmazonPaapiProvider());
    this.register(new FlipkartAffiliateProvider());
  }

  register(provider: BaseProductProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): BaseProductProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): BaseProductProvider[] {
    return Array.from(this.providers.values());
  }

  getDiagnostics(): ProviderDiagnostic[] {
    return this.getAllProviders().map((p) => p.getDiagnostic());
  }

  /**
   * Orchestrates multi-provider search with timeout protection and fault isolation
   */
  async search(
    query: string,
    options?: {
      timeoutMs?: number;
      enabledProviderIds?: string[];
      includeDemo?: boolean;
    }
  ): Promise<SearchResultResponse> {
    const trimmedQuery = (query || '').trim();
    const startTime = new Date().toISOString();

    if (!trimmedQuery) {
      return {
        query: '',
        totalProducts: 0,
        totalOffers: 0,
        products: [],
        providersSummary: this.getAllProviders().map((p) => ({
          id: p.id,
          name: p.name,
          isLive: p.isLive,
          status: p.isLive ? 'ACTIVE' : 'DEMO',
          offersCount: 0,
          latencyMs: 0,
        })),
        searchedAt: startTime,
      };
    }

    // Determine target providers
    const targetProviders = this.getAllProviders().filter((provider) => {
      if (options?.enabledProviderIds && options.enabledProviderIds.length > 0) {
        return options.enabledProviderIds.includes(provider.id);
      }
      // By default query demo and active live providers
      if (!options?.includeDemo && options?.includeDemo === false && !provider.isLive) {
        return false;
      }
      return true;
    });

    // Execute provider queries in parallel with individual error protection
    const searchPromises = targetProviders.map(async (provider): Promise<ProviderSearchResult> => {
      const pStart = Date.now();
      try {
        return await provider.search(trimmedQuery, {
          timeoutMs: options?.timeoutMs || 6000,
        });
      } catch (err: any) {
        return {
          providerId: provider.id,
          providerName: provider.name,
          isLive: provider.isLive,
          status: 'ERROR',
          offers: [],
          latencyMs: Date.now() - pStart,
          message: `Provider exception: ${err?.message || 'Unknown failure'}`,
        };
      }
    });

    const results = await Promise.all(searchPromises);

    // Aggregate all offers
    const allOffers: Offer[] = [];
    const providersSummary = results.map((res) => {
      allOffers.push(...res.offers);
      return {
        id: res.providerId,
        name: res.providerName,
        isLive: res.isLive,
        status: res.status,
        offersCount: res.offers.length,
        latencyMs: res.latencyMs,
        message: res.message,
      };
    });

    // Group and rank offers by comparable total known cost
    const products = groupAndRankOffers(allOffers);

    return {
      query: trimmedQuery,
      totalProducts: products.length,
      totalOffers: allOffers.length,
      products,
      providersSummary,
      searchedAt: new Date().toISOString(),
    };
  }
}

// Global Singleton for server and testing
export const globalProviderRegistry = new ProviderRegistry();
