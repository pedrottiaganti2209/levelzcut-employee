export interface ServiceDef {
  type: string;
  label: string;
  emoji: string;
  color: string;
  price: number;
  sortOrder: number;
  isCore: boolean;
  archived: boolean;
}

export interface DayEntry {
  year: number;
  month: number;
  day: number;
  counts: Record<string, number>;
}

export type Prices = Record<string, number>;

// Usado só como estado inicial enquanto os dados do barbeiro carregam (ou
// como fallback se, por algum motivo, a conta não tiver nenhuma linha em
// employee_prices ainda) — depois de carregado, a lista real vem do banco,
// já incluindo qualquer serviço que o barbeiro tenha adicionado.
export const DEFAULT_SERVICES: ServiceDef[] = [
  { type: 'cabelo', label: 'Cabelo', emoji: '✂️', color: '#D4AF37', price: 40, sortOrder: 0, isCore: true, archived: false },
  { type: 'combo', label: 'Combo', emoji: '🔥', color: '#f97316', price: 70, sortOrder: 1, isCore: true, archived: false },
  { type: 'barba', label: 'Barba', emoji: '🧔', color: '#60a5fa', price: 30, sortOrder: 2, isCore: true, archived: false },
  { type: 'premium', label: 'Premium', emoji: '⭐', color: '#a855f7', price: 90, sortOrder: 3, isCore: true, archived: false },
];

// Sugestões rápidas na tela de Valores — toque pra já preencher nome + ícone.
export const SERVICE_SUGGESTIONS: { label: string; emoji: string }[] = [
  { label: 'Sobrancelha', emoji: '👁️' },
  { label: 'Pezinho', emoji: '🦶' },
  { label: 'Depilação nariz', emoji: '👃' },
  { label: 'Orelha', emoji: '👂' },
];

export const EMOJI_PALETTE = ['✂️', '🔥', '🧔', '⭐', '💈', '🪒', '👁️', '🦶', '👃', '👂', '💆', '🧖'];

const COLOR_PALETTE = ['#D4AF37', '#f97316', '#60a5fa', '#a855f7', '#34d399', '#f472b6', '#38bdf8', '#fb923c'];

export function nextColor(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

// Vira a chave estável (service_type) salva no banco a partir do nome que
// o barbeiro digitou — minúsculo, sem acento, sem espaço.
export function slugify(label: string): string {
  const base = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return base || 'servico';
}

// Serviço pode ter sido removido (arquivado) depois de já ter dado origem
// a lançamentos antigos — esses lançamentos continuam existindo no
// `counts`, então qualquer tela que itera por chave de counts precisa de
// um jeito de mostrar algo mesmo sem achar a definição (caso raríssimo).
export function findService(services: ServiceDef[], type: string): ServiceDef {
  return (
    services.find(s => s.type === type) ?? {
      type,
      label: type,
      emoji: '❔',
      color: '#6b7280',
      price: 0,
      sortOrder: 999,
      isCore: false,
      archived: true,
    }
  );
}

export const TRACKING_START = { year: 2026, month: 4 }; // April 2026

export function totalCuts(entry: DayEntry): number {
  return Object.values(entry.counts).reduce((s, v) => s + v, 0);
}

export function totalEarnings(entry: DayEntry, prices: Prices): number {
  return Object.entries(entry.counts).reduce((s, [type, qty]) => s + qty * (prices[type] ?? 0), 0);
}
