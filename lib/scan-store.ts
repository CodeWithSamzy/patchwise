import type { ScanResult } from "@/lib/analyzer";

type StoredScan = {
  result: ScanResult;
  expiresAt: number;
};

declare global {
  var __patchwiseScans: Map<string, StoredScan> | undefined;
}

const scans = globalThis.__patchwiseScans ?? new Map<string, StoredScan>();
globalThis.__patchwiseScans = scans;

const ttlMs = 30 * 60 * 1000;
const maxStoredScans = 500;

function removeExpired(): void {
  const now = Date.now();
  for (const [id, scan] of scans.entries()) {
    if (scan.expiresAt <= now) scans.delete(id);
  }
}

export function saveScan(result: ScanResult): void {
  removeExpired();
  if (scans.size >= maxStoredScans) {
    const oldestId = scans.keys().next().value;
    if (oldestId) scans.delete(oldestId);
  }
  scans.set(result.id, {
    result,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getScan(id: string): ScanResult | null {
  removeExpired();
  return scans.get(id)?.result ?? null;
}
