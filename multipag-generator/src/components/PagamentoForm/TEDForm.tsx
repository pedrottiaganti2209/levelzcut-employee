import { useState } from 'react';
import type { PagamentoTED } from '../../types/pagamento';
import { validarCpfOuCnpj, detectarTipoDocumento } from '../../lib/validators/cnpj-cpf';
import { FINALIDADES_TED } from '../../lib/cnab240/segmento-a';
import { Field, FormGrid, inputClass, selectClass, today } from './shared';

interface Props { onAdd: (p: PagamentoTED) => void; }

export function TEDForm({ onAdd }: Props) {
  const [f, setF] = useState({
    bancoBeneficiario: '',
    agenciaBeneficiario: '',
    agenciaBeneficiarioDv: '',
    contaBeneficiario: '',
    contaBeneficiarioDv: '',
    nomeBeneficiario: '',
    cpfCnpjBeneficiario: '',
    finalidadeTED: '10',
    valor: '',
    dataPagamento: today(),
    numeroDocumento: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.bancoBeneficiario) e.bancoBeneficiario = 'Obrigatório';
    if (!f.agenciaBeneficiario) e.agenciaBeneficiario = 'Obrigatório';
    if (!f.contaBeneficiario) e.contaBeneficiario = 'Obrigatório';
    if (!f.nomeBeneficiario) e.nomeBeneficiario = 'Obrigatório';
    if (!f.cpfCnpjBeneficiario || !validarCpfOuCnpj(f.cpfCnpjBeneficiario))
      e.cpfCnpjBeneficiario = 'CPF/CNPJ inválido';
    const valor = parseFloat(f.valor.replace(',', '.'));
    if (!f.valor || isNaN(valor) || valor <= 0) e.valor = 'Valor deve ser maior que zero';
    if (!f.dataPagamento) e.dataPagamento = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    onAdd({
      id: crypto.randomUUID(),
      modalidade: 'ted',
      bancoBeneficiario: f.bancoBeneficiario,
      agenciaBeneficiario: f.agenciaBeneficiario,
      agenciaBeneficiarioDv: f.agenciaBeneficiarioDv,
      contaBeneficiario: f.contaBeneficiario,
      contaBeneficiarioDv: f.contaBeneficiarioDv,
      nomeBeneficiario: f.nomeBeneficiario,
      cpfCnpjBeneficiario: f.cpfCnpjBeneficiario,
      tipoCpfCnpj: detectarTipoDocumento(f.cpfCnpjBeneficiario) || '1',
      finalidadeTED: f.finalidadeTED,
      valor: parseFloat(f.valor.replace(',', '.')),
      dataPagamento: f.dataPagamento,
      numeroDocumento: f.numeroDocumento,
    });
    setF({ ...f, agenciaBeneficiario: '', contaBeneficiario: '', nomeBeneficiario: '', cpfCnpjBeneficiario: '', valor: '' });
    setErrors({});
  }

  return (
    <FormGrid>
      <Field label="Banco do Beneficiário" required error={errors.bancoBeneficiario}>
        <input type="text" className={inputClass(!!errors.bancoBeneficiario)} placeholder="Código do banco (ex: 341)"
          value={f.bancoBeneficiario} onChange={set('bancoBeneficiario')} maxLength={3} />
      </Field>
      <Field label="Agência" required error={errors.agenciaBeneficiario}>
        <div className="flex gap-2">
          <input type="text" className={inputClass(!!errors.agenciaBeneficiario)} placeholder="0000" maxLength={5}
            value={f.agenciaBeneficiario} onChange={set('agenciaBeneficiario')} />
          <input type="text" className={`${inputClass()} w-16`} placeholder="DV" maxLength={1}
            value={f.agenciaBeneficiarioDv} onChange={set('agenciaBeneficiarioDv')} />
        </div>
      </Field>
      <Field label="Conta Corrente" required error={errors.contaBeneficiario}>
        <div className="flex gap-2">
          <input type="text" className={inputClass(!!errors.contaBeneficiario)} placeholder="000000" maxLength={12}
            value={f.contaBeneficiario} onChange={set('contaBeneficiario')} />
          <input type="text" className={`${inputClass()} w-16`} placeholder="DV" maxLength={1}
            value={f.contaBeneficiarioDv} onChange={set('contaBeneficiarioDv')} />
        </div>
      </Field>
      <Field label="Nome do Beneficiário" required error={errors.nomeBeneficiario}>
        <input type="text" className={inputClass(!!errors.nomeBeneficiario)} placeholder="Nome completo" maxLength={30}
          value={f.nomeBeneficiario} onChange={set('nomeBeneficiario')} />
      </Field>
      <Field label="CPF / CNPJ" required error={errors.cpfCnpjBeneficiario}>
        <input type="text" className={inputClass(!!errors.cpfCnpjBeneficiario)} placeholder="CPF ou CNPJ"
          value={f.cpfCnpjBeneficiario} onChange={set('cpfCnpjBeneficiario')} maxLength={18} />
      </Field>
      <Field label="Finalidade TED" required>
        <select className={selectClass()} value={f.finalidadeTED} onChange={set('finalidadeTED')}>
          {Object.entries(FINALIDADES_TED).map(([code, desc]) => (
            <option key={code} value={code}>{code} — {desc}</option>
          ))}
        </select>
      </Field>
      <Field label="Valor (R$)" required error={errors.valor}>
        <input type="text" className={inputClass(!!errors.valor)} placeholder="0,00"
          value={f.valor} onChange={set('valor')} />
      </Field>
      <Field label="Data de Pagamento" required error={errors.dataPagamento}>
        <input type="date" className={inputClass(!!errors.dataPagamento)} min={today()}
          value={f.dataPagamento} onChange={set('dataPagamento')} />
      </Field>
      <Field label="Nº do Documento">
        <input type="text" className={inputClass()} placeholder="1" maxLength={20}
          value={f.numeroDocumento} onChange={set('numeroDocumento')} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button onClick={handleAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          + Adicionar TED
        </button>
      </div>
    </FormGrid>
  );
}
