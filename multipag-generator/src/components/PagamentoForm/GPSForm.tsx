import { useState } from 'react';
import type { PagamentoGPS } from '../../types/pagamento';
import { Field, FormGrid, inputClass, today } from './shared';

interface Props { onAdd: (p: PagamentoGPS) => void; }

export function GPSForm({ onAdd }: Props) {
  const [f, setF] = useState({
    identificador: '',      // NIT/PIS/CNPJ
    codigoPagamento: '',    // GPS code
    competencia: '',        // MMAAAA
    valorInss: '',
    valorOutrasEntidades: '',
    valorAtualizacao: '',
    dataVencimento: today(),
    dataPagamento: today(),
    numeroDocumento: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  const parseMoney = (v: string) => parseFloat((v || '0').replace(',', '.')) || 0;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.identificador) e.identificador = 'Obrigatório';
    if (!f.codigoPagamento) e.codigoPagamento = 'Obrigatório';
    if (!f.competencia || !/^\d{6}$/.test(f.competencia.replace(/\D/g, '')))
      e.competencia = 'Formato: MMAAAA (ex: 012024)';
    if (parseMoney(f.valorInss) <= 0) e.valorInss = 'Obrigatório e maior que zero';
    if (!f.dataVencimento) e.dataVencimento = 'Obrigatório';
    if (!f.dataPagamento) e.dataPagamento = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    const vi = parseMoney(f.valorInss);
    const vo = parseMoney(f.valorOutrasEntidades);
    const va = parseMoney(f.valorAtualizacao);
    onAdd({
      id: crypto.randomUUID(),
      modalidade: 'gps',
      identificador: f.identificador,
      codigoPagamento: f.codigoPagamento,
      competencia: f.competencia.replace(/\D/g, ''),
      valorInss: vi,
      valorOutrasEntidades: vo,
      valorAtualizacao: va,
      valor: vi + vo + va,
      dataVencimento: f.dataVencimento,
      dataPagamento: f.dataPagamento,
      numeroDocumento: f.numeroDocumento,
    });
    setF({ ...f, valorInss: '', valorOutrasEntidades: '', valorAtualizacao: '' });
    setErrors({});
  }

  const total = parseMoney(f.valorInss) + parseMoney(f.valorOutrasEntidades) + parseMoney(f.valorAtualizacao);

  return (
    <FormGrid>
      <Field label="Identificador (NIT/PIS/CNPJ)" required error={errors.identificador}
        hint="NIT do contribuinte, PIS ou CNPJ">
        <input type="text" className={inputClass(!!errors.identificador)}
          placeholder="000.00000.00-0" value={f.identificador} onChange={set('identificador')} maxLength={14} />
      </Field>
      <Field label="Código de Pagamento GPS" required error={errors.codigoPagamento}
        hint="Ex: 1007 (empregados), 1163 (domésticos)">
        <input type="text" className={inputClass(!!errors.codigoPagamento)}
          placeholder="0000" value={f.codigoPagamento} onChange={set('codigoPagamento')} maxLength={6} />
      </Field>
      <Field label="Competência" required error={errors.competencia}>
        <input type="text" className={inputClass(!!errors.competencia)}
          placeholder="MMAAAA (ex: 012024)" value={f.competencia} onChange={set('competencia')} maxLength={6} />
      </Field>
      <Field label="Valor INSS (R$)" required error={errors.valorInss}>
        <input type="text" className={inputClass(!!errors.valorInss)} placeholder="0,00"
          value={f.valorInss} onChange={set('valorInss')} />
      </Field>
      <Field label="Outras Entidades (R$)">
        <input type="text" className={inputClass()} placeholder="0,00"
          value={f.valorOutrasEntidades} onChange={set('valorOutrasEntidades')} />
      </Field>
      <Field label="Atualização Monetária (R$)">
        <input type="text" className={inputClass()} placeholder="0,00"
          value={f.valorAtualizacao} onChange={set('valorAtualizacao')} />
      </Field>
      <Field label="Data de Vencimento" required error={errors.dataVencimento}>
        <input type="date" className={inputClass(!!errors.dataVencimento)}
          value={f.dataVencimento} onChange={set('dataVencimento')} />
      </Field>
      <Field label="Data de Pagamento" required error={errors.dataPagamento}>
        <input type="date" className={inputClass(!!errors.dataPagamento)} min={today()}
          value={f.dataPagamento} onChange={set('dataPagamento')} />
      </Field>
      {total > 0 && (
        <div className="sm:col-span-2 lg:col-span-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
          Valor total: <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
        </div>
      )}
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button onClick={handleAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          + Adicionar GPS
        </button>
      </div>
    </FormGrid>
  );
}
