import { useState } from 'react';
import { Check, DollarSign } from 'lucide-react';
import type { Prices, ServiceType } from '../../types';
import { SERVICE_TYPES, SERVICE_LABELS, SERVICE_EMOJIS, SERVICE_COLORS } from '../../types';

interface Props {
  prices: Prices;
  onSave: (type: ServiceType, price: number) => void;
}

export function PriceSettings({ prices, onSave }: Props) {
  const [editing, setEditing] = useState<Partial<Record<ServiceType, string>>>({});
  const [saved, setSaved] = useState<ServiceType | null>(null);

  const handleSave = (type: ServiceType) => {
    const val = parseFloat((editing[type] ?? '').replace(',', '.'));
    if (isNaN(val) || val < 0) return;
    onSave(type, val);
    setEditing(prev => { const n = { ...prev }; delete n[type]; return n; });
    setSaved(type);
    setTimeout(() => setSaved(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-yellow-500 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
          <DollarSign size={14} />
          Valores por Serviço
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          Configure o valor que você recebe por cada tipo de corte.
        </p>
      </div>

      <div className="space-y-3">
        {SERVICE_TYPES.map(type => {
          const isEditing = editing[type] !== undefined;
          const isSaved = saved === type;
          const currentVal = editing[type] ?? prices[type].toFixed(2).replace('.', ',');

          return (
            <div
              key={type}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
            >
              <span className="text-2xl">{SERVICE_EMOJIS[type]}</span>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{SERVICE_LABELS[type]}</p>
                <p className="text-gray-500 text-xs">por serviço realizado</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentVal}
                  onChange={e => setEditing(prev => ({ ...prev, [type]: e.target.value }))}
                  onFocus={() => setEditing(prev => ({
                    ...prev,
                    [type]: prices[type].toFixed(2).replace('.', ','),
                  }))}
                  className="w-20 bg-black border border-gray-700 text-white text-right rounded-lg px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:border-yellow-500 transition-colors"
                  style={{ borderColor: isEditing ? SERVICE_COLORS[type] : undefined }}
                />
                <button
                  onClick={() => handleSave(type)}
                  disabled={!isEditing}
                  className={`
                    p-1.5 rounded-lg transition-colors
                    ${isSaved
                      ? 'bg-green-800/40 text-green-400'
                      : isEditing
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-black'
                        : 'text-gray-700 cursor-default'
                    }
                  `}
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Simulação — 1 de cada</p>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_TYPES.map(type => (
            <div key={type} className="flex justify-between text-sm">
              <span className="text-gray-400">{SERVICE_EMOJIS[type]} {SERVICE_LABELS[type]}</span>
              <span className="text-white font-mono">
                R$ {prices[type].toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between">
          <span className="text-gray-400 text-sm">Total</span>
          <span className="text-yellow-400 font-bold">
            R$ {Object.values(prices).reduce((s, v) => s + v, 0).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>
  );
}
