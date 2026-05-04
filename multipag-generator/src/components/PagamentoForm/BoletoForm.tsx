import { useState } from 'react';
import type { PagamentoBoleto, TipoModalidade } from '../../types/pagamento';
import { validarBoleto } from '../../lib/validators/boleto';
import { Field, FormGrid, inputClass, today } from './shared';

interface Props {
  modalidade: 'boleto-bradesco' | 'boleto-outros' | 'codigo-barras' | 'dda';
  onAdd: (p: PagamentoBoleto) => void;
}

const MODAL_LABEL: Record<string, string> = {
  'boleto-bradesco': 'Boleto Bradesco',
  'boleto-outros': 'Boleto Outros Bancos',
  'codigo-barras': 'Código de Barras',
  'dda': 'DDA',
};

export function BoletoForm({ modalidade, onAdd }: Props) {
  const [f, setF] = useState({
    codigoBarras: '',
    nomeBeneficiario: '',
    dataVencimento: today(),
    dataPagamento: today(),
    valor: '',
    numeroDocumento: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.codigoBarras) {
      e.codigoBarras = 'Obrigatório';
    } else {
      const r = validarBoleto(f.codigoBarras);
      if (!r.valid) e.codigoBarras = r.error || 'Código inválido';
    }
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
      modalidade: modalidade as TipoModalidade as 'boleto-bradesco',
      codigoBarras: f.codigoBarras,
      nomeBeneficiario: f.nomeBeneficiario,
      dataVencimento: f.dataVencimento,
      dataPagamento: f.dataPagamento,
      valor: parseFloat(f.valor.replace(',', '.')),
      numeroDocumento: f.numeroDocumento,
    });
    setF({ ...f, valor: '' });
    setErrors({});
  }

  return (
    <FormGrid>
      <Field label="Linha Digitável ou Código de Barras" required error={errors.codigoBarras}
        hint="47 dígitos (linha digitável) ou 44 dígitos (código de barras)">
        <input type="text" className={inputClass(!!errors.codigoBarras)}
          placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
          value={f.codigoBarras} onChange={set('codigoBarras')} />
      </Field>
      <Field label="Nome do Beneficiário">
        <input type="text" className={inputClass()} placeholder="Opcional" maxLength={30}
          value={f.nomeBeneficiario} onChange={set('nomeBeneficiario')} />
      </Field>
      <Field label="Data de Vencimento">
        <input type="date" className={inputClass()} value={f.dataVencimento} onChange={set('dataVencimento')} />
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
        <input type="text" className={inputClass()} placeholder="1" maxLength={15}
          value={f.numeroDocumento} onChange={set('numeroDocumento')} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button onClick={handleAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          + Adicionar {MODAL_LABEL[modalidade]}
        </button>
      </div>
    </FormGrid>
  );
}
