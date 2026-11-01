import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { DayEntry, Prices, ServiceDef } from '../../types';
import { findService, totalEarnings } from '../../types';

interface Props {
  entries: DayEntry[];
  allServices: ServiceDef[];
  prices: Prices;
  year: number;
  month: number;
}

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl min-w-[140px]">
      <p className="text-yellow-400 font-bold mb-2">Dia {label}</p>
      {payload.map((p: any) => (
        p.value > 0 && (
          <div key={p.dataKey} className="flex justify-between gap-3">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="text-white font-mono">
              {p.dataKey === 'earnings'
                ? `R$ ${Number(p.value).toFixed(0)}`
                : p.value}
            </span>
          </div>
        )
      ))}
    </div>
  );
};

export function PerformanceChart({ entries, allServices, prices, year, month }: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();

  // Tipos que de fato aparecem nos lançamentos do mês — cada um vira uma
  // série empilhada no gráfico, sem depender de uma lista fixa de 4.
  const typesPresent = Array.from(
    new Set(entries.flatMap(e => Object.keys(e.counts).filter(t => e.counts[t] > 0)))
  ).sort((a, b) => findService(allServices, a).sortOrder - findService(allServices, b).sortOrder);

  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const entry = entries.find(e => e.day === day);
    const row: Record<string, number> = { day };
    typesPresent.forEach(t => { row[t] = entry?.counts[t] ?? 0; });
    row.earnings = entry ? totalEarnings(entry, prices) : 0;
    return row;
  }).filter(d => typesPresent.some(t => d[t] > 0));

  if (data.length === 0 || typesPresent.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-500 text-sm">Sem dados para exibir no gráfico.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-yellow-500 font-semibold uppercase tracking-wider text-xs">
          Quantidade × Valor — {MONTH_NAMES[month - 1]}/{year}
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis yAxisId="qty" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis yAxisId="val" orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }}
            tickFormatter={v => `R$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
          />
          {/* Stacked quantity bars */}
          {typesPresent.map(type => {
            const service = findService(allServices, type);
            return (
              <Bar
                key={type}
                yAxisId="qty"
                dataKey={type}
                name={service.label}
                stackId="qty"
                fill={service.color}
                fillOpacity={0.85}
              />
            );
          })}
          {/* Earnings line */}
          <Line
            yAxisId="val"
            type="monotone"
            dataKey="earnings"
            name="Valor (R$)"
            stroke="#ffffff"
            strokeWidth={2}
            dot={{ fill: '#ffffff', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
