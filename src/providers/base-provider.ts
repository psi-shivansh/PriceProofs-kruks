/**
 * Base Provider Abstract Class & Interfaces for PriceProof
 * Allows cleanly plugging in new e-commerce APIs without rewriting comparison logic.
 */

import { Offer, ProviderDiagnostic } from '../types/product.ts';

export interface ProviderSearchResult {
  providerId: string;
  providerName: string;
  isLive: boolean;
  status: 'ACTIVE' | 'DEMO' | 'REQUIRES_AUTH' | 'RATE_LIMITED' | 'ERROR';
  offers: Offer[];
  latencyMs: number;
  message?: string;
}

export interface SearchOptions {
  timeoutMs?: number;
  limit?: number;
}

export abstract class BaseProductProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly isLive: boolean;
  abstract readonly docsUrl: string;
  abstract readonly authMethod: string;
  abstract readonly description: string;
  abstract readonly supportedRegions: string[];

  /**
   * Returns diagnostic info about configuration status and required environment variables
   */
  abstract getDiagnostic(): ProviderDiagnostic;

  /**
   * Search product offers
   */
  abstract search(query: string, options?: SearchOptions): Promise<ProviderSearchResult>;
}
