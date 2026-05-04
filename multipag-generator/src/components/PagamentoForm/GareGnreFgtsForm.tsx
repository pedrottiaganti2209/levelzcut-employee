import { useState } from 'react';
import type { PagamentoGARE, TipoModalidade } from '../../types/pagamento';
import { validarCpfOuCnpj, detectarTipoDocumento } from '../../lib/validators/cnpj-cpf';
import { Field, FormGrid, inputClass, today } from './shared';
import { maskCpfCnpj, maskCnpj, maskPeriodo } from '../../lib/masks';

interface Props {
  modalidade: 'gare-icms' | 'gnre' | 'fgts';
  onAdd: (p: PagamentoGARE) => void;
}

const LABELS: Record<string, { title: string; inscLabel: string; receitaHint: string }> = {
  'gare-icms': { title: 'GARE-SP ICMS', inscLabel: 'Inscrição Estadual', receitaHint: 'Código da receita SP' },
  'gnre': { title: 'GNRE', inscLabel: 'CNPJ / CPF', receitaHint: 'Código GNRE (ex: 100099)' },
  'fgts': { title: 'FGTS', inscLabel: 'CNPJ do Empregador', receitaHint: 'Nº Recolhimento Conectividade' },
};

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export function GareGnreFgtsForm({ modalidade, onAdd }: Props) {
  const meta = LABELS[modalidade];
  const isFGTS = modalidade === 'fgts';
  const isGNRE = modalidade === 'gnre';

  const [f, setF] = useState({
    cnpjCpfContribuinte: '',
    codigoReceita: '',
    periodoApuracao: '',   // MMAAAA
    numeroReferencia: '',
    ufFavorecida: 'SP',
    valorPrincipal: '',
    valorMulta: '',
    valorJuros: '',
    dataVencimento: today(),
    dataPagamento: today(),
    numeroDocumento: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const parseMoney = (v: string) => parseFloat((v || '0').replace(',', '.')) || 0;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.cnpjCpfContribuinte) {
      e.cnpjCpfContribuinte = 'Obrigatório';
    } else if ((isGNRE || isFGTS) && !validarCpfOuCnpj(f.cnpjCpfContribuinte)) {
      e.cnpjCpfContribuinte = 'CNPJ/CPF inválido';
    }
    if (!f.codigoReceita) e.codigoReceita = 'Obrigatório';
    if (!f.periodoApuracao) e.periodoApuracao = 'Obrigatório (MMAAAA)';
    if (parseMoney(f.valorPrincipal) <= 0) e.valorPrincipal = 'Obrigatório';
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
      modalidade: modalidade as TipoModalidade as 'gare-icms',
      cnpjCpfContribuinte: f.cnpjCpfContribuinte,
      tipoInscricao: detectarTipoDocumento(f.cnpjCpfContribuinte) || '2',
      codigoReceita: f.codigoReceita,
      periodoApuracao: f.periodoApuracao.replace(/\D/g, ''),
      numeroReferencia: f.numeroReferencia,
      ufFavorecida: f.ufFavorecida,
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
      <Field label={meta.inscLabel} required error={errors.cnpjCpfContribuinte}>
        <input type="text" className={inputClass(!!errors.cnpjCpfContribuinte)}
          placeholder={isFGTS ? '00.000.000/0000-00' : isGNRE ? '000.000.000-00 ou 00.000.000/0000-00' : 'IE (só números)'}
          value={f.cnpjCpfContribuinte}
          onChange={(e) => setF({ ...f, cnpjCpfContribuinte: isFGTS ? maskCnpj(e.target.value) : maskCpfCnpj(e.target.value) })}
          maxLength={18} />
      </Field>
      <Field label={isFGTS ? 'Nº Recolhimento (Conectividade Social)' : 'Código da Receita'}
        required error={errors.codigoReceita} hint={meta.receitaHint}>
        <input type="text" className={inputClass(!!errors.codigoReceita)}
          placeholder={isFGTS ? 'Número recolhimento' : '000000'}
          value={f.codigoReceita} onChange={set('codigoReceita')} maxLength={15} />
      </Field>
      <Field label="Período de Apuração" required error={errors.periodoApuracao}>
        <input type="text" className={inputClass(!!errors.periodoApuracao)}
          placeholder="MM/AAAA"
          value={f.periodoApuracao}
          onChange={(e) => setF({ ...f, periodoApuracao: maskPeriodo(e.target.value) })} maxLength={7} />
      </Field>
      {isGNRE && (
        <Field label="UF Favorecida" required>
          <select className={inputClass()} value={f.ufFavorecida}
            onChange={(e) => setF({ ...f, ufFavorecida: e.target.value })}>
            {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </Field>
      )}
      {!isFGTS && (
        <Field label="Número de Referência">
          <input type="text" className={inputClass()} placeholder="Referência" maxLength={16}
            value={f.numeroReferencia} onChange={set('numeroReferencia')} />
        </Field>
      )}
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
          + Adicionar {meta.title}
        </button>
      </div>
    </FormGrid>
  );
}
