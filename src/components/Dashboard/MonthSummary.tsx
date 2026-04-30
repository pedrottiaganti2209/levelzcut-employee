import type { DayEntry, Prices } from '../../types';
import { SERVICE_TYPES, SERVICE_LABELS, SERVICE_EMOJIS, SERVICE_COLORS, totalCuts, totalEarnings } from '../../types';

interface Props {
  entries: DayEntry[];
  prices: Prices;
  year?: number;
  month: number;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function MonthSummary({ entries, prices, month }: Props) {
  const totalQty = entries.reduce((s, e) => s + totalCuts(e), 0);
  const totalVal = entries.reduce((s, e) => s + totalEarnings(e, prices), 0);
  const daysWorked = entries.filter(e => totalCuts(e) > 0).length;
  const avgPerDay = daysWorked > 0 ? totalVal / daysWorked : 0;
  const avgQtyPerDay = daysWorked > 0 ? totalQty / daysWorked : 0;

  const serviceTotals = { cabelo: 0, combo: 0, barba: 0, premium: 0 };
  entries.forEach(e => {
    serviceTotals.cabelo += e.cabelo;
    serviceTotals.combo += e.combo;
    serviceTotals.barba += e.barba;
    serviceTotals.premium += e.premium;
  });

  if (totalQty === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">Sem cortes registrados em {MONTH_NAMES[month - 1]}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total recebido</p>
          <p className="text-yellow-400 font-bold text-2xl">R$ {fmt(totalVal)}</p>
          <p className="text-gray-600 text-xs mt-0.5">{daysWorked} dias trabalhados</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total de cortes</p>
          <p className="text-white font-bold text-2xl">{totalQty}</p>
          <p className="text-gray-600 text-xs mt-0.5">~{avgQtyPerDay.toFixed(1)} / dia</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Média por dia</p>
          <p className="text-green-400 font-bold text-2xl">R$ {fmt(avgPerDay)}</p>
          <p className="text-gray-600 text-xs mt-0.5">dias com cortes</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ticket médio</p>
          <p className="text-blue-400 font-bold text-2xl">
            R$ {fmt(totalQty > 0 ? totalVal / totalQty : 0)}
          </p>
          <p className="text-gray-600 text-xs mt-0.5">por corte</p>
        </div>
      </div>

      {/* Per-service breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Por tipo de serviço</p>
        <div className="space-y-2.5">
          {SERVICE_TYPES.map(type => {
            const qty = serviceTotals[type];
            const val = qty * prices[type];
            const pct = totalQty > 0 ? (qty / totalQty) * 100 : 0;
            if (qty === 0) return null;
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <span>{SERVICE_EMOJIS[type]}</span>
                    {SERVICE_LABELS[type]}
                  </span>
                  <div className="text-right">
                    <span className="text-white font-mono text-sm font-bold">{qty}×</span>
                    <span className="text-gray-500 text-xs ml-2">R$ {fmt(val)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: SERVICE_COLORS[type] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
