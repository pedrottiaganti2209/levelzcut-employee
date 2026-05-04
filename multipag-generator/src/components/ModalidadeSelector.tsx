import type { TipoModalidade } from '../types/pagamento';
import { MODALIDADES } from '../types/pagamento';

interface Props {
  value: TipoModalidade;
  onChange: (value: TipoModalidade) => void;
}

const categoryColors: Record<string, string> = {
  fornecedores: 'text-blue-700 bg-blue-50 border-blue-200',
  salarios: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  tributos: 'text-amber-700 bg-amber-50 border-amber-200',
  pix: 'text-purple-700 bg-purple-50 border-purple-200',
};

export function ModalidadeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
        Modalidade de Pagamento <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(MODALIDADES).map(([catKey, cat]) => (
          <div key={catKey} className={`rounded-xl border p-3 ${categoryColors[catKey]}`}>
            <p className="text-xs font-bold mb-2 uppercase tracking-wide">{cat.label}</p>
            <div className="space-y-1">
              {cat.items.map((item) => (
                <label key={item.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="modalidade"
                    value={item.value}
                    checked={value === item.value}
                    onChange={() => onChange(item.value)}
                    className="accent-red-700 w-3.5 h-3.5"
                  />
                  <span className={`text-xs leading-tight ${value === item.value ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
