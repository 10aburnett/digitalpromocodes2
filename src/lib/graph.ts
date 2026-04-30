// src/lib/graph.ts
// Import JSON directly - bundled with serverless functions, no filesystem read needed
import neighborsData from '@/data/graph/neighbors.json';

export type NeighborData = { recommendations: string[]; alternatives: string[]; explore?: string };
export type NeighborsMap = Record<string, NeighborData>;

const GRAPH_URL =
  (process.env.NEXT_PUBLIC_GRAPH_URL && process.env.NEXT_PUBLIC_GRAPH_URL.trim()) ||
  '/data/graph/neighbors.json';

const GRAPH_VER = process.env.NEXT_PUBLIC_GRAPH_VERSION || '';

export async function loadNeighbors(): Promise<NeighborsMap> {
  // Server-side (including development): use imported JSON (bundled with serverless function)
  // This guarantees data is available on every cold start and matches production behavior
  if (typeof window === 'undefined') {
    console.log('[graph] Using bundled neighbors data:', Object.keys(neighborsData).length, 'entries');
    return neighborsData as NeighborsMap;
  }

  // Client-side only: fetch from relative URL (same domain, no circular issue)
  const url = GRAPH_VER
    ? `${GRAPH_URL}${GRAPH_URL.includes('?') ? '&' : '?'}v=${encodeURIComponent(GRAPH_VER)}`
    : GRAPH_URL;

  console.debug('[graph] url in browser:', url);
  (window as any).__WHOP_GRAPH_URL = url;

  // Use 'force-cache' for stable SSR/hydration - Next.js will use same cached data
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Graph fetch failed ${res.status}`);

  const data = await res.json();
  const keys = Object.keys(data).length;

  // Debug logging (only when NEXT_PUBLIC_DEBUG is enabled)
  const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';

  if (isDebug) {
    console.log('[graph] Loaded:', {
      url,
      keys,
      version: GRAPH_VER,
      sampleKeys: Object.keys(data).slice(0, 3),
      env: process.env.NODE_ENV
    });
  }

  (window as any).__graphDebug = {
    url,
    keys,
    version: GRAPH_VER,
    timestamp: new Date().toISOString()
  };

  return data;
}

export function getNeighborSlugsFor(
  neighbors: Record<string, { recommendations?: string[]; alternatives?: string[]; explore?: string }>,
  slug: string,
  kind: 'recommendations'|'alternatives'
): string[] {
  // Just lowercase, don't strip hyphens - graph keys may have trailing hyphens
  const s = slug.toLowerCase();
  const entry = neighbors[s] || neighbors[decodeURIComponent(s)] || neighbors[s.replace(/\s+/g,'-')];
  if (!entry) return [];
  const arr = (entry[kind] || []).filter(Boolean);
  return Array.from(new Set(arr)); // de-dup
}

export function getExploreFor(
  neighbors: Record<string, { recommendations?: string[]; alternatives?: string[]; explore?: string }>,
  slug: string
): string | null {
  // Just lowercase, don't strip hyphens - graph keys may have trailing hyphens
  const s = slug.toLowerCase();
  const entry = neighbors[s] || neighbors[decodeURIComponent(s)] || neighbors[s.replace(/\s+/g,'-')];
  return entry?.explore || null;
}
