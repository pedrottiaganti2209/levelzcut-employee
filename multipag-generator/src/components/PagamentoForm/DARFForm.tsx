import { useState } from 'react';
import type { PagamentoDARF } from '../../types/pagamento';
import { validarCpfOuCnpj, detectarTipoDocumento } from '../../lib/validators/cnpj-cpf';
import { Field, FormGrid, inputClass, today } from './shared';
import { maskCpfCnpj, maskPeriodo } from '../../lib/masks';

interface Props { onAdd: (p: PagamentoDARF) => void; }

export function DARFForm({ onAdd }: Props) {
  const [f, setF] = useState({
    cnpjCpfContribuinte: '',
    codigoReceita: '',
    periodoApuracao: '',   // MMAAAA
    numeroReferencia: '',
    valorPrincipal: '',
    valorMulta: '',
    valorJuros: '',
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
    if (!f.cnpjCpfContribuinte || !validarCpfOuCnpj(f.cnpjCpfContribuinte))
      e.cnpjCpfContribuinte = 'CPF/CNPJ inválido';
    if (!f.codigoReceita || f.codigoReceita.replace(/\D/g, '').length !== 4)
      e.codigoReceita = 'Código deve ter 4 dígitos';
    if (!f.periodoApuracao || !/^\d{2}\/?\d{4}$|^\d{6}$/.test(f.periodoApuracao.replace(/\D/g, '')))
      e.periodoApuracao = 'Formato: MM/AAAA';
    if (parseMoney(f.valorPrincipal) <= 0) e.valorPrincipal = 'Obrigatório e maior que zero';
    if (!f.dataVencimento) e.dataVencimento = 'Obrigatório';
    if (!f.dataPagamento) e.dataPagamento = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    const vp = parseMoney(f.valorPrincipal);
    const vm = parseMoney(f.valorMulta);
    const vj = parseMoney(f.valorJuros);
    onAdd({
      id: crypto.randomUUID(),
      modalidade: 'darf',
      cnpjCpfContribuinte: f.cnpjCpfContribuinte,
      tipoInscricao: detectarTipoDocumento(f.cnpjCpfContribuinte) || '2',
      codigoReceita: f.codigoReceita,
      periodoApuracao: f.periodoApuracao.replace(/\D/g, ''),
      numeroReferencia: f.numeroReferencia,
      valorPrincipal: vp,
      valorMulta: vm,
      valorJuros: vj,
      valor: vp + vm + vj,
      dataVencimento: f.dataVencimento,
      dataPagamento: f.dataPagamento,
      numeroDocumento: f.numeroDocumento,
    });
    setF({ ...f, valorPrincipal: '', valorMulta: '', valorJuros: '' });
    setErrors({});
  }

  const total = parseMoney(f.valorPrincipal) + parseMoney(f.valorMulta) + parseMoney(f.valorJuros);

  return (
    <FormGrid>
      <Field label="CNPJ / CPF do Contribuinte" required error={errors.cnpjCpfContribuinte}>
        <input type="text" className={inputClass(!!errors.cnpjCpfContribuinte)}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          value={f.cnpjCpfContribuinte}
          onChange={(e) => setF({ ...f, cnpjCpfContribuinte: maskCpfCnpj(e.target.value) })} maxLength={18} />
      </Field>
      <Field label="Código da Receita" required error={errors.codigoReceita}
        hint="4 dígitos (ex: 2089, 6015)">
        <input type="text" className={inputClass(!!errors.codigoReceita)}
          placeholder="0000" value={f.codigoReceita} onChange={set('codigoReceita')} maxLength={4} />
      </Field>
      <Field label="Período de Apuração" required error={errors.periodoApuracao}>
        <input type="text" className={inputClass(!!errors.periodoApuracao)}
          placeholder="MM/AAAA"
          value={f.periodoApuracao}
          onChange={(e) => setF({ ...f, periodoApuracao: maskPeriodo(e.target.value) })} maxLength={7} />
      </Field>
      <Field label="Número de Referência">
        <input type="text" className={inputClass()} placeholder="Processo/Parcelamento" maxLength={16}
          value={f.numeroReferencia} onChange={set('numeroReferencia')} />
      </Field>
      <Field label="Valor Principal (R$)" required error={errors.valorPrincipal}>
        <input type="text" className={inputClass(!!errors.valorPrincipal)} placeholder="0,00"
          value={f.valorPrincipal} onChange={set('valorPrincipal')} />
      </Field>
      <Field label="Valor Multa (R$)">
        <input type="text" className={inputClass()} placeholder="0,00"
          value={f.valorMulta} onChange={set('valorMulta')} />
      </Field>
      <Field label="Valor Juros (R$)">
        <input type="text" className={inputClass()} placeholder="0,00"
          value={f.valorJuros} onChange={set('valorJuros')} />
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
          + Adicionar DARF
        </button>
      </div>
    </FormGrid>
  );
}
