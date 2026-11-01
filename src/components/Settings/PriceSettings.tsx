import { useState } from 'react';
import { Check, DollarSign, Plus, Trash2 } from 'lucide-react';
import type { ServiceDef } from '../../types';
import { EMOJI_PALETTE, SERVICE_SUGGESTIONS } from '../../types';

interface Props {
  services: ServiceDef[]; // visíveis (não arquivados)
  onSavePrice: (type: string, price: number) => void;
  onAddService: (label: string, emoji: string) => Promise<string | null>;
  onRemoveService: (type: string) => void;
}

export function PriceSettings({ services, onSavePrice, onAddService, onRemoveService }: Props) {
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formLabel, setFormLabel] = useState('');
  const [formEmoji, setFormEmoji] = useState(EMOJI_PALETTE[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);

  const handleSave = (type: string) => {
    const val = parseFloat((editing[type] ?? '').replace(',', '.'));
    if (isNaN(val) || val < 0 || val > 9999.99) return;
    onSavePrice(type, Math.round(val * 100) / 100);
    setEditing(prev => { const n = { ...prev }; delete n[type]; return n; });
    setSaved(type);
    setTimeout(() => setSaved(null), 1500);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormLabel('');
    setFormEmoji(EMOJI_PALETTE[0]);
    setFormError(null);
  };

  const handleAdd = async () => {
    if (!formLabel.trim()) return;
    setSaving(true);
    setFormError(null);
    const error = await onAddService(formLabel.trim(), formEmoji);
    setSaving(false);
    if (error) {
      setFormError('Não foi possível adicionar. Tente de novo em instantes.');
      return;
    }
    closeForm();
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
        {services.map(service => {
          const type = service.type;
          const isEditing = editing[type] !== undefined;
          const isSaved = saved === type;
          const currentVal = editing[type] ?? service.price.toFixed(2).replace('.', ',');

          return (
            <div
              key={type}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
            >
              <span className="text-2xl">{service.emoji}</span>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{service.label}</p>
                <p className="text-gray-500 text-xs">por serviço realizado</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentVal}
                  maxLength={7}
                  onChange={e => setEditing(prev => ({ ...prev, [type]: e.target.value }))}
                  onFocus={() => setEditing(prev => ({
                    ...prev,
                    [type]: service.price.toFixed(2).replace('.', ','),
                  }))}
                  className="w-20 bg-black border border-gray-700 text-white text-right rounded-lg px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:border-yellow-500 transition-colors"
                  style={{ borderColor: isEditing ? service.color : undefined }}
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

                {!service.isCore && (
                  confirmingRemove === type ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { onRemoveService(type); setConfirmingRemove(null); }}
                        className="text-xs text-red-400 hover:text-red-300 px-1.5 py-1 uppercase tracking-wide font-semibold"
                      >
                        Remover
                      </button>
                      <button
                        onClick={() => setConfirmingRemove(null)}
                        className="text-xs text-gray-500 hover:text-gray-300 px-1.5 py-1"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingRemove(type)}
                      aria-label={`Remover ${service.label}`}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Adicionar novo serviço */}
      <div>
        {!formOpen ? (
          <button
            onClick={() => setFormOpen(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-600 rounded-xl py-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider hover:border-yellow-600 hover:text-yellow-500 transition-colors"
          >
            <Plus size={15} />
            Adicionar novo serviço
          </button>
        ) : (
          <div className="bg-gray-900 border border-yellow-700 rounded-xl p-4 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="new-service-label" className="text-gray-400 text-xs uppercase tracking-wider">
                Nome do serviço
              </label>
              <input
                id="new-service-label"
                type="text"
                value={formLabel}
                onChange={e => setFormLabel(e.target.value)}
                placeholder="Ex: Sobrancelha"
                maxLength={40}
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-gray-500 text-xs uppercase tracking-wider">Sugestões rápidas</span>
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_SUGGESTIONS.map(s => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => { setFormLabel(s.label); setFormEmoji(s.emoji); }}
                    className="bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs text-gray-300 hover:border-yellow-600 transition-colors"
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-gray-500 text-xs uppercase tracking-wider">Ícone</span>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_PALETTE.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setFormEmoji(e)}
                    aria-label={`Usar ícone ${e}`}
                    className={`w-9 h-9 flex items-center justify-center text-lg rounded-lg border transition-colors ${
                      formEmoji === e ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 bg-black'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-red-400 text-xs text-center bg-red-900/20 border border-red-800 rounded-lg py-2 px-3">
                {formError}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex-1 text-xs text-gray-400 hover:text-gray-200 uppercase tracking-wider py-2.5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!formLabel.trim() || saving}
                className="flex-[2] bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold rounded-lg py-2.5 text-xs uppercase tracking-wider transition-colors"
              >
                {saving ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Simulação — 1 de cada</p>
        <div className="grid grid-cols-2 gap-2">
          {services.map(service => (
            <div key={service.type} className="flex justify-between text-sm">
              <span className="text-gray-400">{service.emoji} {service.label}</span>
              <span className="text-white font-mono">
                R$ {service.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between">
          <span className="text-gray-400 text-sm">Total</span>
          <span className="text-yellow-400 font-bold">
            R$ {services.reduce((s, v) => s + v.price, 0).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>
  );
}
