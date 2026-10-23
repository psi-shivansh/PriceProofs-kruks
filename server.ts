/**
 * PriceProof Full-Stack Backend Server
 * Express 4 API server with Vite middleware integration.
 * Runs on port 3000.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { globalProviderRegistry } from './src/providers/provider-registry.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// ---------------------------------------------------------------------------
// REST API Endpoints
// ---------------------------------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'PriceProof API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Provider diagnostics endpoint
 * Explains exactly which providers are genuinely integrated and which require credentials or approval.
 */
app.get('/api/providers', (req: Request, res: Response) => {
  try {
    const diagnostics = globalProviderRegistry.getDiagnostics();
    res.json({
      success: true,
      providers: diagnostics,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider diagnostics',
      details: err.message,
    });
  }
});

/**
 * Product Search Endpoint
 * GET /api/search?q=wireless+headphones&providers=demo_provider,dummyjson_live
 */
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const providersParam = req.query.providers as string;
    const includeDemoParam = req.query.includeDemo as string;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing search query parameter "q".',
      });
      return;
    }

    const enabledProviderIds = providersParam
      ? providersParam.split(',').map((s) => s.trim())
      : undefined;

    const includeDemo = includeDemoParam !== undefined ? includeDemoParam === 'true' : true;

    const searchResult = await globalProviderRegistry.search(query, {
      timeoutMs: 6500,
      enabledProviderIds,
      includeDemo,
    });

    res.json({
      success: true,
      data: searchResult,
    });
  } catch (err: any) {
    console.error('[Search API Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error while processing price comparison search.',
      details: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// Vite Dev Middleware / Static Assets Handling
// ---------------------------------------------------------------------------

async function setupServer() {
  if (!isProduction) {
    // Development mode: attach Vite middleware for instant HMR / bundling
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[PriceProof] Dev server mounted with Vite middleware.');
  } else {
    // Production mode: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PriceProof] Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('[PriceProof] Server startup failure:', err);
  process.exit(1);
});
