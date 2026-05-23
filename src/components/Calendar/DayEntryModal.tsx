import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { DayEntry, Prices } from '../../types';
import { SERVICE_TYPES, SERVICE_LABELS, SERVICE_EMOJIS, SERVICE_COLORS, totalEarnings } from '../../types';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface Props {
  year: number;
  month: number;
  day: number;
  initial: DayEntry | undefined;
  prices: Prices;
  onSave: (entry: DayEntry) => void;
  onClose: () => void;
}

export function DayEntryModal({ year, month, day, initial, prices, onSave, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    cabelo: String(initial?.cabelo ?? ''),
    combo: String(initial?.combo ?? ''),
    barba: String(initial?.barba ?? ''),
    premium: String(initial?.premium ?? ''),
  });

  const toNum = (s: string) => Math.min(999, Math.max(0, parseInt(s, 10) || 0));

  const entry: DayEntry = {
    year, month, day,
    cabelo: toNum(values.cabelo),
    combo: toNum(values.combo),
    barba: toNum(values.barba),
    premium: toNum(values.premium),
  };

  const totalQty = entry.cabelo + entry.combo + entry.barba + entry.premium;
  const totalVal = totalEarnings(entry, prices);

  const handleSave = () => {
    onSave(entry);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-950 border border-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800">
          <div>
            <p className="text-white font-bold text-lg">
              {MONTH_NAMES[month - 1]}, dia {day}
            </p>
            <p className="text-gray-400 text-sm">{year}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Service inputs */}
        <div className="px-5 py-4 space-y-3">
          {SERVICE_TYPES.map(type => (
            <div key={type} className="flex items-center gap-3">
              <div className="w-8 text-center text-lg">{SERVICE_EMOJIS[type]}</div>
              <div className="flex-1">
                <span className="text-gray-300 text-sm">{SERVICE_LABELS[type]}</span>
                <span className="text-gray-600 text-xs ml-2">
                  R$ {prices[type].toFixed(0)} / un
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setValues(v => ({ ...v, [type]: String(Math.max(0, toNum(v[type]) - 1)) }))}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
                >−</button>
                <input
                  type="number"
                  min="0"
                  max="999"
                  inputMode="numeric"
                  value={values[type]}
                  onChange={e => setValues(v => ({ ...v, [type]: e.target.value }))}
                  className="w-12 text-center bg-gray-900 border border-gray-700 text-white font-bold rounded-lg py-1.5 text-sm focus:outline-none focus:border-yellow-500"
                  style={{ borderColor: values[type] && toNum(values[type]) > 0 ? SERVICE_COLORS[type] : undefined }}
                />
                <button
                  onClick={() => setValues(v => ({ ...v, [type]: String(Math.min(999, toNum(v[type]) + 1)) }))}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
                >+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + Save */}
        <div className="px-5 pb-5 pt-2 border-t border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">{totalQty} cortes</span>
            <span className="text-yellow-400 font-bold text-lg">
              R$ {totalVal.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Salvar dia
          </button>
        </div>
      </div>
    </div>
  );
}
