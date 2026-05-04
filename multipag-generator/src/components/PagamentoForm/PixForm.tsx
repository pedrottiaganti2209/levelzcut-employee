import { useState } from 'react';
import type { PagamentoPix, PagamentoPixQR, TipoChavePix } from '../../types/pagamento';
import { validarChavePix } from '../../lib/validators/pix';
import { validarCpfOuCnpj, detectarTipoDocumento } from '../../lib/validators/cnpj-cpf';
import { Field, FormGrid, inputClass, selectClass, today } from './shared';

interface PixChaveProps {
  modalidade: 'pix-chave' | 'ted-to-pix';
  onAdd: (p: PagamentoPix) => void;
}

export function PixChaveForm({ modalidade, onAdd }: PixChaveProps) {
  const [f, setF] = useState({
    tipoChave: 'cpf' as TipoChavePix,
    chavePix: '',
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
    const chaveResult = validarChavePix(f.chavePix, f.tipoChave);
    if (!chaveResult.valid) e.chavePix = chaveResult.error || 'Chave inválida';
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
      modalidade,
      tipoChave: f.tipoChave,
      chavePix: f.chavePix,
      nomeBeneficiario: f.nomeBeneficiario,
      cpfCnpjBeneficiario: f.cpfCnpjBeneficiario,
      tipoCpfCnpj: detectarTipoDocumento(f.cpfCnpjBeneficiario) || '1',
      valor: parseFloat(f.valor.replace(',', '.')),
      dataPagamento: f.dataPagamento,
      numeroDocumento: f.numeroDocumento,
    });
    setF({ ...f, valor: '', numeroDocumento: String(parseInt(f.numeroDocumento || '0') + 1) });
    setErrors({});
  }

  const tipoChavePlaceholders: Record<TipoChavePix, string> = {
    cpf: '000.000.000-00',
    cnpj: '00.000.000/0000-00',
    celular: '+5511999999999',
    email: 'nome@email.com',
    evp: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  };

  return (
    <FormGrid>
      <Field label="Tipo de Chave PIX" required>
        <select className={selectClass()} value={f.tipoChave}
          onChange={(e) => setF({ ...f, tipoChave: e.target.value as TipoChavePix, chavePix: '' })}>
          <option value="cpf">CPF</option>
          <option value="cnpj">CNPJ</option>
          <option value="celular">Celular</option>
          <option value="email">E-mail</option>
          <option value="evp">Chave Aleatória (EVP)</option>
        </select>
      </Field>
      <Field label="Chave PIX" required error={errors.chavePix}>
        <input type="text" className={inputClass(!!errors.chavePix)}
          placeholder={tipoChavePlaceholders[f.tipoChave]}
          value={f.chavePix} onChange={set('chavePix')} />
      </Field>
      <Field label="Nome do Favorecido" required error={errors.nomeBeneficiario}>
        <input type="text" className={inputClass(!!errors.nomeBeneficiario)} placeholder="Nome completo" maxLength={30}
          value={f.nomeBeneficiario} onChange={set('nomeBeneficiario')} />
      </Field>
      <Field label="CPF/CNPJ do Favorecido" required error={errors.cpfCnpjBeneficiario}>
        <input type="text" className={inputClass(!!errors.cpfCnpjBeneficiario)} placeholder="CPF ou CNPJ"
          value={f.cpfCnpjBeneficiario} onChange={set('cpfCnpjBeneficiario')} maxLength={18} />
      </Field>
      <Field label="Valor (R$)" required error={errors.valor}>
        <input type="text" className={inputClass(!!errors.valor)} placeholder="0,00"
          value={f.valor} onChange={set('valor')} />
      </Field>
      <Field label="Data de Pagamento" required error={errors.dataPagamento}>
        <input type="date" className={inputClass(!!errors.dataPagamento)} min={today()}
          value={f.dataPagamento} onChange={set('dataPagamento')} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button onClick={handleAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          + Adicionar PIX Chave
        </button>
      </div>
    </FormGrid>
  );
}

interface PixQRProps { onAdd: (p: PagamentoPixQR) => void; }

export function PixQRForm({ onAdd }: PixQRProps) {
  const [f, setF] = useState({
    qrCodePayload: '',
    nomeBeneficiario: '',
    valor: '',
    dataPagamento: today(),
    numeroDocumento: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.qrCodePayload.trim()) e.qrCodePayload = 'Payload do QR Code é obrigatório';
    if (!f.nomeBeneficiario) e.nomeBeneficiario = 'Obrigatório';
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
      modalidade: 'pix-qrcode',
      qrCodePayload: f.qrCodePayload,
      nomeBeneficiario: f.nomeBeneficiario,
      valor: parseFloat(f.valor.replace(',', '.')),
      dataPagamento: f.dataPagamento,
      numeroDocumento: f.numeroDocumento,
    });
    setF({ ...f, qrCodePayload: '', valor: '' });
    setErrors({});
  }

  return (
    <FormGrid>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label="Payload do QR Code" required error={errors.qrCodePayload}
          hint="Cole o conteúdo do QR Code PIX (BR Code). Máx. ~99 chars suportados no arquivo CNAB.">
          <textarea
            className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors resize-none ${errors.qrCodePayload ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
            placeholder="00020126580014BR.GOV.BCB.PIX..."
            rows={3}
            value={f.qrCodePayload}
            onChange={set('qrCodePayload')}
          />
        </Field>
      </div>
      <Field label="Nome do Beneficiário" required error={errors.nomeBeneficiario}>
        <input type="text" className={inputClass(!!errors.nomeBeneficiario)} placeholder="Nome completo" maxLength={30}
          value={f.nomeBeneficiario} onChange={set('nomeBeneficiario')} />
      </Field>
      <Field label="Valor (R$)" required error={errors.valor}>
        <input type="text" className={inputClass(!!errors.valor)} placeholder="0,00"
          value={f.valor} onChange={set('valor')} />
      </Field>
      <Field label="Data de Pagamento" required error={errors.dataPagamento}>
        <input type="date" className={inputClass(!!errors.dataPagamento)} min={today()}
          value={f.dataPagamento} onChange={set('dataPagamento')} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button onClick={handleAdd}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          + Adicionar PIX QR Code
        </button>
      </div>
    </FormGrid>
  );
}
