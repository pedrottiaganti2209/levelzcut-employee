import type { EmpresaData } from '../types/pagamento';
import { validarCNPJ } from '../lib/validators/cnpj-cpf';
import { maskCnpj } from '../lib/masks';

interface Props {
  data: EmpresaData;
  onChange: (data: EmpresaData) => void;
}

function Field({
  label, children, error, required,
}: {
  label: string; children: React.ReactNode; error?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass = (error?: boolean) =>
  `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
  }`;

export function EmpresaForm({ data, onChange }: Props) {
  const cnpjValido = data.cnpj.replace(/\D/g, '').length === 14
    ? validarCNPJ(data.cnpj) : null;

  const set = (field: keyof EmpresaData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'cnpj' ? maskCnpj(e.target.value) : e.target.value;
    onChange({ ...data, [field]: value });
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <h2 className="font-semibold text-gray-800 text-sm">Dados da Empresa Pagadora</h2>
        <p className="text-xs text-gray-500 mt-0.5">Informações que identificam sua empresa no arquivo CNAB 240</p>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="CNPJ" required error={cnpjValido === false ? 'CNPJ inválido' : undefined}>
          <input
            type="text"
            className={inputClass(cnpjValido === false)}
            placeholder="00.000.000/0000-00"
            value={data.cnpj}
            onChange={set('cnpj')}
            maxLength={18}
          />
        </Field>

        <Field label="Nome da Empresa" required>
          <input
            type="text"
            className={inputClass()}
            placeholder="Razão Social (até 30 chars)"
            value={data.nome}
            onChange={set('nome')}
            maxLength={30}
          />
        </Field>

        <Field label="Convênio / Código da Empresa">
          <input
            type="text"
            className={inputClass()}
            placeholder="Código do convênio (20 chars)"
            value={data.convenio}
            onChange={set('convenio')}
            maxLength={20}
          />
        </Field>

        <Field label="Agência" required>
          <input
            type="text"
            className={inputClass()}
            placeholder="0000"
            value={data.agencia}
            onChange={set('agencia')}
            maxLength={5}
          />
        </Field>

        <Field label="Dígito da Agência">
          <input
            type="text"
            className={inputClass()}
            placeholder="0"
            value={data.agenciaDv}
            onChange={set('agenciaDv')}
            maxLength={1}
          />
        </Field>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="Conta Corrente" required>
              <input
                type="text"
                className={inputClass()}
                placeholder="000000"
                value={data.conta}
                onChange={set('conta')}
                maxLength={12}
              />
            </Field>
          </div>
          <div className="w-20">
            <Field label="Dígito">
              <input
                type="text"
                className={inputClass()}
                placeholder="0"
                value={data.contaDv}
                onChange={set('contaDv')}
                maxLength={1}
              />
            </Field>
          </div>
        </div>

        <Field label="Nº Sequencial do Arquivo">
          <input
            type="text"
            className={inputClass()}
            placeholder="1"
            value={data.numeroArquivo}
            onChange={set('numeroArquivo')}
            maxLength={6}
          />
        </Field>
      </div>
    </section>
  );
}
