import { useState } from 'react';
import { Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Header } from './components/Header';
import { EmpresaForm } from './components/EmpresaForm';
import { ModalidadeSelector } from './components/ModalidadeSelector';
import { CreditoContaForm } from './components/PagamentoForm/CreditoContaForm';
import { TEDForm } from './components/PagamentoForm/TEDForm';
import { BoletoForm } from './components/PagamentoForm/BoletoForm';
import { PixChaveForm, PixQRForm } from './components/PagamentoForm/PixForm';
import { DARFForm } from './components/PagamentoForm/DARFForm';
import { GPSForm } from './components/PagamentoForm/GPSForm';
import { GareGnreFgtsForm } from './components/PagamentoForm/GareGnreFgtsForm';
import { PagamentoList } from './components/PagamentoList';
import { ComoUsar } from './components/ComoUsar';
import { downloadCNAB240 } from './lib/cnab240/generator';
import type {
  EmpresaData,
  Pagamento,
  PagamentoBoleto,
  PagamentoCreditoConta,
  PagamentoDARF,
  PagamentoGARE,
  PagamentoGPS,
  PagamentoPix,
  PagamentoPixQR,
  PagamentoTED,
  TipoModalidade,
} from './types/pagamento';

const EMPRESA_DEFAULT: EmpresaData = {
  cnpj: '', nome: '', agencia: '', agenciaDv: '',
  conta: '', contaDv: '', convenio: '', numeroArquivo: '1',
};

interface Toast { id: number; type: 'success' | 'error'; msg: string }

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${
            t.type === 'success' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'
          }`}
        >
          {t.type === 'success'
            ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [empresa, setEmpresa] = useState<EmpresaData>(EMPRESA_DEFAULT);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [modalidade, setModalidade] = useState<TipoModalidade>('credito-conta');
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(type: 'success' | 'error', msg: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function addPagamento(p: Pagamento) {
    setPagamentos((prev) => [...prev, p]);
    showToast('success', 'Pagamento adicionado!');
  }

  function handleGenerate() {
    if (!empresa.cnpj || !empresa.nome || !empresa.agencia || !empresa.conta) {
      showToast('error', 'Preencha os dados da empresa antes de gerar.');
      return;
    }
    if (pagamentos.length === 0) {
      showToast('error', 'Adicione pelo menos um pagamento.');
      return;
    }
    try {
      downloadCNAB240(empresa, pagamentos);
      showToast('success', `Arquivo CNAB 240 gerado com ${pagamentos.length} pagamento(s)!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', `Erro ao gerar: ${msg}`);
      console.error(err);
    }
  }

  function handleClear() {
    if (!confirm('Limpar todos os pagamentos adicionados?')) return;
    setPagamentos([]);
  }

  function renderForm() {
    switch (modalidade) {
      case 'credito-conta':
        return <CreditoContaForm modalidade="credito-conta" onAdd={addPagamento as (p: PagamentoCreditoConta) => void} />;
      case 'salario-conta':
        return <CreditoContaForm modalidade="salario-conta" onAdd={addPagamento as (p: PagamentoCreditoConta) => void} />;
      case 'salario-conta-salario':
        return <CreditoContaForm modalidade="salario-conta-salario" onAdd={addPagamento as (p: PagamentoCreditoConta) => void} />;
      case 'ted':
        return <TEDForm onAdd={addPagamento as (p: PagamentoTED) => void} />;
      case 'boleto-bradesco':
        return <BoletoForm modalidade="boleto-bradesco" onAdd={addPagamento as (p: PagamentoBoleto) => void} />;
      case 'boleto-outros':
        return <BoletoForm modalidade="boleto-outros" onAdd={addPagamento as (p: PagamentoBoleto) => void} />;
      case 'codigo-barras':
        return <BoletoForm modalidade="codigo-barras" onAdd={addPagamento as (p: PagamentoBoleto) => void} />;
      case 'dda':
        return <BoletoForm modalidade="dda" onAdd={addPagamento as (p: PagamentoBoleto) => void} />;
      case 'pix-chave':
        return <PixChaveForm modalidade="pix-chave" onAdd={addPagamento as (p: PagamentoPix) => void} />;
      case 'ted-to-pix':
        return <PixChaveForm modalidade="ted-to-pix" onAdd={addPagamento as (p: PagamentoPix) => void} />;
      case 'pix-qrcode':
        return <PixQRForm onAdd={addPagamento as (p: PagamentoPixQR) => void} />;
      case 'darf':
        return <DARFForm onAdd={addPagamento as (p: PagamentoDARF) => void} />;
      case 'gps':
        return <GPSForm onAdd={addPagamento as (p: PagamentoGPS) => void} />;
      case 'gare-icms':
        return <GareGnreFgtsForm modalidade="gare-icms" onAdd={addPagamento as (p: PagamentoGARE) => void} />;
      case 'gnre':
        return <GareGnreFgtsForm modalidade="gnre" onAdd={addPagamento as (p: PagamentoGARE) => void} />;
      case 'fgts':
        return <GareGnreFgtsForm modalidade="fgts" onAdd={addPagamento as (p: PagamentoGARE) => void} />;
    }
  }

  const totalRemessa = pagamentos.reduce((s, p) => s + p.valor, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <EmpresaForm data={empresa} onChange={setEmpresa} />

        {/* Seletor de modalidade + formulário dinâmico */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
            <h2 className="font-semibold text-gray-800 text-sm">Adicionar Pagamento</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Selecione a modalidade e preencha os dados
            </p>
          </div>
          <div className="p-5 space-y-5">
            <ModalidadeSelector value={modalidade} onChange={setModalidade} />
            <div className="border-t border-gray-100 pt-5">{renderForm()}</div>
          </div>
        </section>

        {/* Lista de pagamentos adicionados */}
        <PagamentoList pagamentos={pagamentos} onRemove={(id) => setPagamentos((p) => p.filter((x) => x.id !== id))} />

        {/* Ações finais */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4">
          <div className="text-sm text-gray-600">
            {pagamentos.length > 0 ? (
              <>
                <strong>{pagamentos.length}</strong> pagamento(s) •{' '}
                Total:{' '}
                <strong className="text-gray-900">
                  {totalRemessa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </>
            ) : (
              <span className="text-gray-400">Nenhum pagamento adicionado</span>
            )}
          </div>
          <div className="flex gap-3">
            {pagamentos.length > 0 && (
              <button onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded-lg transition-colors">
                <Trash2 size={14} />
                Limpar Tudo
              </button>
            )}
            <button onClick={handleGenerate}
              disabled={pagamentos.length === 0}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm">
              <Download size={16} />
              Gerar Arquivo CNAB 240
            </button>
          </div>
        </div>

        <ComoUsar />

        <footer className="text-center text-xs text-gray-400 pb-6 space-y-1">
          <p>
            <strong>Atenção:</strong> Ferramenta auxiliar não oficial. Valide os arquivos antes de transmitir ao Bradesco Net Empresa.
          </p>
          <p>
            <a href="https://assets.bradesco/content/dam/portal-bradesco/assets/pessoajuridica/pdf/multipag.pdf"
              target="_blank" rel="noopener noreferrer"
              className="text-red-600 hover:underline">
              Cartilha Multipag Bradesco (PDF oficial)
            </a>
          </p>
        </footer>
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
