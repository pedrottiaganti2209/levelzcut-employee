import { useState } from 'react';
import type { PagamentoCreditoConta, TipoModalidade } from '../../types/pagamento';
import { validarCpfOuCnpj, detectarTipoDocumento } from '../../lib/validators/cnpj-cpf';
import { Field, FormGrid, inputClass, today } from './shared';

interface Props {
  modalidade: 'credito-conta' | 'salario-conta' | 'salario-conta-salario';
  onAdd: (p: PagamentoCreditoConta) => void;
}

const BANCO_LABELS: Record<string, string> = {
  '001': 'Banco do Brasil', '033': 'Santander', '104': 'CEF',
  '237': 'Bradesco', '341': 'Itaú', '356': 'Banco Real',
  '422': 'Safra', '745': 'Citibank', '756': 'Sicoob',
};

export function CreditoContaForm({ modalidade, onAdd }: Props) {
  const [f, setF] = useState({
    bancoBeneficiario: '237',
    agenciaBeneficiario: '',
    agenciaBeneficiarioDv: '',
    contaBeneficiario: '',
    contaBeneficiarioDv: '',
    nomeBeneficiario: '',
    cpfCnpjBeneficiario: '',
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
    if (!f.cpfCnpjBeneficiario) {
      e.cpfCnpjBeneficiario = 'Obrigatório';
    } else if (!validarCpfOuCnpj(f.cpfCnpjBeneficiario)) {
      e.cpfCnpjBeneficiario = 'CPF/CNPJ inválido';
    }
    const valor = parseFloat(f.valor.replace(',', '.'));
    if (!f.valor || isNaN(valor) || valor <= 0) e.valor = 'Valor deve ser maior que zero';
    if (!f.dataPagamento) e.dataPagamento = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    const tipoCpfCnpj = detectarTipoDocumento(f.cpfCnpjBeneficiario) || '1';
    onAdd({
      id: crypto.randomUUID(),
      modalidade: modalidade as TipoModalidade as 'credito-conta',
      bancoBeneficiario: f.bancoBeneficiario,
      agenciaBeneficiario: f.agenciaBeneficiario,
      agenciaBeneficiarioDv: f.agenciaBeneficiarioDv,
      contaBeneficiario: f.contaBeneficiario,
      contaBeneficiarioDv: f.contaBeneficiarioDv,
      nomeBeneficiario: f.nomeBeneficiario,
      cpfCnpjBeneficiario: f.cpfCnpjBeneficiario,
      tipoCpfCnpj,
      valor: parseFloat(f.valor.replace(',', '.')),
      dataPagamento: f.dataPagamento,
      numeroDocumento: f.numeroDocumento,
    });
    setF({ ...f, valor: '', numeroDocumento: String(parseInt(f.numeroDocumento || '0') + 1) });
    setErrors({});
  }

  return (
    <FormGrid>
      <Field label="Banco" required error={errors.bancoBeneficiario}>
        <select className={inputClass(!!errors.bancoBeneficiario)} value={f.bancoBeneficiario} onChange={set('bancoBeneficiario')}>
          {Object.entries(BANCO_LABELS).map(([code, name]) => (
            <option key={code} value={code}>{code} — {name}</option>
          ))}
          <option value="outros">Outro</option>
        </select>
      </Field>
      {f.bancoBeneficiario === 'outros' && (
        <Field label="Código do Banco" required>
          <input type="text" className={inputClass()} placeholder="000" maxLength={3}
            onChange={(e) => setF({ ...f, bancoBeneficiario: e.target.value })} />
        </Field>
      )}
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
        <input type="text" className={inputClass(!!errors.nomeBeneficiario)} placeholder="Nome completo"
          value={f.nomeBeneficiario} onChange={set('nomeBeneficiario')} maxLength={30} />
      </Field>
      <Field label="CPF / CNPJ do Beneficiário" required error={errors.cpfCnpjBeneficiario}>
        <input type="text" className={inputClass(!!errors.cpfCnpjBeneficiario)} placeholder="000.000.000-00 ou 00.000.000/0000-00"
          value={f.cpfCnpjBeneficiario} onChange={set('cpfCnpjBeneficiario')} maxLength={18} />
      </Field>
      <Field label="Valor (R$)" required error={errors.valor}>
        <input type="text" className={inputClass(!!errors.valor)} placeholder="0,00"
          value={f.valor} onChange={set('valor')} />
      </Field>
      <Field label="Data de Pagamento" required error={errors.dataPagamento}>
        <input type="date" className={inputClass(!!errors.dataPagamento)}
          value={f.dataPagamento} onChange={set('dataPagamento')} min={today()} />
      </Field>
      <Field label="Nº do Documento">
        <input type="text" className={inputClass()} placeholder="1"
          value={f.numeroDocumento} onChange={set('numeroDocumento')} maxLength={20} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button onClick={handleAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          + Adicionar Pagamento
        </button>
      </div>
    </FormGrid>
  );
}
