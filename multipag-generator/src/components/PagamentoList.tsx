import { Trash2 } from 'lucide-react';
import type { Pagamento } from '../types/pagamento';

interface Props {
  pagamentos: Pagamento[];
  onRemove: (id: string) => void;
}

const MODALIDADE_LABEL: Record<string, string> = {
  'credito-conta': 'Crédito em Conta',
  'ted': 'TED',
  'boleto-bradesco': 'Boleto Bradesco',
  'boleto-outros': 'Boleto Outros Bancos',
  'codigo-barras': 'Código de Barras',
  'dda': 'DDA',
  'salario-conta': 'Salário (CC)',
  'salario-conta-salario': 'Conta-Salário',
  'darf': 'DARF',
  'gps': 'GPS',
  'gare-icms': 'GARE-ICMS',
  'gnre': 'GNRE',
  'fgts': 'FGTS',
  'pix-chave': 'PIX Chave',
  'pix-qrcode': 'PIX QR Code',
  'ted-to-pix': 'TED→PIX',
};

const MODALIDADE_COLOR: Record<string, string> = {
  'credito-conta': 'bg-blue-100 text-blue-800',
  'ted': 'bg-blue-100 text-blue-800',
  'boleto-bradesco': 'bg-blue-100 text-blue-800',
  'boleto-outros': 'bg-blue-100 text-blue-800',
  'codigo-barras': 'bg-blue-100 text-blue-800',
  'dda': 'bg-blue-100 text-blue-800',
  'salario-conta': 'bg-emerald-100 text-emerald-800',
  'salario-conta-salario': 'bg-emerald-100 text-emerald-800',
  'darf': 'bg-amber-100 text-amber-800',
  'gps': 'bg-amber-100 text-amber-800',
  'gare-icms': 'bg-amber-100 text-amber-800',
  'gnre': 'bg-amber-100 text-amber-800',
  'fgts': 'bg-amber-100 text-amber-800',
  'pix-chave': 'bg-purple-100 text-purple-800',
  'pix-qrcode': 'bg-purple-100 text-purple-800',
  'ted-to-pix': 'bg-purple-100 text-purple-800',
};

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(d: string) {
  if (!d) return '-';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function getDescricao(p: Pagamento): string {
  if ('nomeBeneficiario' in p && p.nomeBeneficiario) return p.nomeBeneficiario;
  if ('cnpjCpfContribuinte' in p) return p.cnpjCpfContribuinte;
  if ('identificador' in p) return p.identificador;
  if ('qrCodePayload' in p) return (p.qrCodePayload || '').slice(0, 30) + '...';
  return '—';
}

export function PagamentoList({ pagamentos, onRemove }: Props) {
  if (pagamentos.length === 0) return null;

  const total = pagamentos.reduce((s, p) => s + p.valor, 0);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">
            Pagamentos Adicionados
            <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pagamentos.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total: <strong>{formatCurrency(total)}</strong>
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Modalidade</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Beneficiário</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pagamento</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((p, i) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${MODALIDADE_COLOR[p.modalidade]}`}>
                    {MODALIDADE_LABEL[p.modalidade]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                  {getDescricao(p)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                  {formatCurrency(p.valor)}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {formatDate(p.dataPagamento)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onRemove(p.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Total Geral ({pagamentos.length} {pagamentos.length === 1 ? 'pagamento' : 'pagamentos'})
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">
                {formatCurrency(total)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
