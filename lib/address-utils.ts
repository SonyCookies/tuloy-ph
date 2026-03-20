/**
 * address-utils.ts
 * Utility functions to handle Philippine address lookups from public JSON files.
 */

export interface Region {
  region_code: string;
  region_name: string;
}

export interface Province {
  province_code: string;
  province_name: string;
  region_code: string;
}

export interface City {
  city_code: string;
  city_name: string;
  province_code: string;
}

export interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
}

// Caches for fetched data
let regionsCache: Region[] | null = null;
let provincesCache: Province[] | null = null;
let citiesCache: City[] | null = null;
let barangaysCache: Barangay[] | null = null;

const fetchData = async <T>(url: string): Promise<T[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

export const getRegions = async (): Promise<Region[]> => {
  if (!regionsCache) regionsCache = await fetchData<Region>('/ph-json/region.json');
  return regionsCache;
};

export const getProvinces = async (): Promise<Province[]> => {
  if (!provincesCache) provincesCache = await fetchData<Province>('/ph-json/province.json');
  return provincesCache;
};

export const getCities = async (): Promise<City[]> => {
  if (!citiesCache) citiesCache = await fetchData<City>('/ph-json/city.json');
  return citiesCache;
};

/**
 * Note: barangay.json is large (~4.7MB). 
 * This function will fetch and cache it in memory once called.
 */
export const getBarangays = async (): Promise<Barangay[]> => {
  if (!barangaysCache) barangaysCache = await fetchData<Barangay>('/ph-json/barangay.json');
  return barangaysCache;
};

export const getRegionName = async (code: string): Promise<string> => {
  if (!code) return '';
  const data = await getRegions();
  return data.find(r => r.region_code === code)?.region_name || code;
};

export const getProvinceName = async (code: string): Promise<string> => {
  if (!code) return '';
  const data = await getProvinces();
  return data.find(p => p.province_code === code)?.province_name || code;
};

export const getCityName = async (code: string): Promise<string> => {
  if (!code) return '';
  const data = await getCities();
  return data.find(c => c.city_code === code)?.city_name || code;
};

export const getBarangayName = async (code: string): Promise<string> => {
  if (!code) return '';
  const data = await getBarangays();
  return data.find(b => b.brgy_code === code)?.brgy_name || code;
};

/**
 * Convenience function to get all names at once.
 */
export const getFullAddress = async (codes: {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
}) => {
  const [region, province, city, barangay] = await Promise.all([
    getRegionName(codes.region || ''),
    getProvinceName(codes.province || ''),
    getCityName(codes.city || ''),
    getBarangayName(codes.barangay || ''),
  ]);

  return { region, province, city, barangay };
};
