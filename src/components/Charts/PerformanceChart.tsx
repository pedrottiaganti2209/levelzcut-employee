import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { DayEntry, Prices } from '../../types';
import { SERVICE_COLORS, SERVICE_LABELS, totalCuts, totalEarnings } from '../../types';

interface Props {
  entries: DayEntry[];
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

export function PerformanceChart({ entries, prices, year, month }: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();

  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const entry = entries.find(e => e.day === day);
    if (!entry || totalCuts(entry) === 0) return { day, cabelo: 0, combo: 0, barba: 0, premium: 0, earnings: 0 };
    return {
      day,
      cabelo: entry.cabelo,
      combo: entry.combo,
      barba: entry.barba,
      premium: entry.premium,
      earnings: totalEarnings(entry, prices),
    };
  }).filter(d => d.cabelo + d.combo + d.barba + d.premium > 0);

  if (data.length === 0) {
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
          {(['cabelo', 'combo', 'barba', 'premium'] as const).map(type => (
            <Bar
              key={type}
              yAxisId="qty"
              dataKey={type}
              name={SERVICE_LABELS[type]}
              stackId="qty"
              fill={SERVICE_COLORS[type]}
              fillOpacity={0.85}
            />
          ))}
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
