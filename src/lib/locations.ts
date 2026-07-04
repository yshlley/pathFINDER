// Loads Philippine Region → Province → City data at runtime from the
// PSGC.cloud CDN (a mirror of the PSA PSGC). Cached in memory.

export type Region = { code: string; name: string };
export type Province = { code: string; name: string; regionCode: string };
export type City = { code: string; name: string; provinceCode: string; regionCode: string };

const BASE = "https://psgc.gitlab.io/api";

let regionsCache: Region[] | null = null;
const provincesCache = new Map<string, Province[]>();
const citiesCache = new Map<string, City[]>();

async function safeJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(url);
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}

export async function loadRegions(): Promise<Region[]> {
  if (regionsCache) return regionsCache;
  const raw = await safeJson<Array<{ code: string; name: string }>>(`${BASE}/regions/`, []);
  regionsCache = raw.map((r) => ({ code: r.code, name: r.name }));
  return regionsCache;
}

export async function loadProvinces(regionCode: string): Promise<Province[]> {
  if (provincesCache.has(regionCode)) return provincesCache.get(regionCode)!;
  // NCR has districts instead of provinces
  const isNcr = regionCode.startsWith("13");
  const url = isNcr
    ? `${BASE}/regions/${regionCode}/districts/`
    : `${BASE}/regions/${regionCode}/provinces/`;
  const raw = await safeJson<Array<{ code: string; name: string }>>(url, []);
  const list = raw.map((p) => ({ code: p.code, name: p.name, regionCode }));
  provincesCache.set(regionCode, list);
  return list;
}

export async function loadCities(provinceCode: string, regionCode: string): Promise<City[]> {
  const key = provinceCode;
  if (citiesCache.has(key)) return citiesCache.get(key)!;
  const isNcr = regionCode.startsWith("13");
  const url = isNcr
    ? `${BASE}/districts/${provinceCode}/cities-municipalities/`
    : `${BASE}/provinces/${provinceCode}/cities-municipalities/`;
  const raw = await safeJson<Array<{ code: string; name: string }>>(url, []);
  const list = raw
    .map((c) => ({ code: c.code, name: c.name, provinceCode, regionCode }))
    .sort((a, b) => a.name.localeCompare(b.name));
  citiesCache.set(key, list);
  return list;
}