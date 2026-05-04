import { FileText, ExternalLink } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-red-800 to-red-700 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2.5">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Gerador Multipag CNAB 240</h1>
              <p className="text-red-200 text-sm mt-0.5">
                Bradesco — Arquivo de Remessa para Pagamentos
              </p>
            </div>
          </div>
          <a
            href="https://assets.bradesco/content/dam/portal-bradesco/assets/pessoajuridica/pdf/multipag.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg text-red-100"
          >
            <ExternalLink size={12} />
            Cartilha Multipag
          </a>
        </div>
      </div>
    </header>
  );
}
