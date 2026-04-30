export type ServiceType = 'cabelo' | 'combo' | 'barba' | 'premium';

export const SERVICE_TYPES: ServiceType[] = ['cabelo', 'combo', 'barba', 'premium'];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  cabelo: 'Cabelo',
  combo: 'Combo',
  barba: 'Barba',
  premium: 'Premium',
};

export const SERVICE_EMOJIS: Record<ServiceType, string> = {
  cabelo: '✂️',
  combo: '🔥',
  barba: '🧔',
  premium: '⭐',
};

export const SERVICE_COLORS: Record<ServiceType, string> = {
  cabelo: '#D4AF37',   // gold
  combo: '#f97316',   // orange
  barba: '#60a5fa',   // blue
  premium: '#a855f7', // purple
};

export interface DayEntry {
  year: number;
  month: number;
  day: number;
  cabelo: number;
  combo: number;
  barba: number;
  premium: number;
}

export interface Prices {
  cabelo: number;
  combo: number;
  barba: number;
  premium: number;
}

export const DEFAULT_PRICES: Prices = {
  cabelo: 40,
  combo: 70,
  barba: 30,
  premium: 90,
};

export const TRACKING_START = { year: 2026, month: 5 }; // May 2026

export function totalCuts(entry: DayEntry): number {
  return entry.cabelo + entry.combo + entry.barba + entry.premium;
}

export function totalEarnings(entry: DayEntry, prices: Prices): number {
  return (
    entry.cabelo * prices.cabelo +
    entry.combo * prices.combo +
    entry.barba * prices.barba +
    entry.premium * prices.premium
  );
}
