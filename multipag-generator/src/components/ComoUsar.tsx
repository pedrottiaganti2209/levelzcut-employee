import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const PASSOS = [
  {
    titulo: '1. Preencha os dados da empresa',
    desc: 'Informe o CNPJ, nome, agência e conta corrente da sua empresa no Bradesco. Esses dados identificam o pagador no arquivo.',
  },
  {
    titulo: '2. Selecione a modalidade',
    desc: 'Escolha o tipo de pagamento: crédito em conta, TED, boleto, PIX, salários ou tributos (DARF, GPS, GARE, GNRE, FGTS).',
  },
  {
    titulo: '3. Preencha o formulário e adicione',
    desc: 'Preencha os dados do beneficiário e o valor. Clique em "Adicionar Pagamento". Você pode adicionar vários pagamentos de diferentes modalidades.',
  },
  {
    titulo: '4. Gere o arquivo',
    desc: 'Clique em "Gerar Arquivo CNAB 240". O arquivo .txt será baixado automaticamente no padrão exigido pelo Bradesco Multipag.',
  },
  {
    titulo: '5. Transmita via Bradesco Net Empresa',
    desc: 'Acesse o Bradesco Net Empresa → Pagamentos → Multipag → Importar Arquivo. Selecione o arquivo gerado e siga as instruções do banco.',
  },
];

const FAQ = [
  {
    q: 'O arquivo tem exatamente 240 caracteres por linha?',
    a: 'Sim. Cada linha é gerada com exatamente 240 posições, conforme o padrão FEBRABAN/Bradesco CNAB 240.',
  },
  {
    q: 'Posso misturar diferentes tipos de pagamento?',
    a: 'Sim. Você pode adicionar pagamentos de diferentes modalidades em uma única remessa. O sistema cria lotes separados para cada tipo automaticamente.',
  },
  {
    q: 'O que é o Convênio/Código da Empresa?',
    a: 'É o código de convênio do seu contrato Multipag com o Bradesco. Verifique com o seu gerente de conta ou no contrato Multipag.',
  },
  {
    q: 'Para boletos, uso linha digitável ou código de barras?',
    a: 'Pode usar qualquer um dos dois. Se informar a linha digitável (47 dígitos), ela será convertida automaticamente para o código de barras (44 dígitos) no arquivo.',
  },
  {
    q: 'Este site armazena meus dados?',
    a: 'Não. Toda a geração do arquivo acontece localmente no seu navegador. Nenhum dado é enviado para servidores.',
  },
];

export function ComoUsar() {
  const [open, setOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-red-600" />
          <span className="font-semibold text-gray-800 text-sm">Como usar — Guia rápido e FAQ</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Passo a passo</h3>
            <div className="space-y-3">
              {PASSOS.map((p) => (
                <div key={p.titulo} className="flex gap-3">
                  <div className="w-1.5 bg-red-200 rounded-full flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{p.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Perguntas frequentes</h3>
            <div className="space-y-2">
              {FAQ.map((item, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700 font-medium">{item.q}</span>
                    {faqOpen === i
                      ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {faqOpen === i && (
                    <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-2">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
