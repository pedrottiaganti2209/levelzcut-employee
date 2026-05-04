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
} from '../../types/pagamento';
import { gerarHeaderArquivo } from './header-arquivo';
import { gerarHeaderLote } from './header-lote';
import { gerarSegmentoA } from './segmento-a';
import { gerarSegmentoB } from './segmento-b';
import { gerarSegmentoJ } from './segmento-j';
import {
  gerarSegmentoNDARF,
  gerarSegmentoNFGTS,
  gerarSegmentoNGARE,
  gerarSegmentoNGNRE,
  gerarSegmentoNGPS,
} from './segmento-n';
import { gerarTrailerArquivo } from './trailer-arquivo';
import { gerarTrailerLote } from './trailer-lote';
import { onlyDigits } from './utils';

interface LoteGroupConfig {
  tipoServico: string;
  formaLancamento: string;
  finalidade: string;
  modalidades: TipoModalidade[];
}

const LOTE_GROUPS: LoteGroupConfig[] = [
  { tipoServico: '20', formaLancamento: '01', finalidade: 'PAGAMENTO A FORNECEDORES', modalidades: ['credito-conta'] },
  { tipoServico: '20', formaLancamento: '41', finalidade: 'PAGAMENTO VIA TED', modalidades: ['ted'] },
  { tipoServico: '20', formaLancamento: '30', finalidade: 'PAGAMENTO BOLETOS BRADESCO', modalidades: ['boleto-bradesco'] },
  { tipoServico: '20', formaLancamento: '31', finalidade: 'PAGAMENTO BOLETOS OUTROS BANCOS', modalidades: ['boleto-outros', 'codigo-barras', 'dda'] },
  { tipoServico: '30', formaLancamento: '01', finalidade: 'PAGAMENTO DE SALARIOS', modalidades: ['salario-conta'] },
  { tipoServico: '30', formaLancamento: '06', finalidade: 'CREDITO CONTA SALARIO', modalidades: ['salario-conta-salario'] },
  { tipoServico: '22', formaLancamento: '16', finalidade: 'PAGAMENTO DE DARF', modalidades: ['darf'] },
  { tipoServico: '22', formaLancamento: '18', finalidade: 'PAGAMENTO DE GPS', modalidades: ['gps'] },
  { tipoServico: '22', formaLancamento: '19', finalidade: 'PAGAMENTO GARE ICMS', modalidades: ['gare-icms'] },
  { tipoServico: '22', formaLancamento: '22', finalidade: 'PAGAMENTO GNRE', modalidades: ['gnre'] },
  { tipoServico: '22', formaLancamento: '23', finalidade: 'PAGAMENTO FGTS', modalidades: ['fgts'] },
  { tipoServico: '20', formaLancamento: '43', finalidade: 'PAGAMENTO VIA PIX CHAVE', modalidades: ['pix-chave', 'ted-to-pix'] },
  { tipoServico: '20', formaLancamento: '45', finalidade: 'PAGAMENTO VIA PIX QR CODE', modalidades: ['pix-qrcode'] },
];

function getCamara(modalidade: TipoModalidade, bancoDestino?: string): string {
  if (['pix-chave', 'pix-qrcode', 'ted-to-pix'].includes(modalidade)) return '009';
  if (modalidade === 'ted') return '018';
  const banco = onlyDigits(bancoDestino || '237');
  return banco === '237' ? '237' : '018';
}

function gerarRegsCC(pag: PagamentoCreditoConta, lote: number, seq: number): string[] {
  return [
    gerarSegmentoA({
      lote, seq,
      camara: getCamara('credito-conta', pag.bancoBeneficiario),
      bancoBeneficiario: pag.bancoBeneficiario || '237',
      agenciaBeneficiario: pag.agenciaBeneficiario,
      agenciaBeneficiarioDv: pag.agenciaBeneficiarioDv,
      contaBeneficiario: pag.contaBeneficiario,
      contaBeneficiarioDv: pag.contaBeneficiarioDv,
      nomeBeneficiario: pag.nomeBeneficiario,
      numeroDocumento: pag.numeroDocumento,
      dataPagamento: pag.dataPagamento,
      valor: pag.valor,
      finalidadeTED: '  ',
      tipoInscBeneficiario: pag.tipoCpfCnpj,
      cpfCnpjBeneficiario: pag.cpfCnpjBeneficiario,
    }),
  ];
}

function gerarRegsTED(pag: PagamentoTED, lote: number, seq: number): string[] {
  return [
    gerarSegmentoA({
      lote, seq,
      camara: '018',
      bancoBeneficiario: pag.bancoBeneficiario,
      agenciaBeneficiario: pag.agenciaBeneficiario,
      agenciaBeneficiarioDv: pag.agenciaBeneficiarioDv,
      contaBeneficiario: pag.contaBeneficiario,
      contaBeneficiarioDv: pag.contaBeneficiarioDv,
      nomeBeneficiario: pag.nomeBeneficiario,
      numeroDocumento: pag.numeroDocumento,
      dataPagamento: pag.dataPagamento,
      valor: pag.valor,
      finalidadeTED: (pag.finalidadeTED || '10').slice(-2).padStart(2, '0'),
      tipoInscBeneficiario: pag.tipoCpfCnpj,
      cpfCnpjBeneficiario: pag.cpfCnpjBeneficiario,
    }),
  ];
}

function gerarRegsBoleto(pag: PagamentoBoleto, lote: number, seq: number): string[] {
  return [
    gerarSegmentoJ({
      lote, seq,
      codigoBarras: pag.codigoBarras,
      nomeBeneficiario: pag.nomeBeneficiario,
      dataVencimento: pag.dataVencimento || pag.dataPagamento,
      dataPagamento: pag.dataPagamento,
      valor: pag.valor,
      numeroDocumento: pag.numeroDocumento,
    }),
  ];
}

function gerarRegsPix(pag: PagamentoPix, lote: number, seq: number): string[] {
  const tipoChaveMap: Record<string, '1' | '2' | '3' | '4' | '5'> = {
    cpf: '1', cnpj: '2', celular: '3', email: '4', evp: '5',
  };
  const tipoChave = tipoChaveMap[pag.tipoChave] || '1';

  return [
    gerarSegmentoA({
      lote, seq,
      camara: '009',
      bancoBeneficiario: '000',
      agenciaBeneficiario: '00000',
      agenciaBeneficiarioDv: '0',
      contaBeneficiario: '000000000000',
      contaBeneficiarioDv: '0',
      nomeBeneficiario: pag.nomeBeneficiario,
      numeroDocumento: pag.numeroDocumento,
      dataPagamento: pag.dataPagamento,
      valor: pag.valor,
      finalidadeTED: '  ',
      tipoInscBeneficiario: pag.tipoCpfCnpj,
      cpfCnpjBeneficiario: pag.cpfCnpjBeneficiario,
    }),
    gerarSegmentoB({
      lote, seq: seq + 1,
      tipoChave,
      chave: pag.chavePix,
    }),
  ];
}

function gerarRegsPixQR(pag: PagamentoPixQR, lote: number, seq: number): string[] {
  const payload = pag.qrCodePayload || '';
  return [
    gerarSegmentoA({
      lote, seq,
      camara: '009',
      bancoBeneficiario: '000',
      agenciaBeneficiario: '00000',
      agenciaBeneficiarioDv: '0',
      contaBeneficiario: '000000000000',
      contaBeneficiarioDv: '0',
      nomeBeneficiario: pag.nomeBeneficiario,
      numeroDocumento: pag.numeroDocumento,
      dataPagamento: pag.dataPagamento,
      valor: pag.valor,
      finalidadeTED: '  ',
      tipoInscBeneficiario: '1',
      cpfCnpjBeneficiario: '00000000000',
    }),
    gerarSegmentoB({
      lote, seq: seq + 1,
      tipoChave: '9',
      chave: payload.slice(0, 14),
      logradouro: payload.slice(14, 44),
      nrLogradouro: payload.slice(44, 49),
      complemento: payload.slice(49, 64),
    }),
  ];
}

function gerarRegsDARF(pag: PagamentoDARF, lote: number, seq: number): string[] {
  return [
    gerarSegmentoNDARF({
      lote, seq,
      dataPagamento: pag.dataPagamento,
      tipoTributo: '16',
      cnpjCpf: pag.cnpjCpfContribuinte,
      tipoInsc: pag.tipoInscricao,
      codigoReceita: pag.codigoReceita,
      periodoApuracao: pag.periodoApuracao,
      numeroReferencia: pag.numeroReferencia,
      valorPrincipal: pag.valorPrincipal,
      valorMulta: pag.valorMulta,
      valorJuros: pag.valorJuros,
      dataVencimento: pag.dataVencimento || pag.dataPagamento,
    }),
  ];
}

function gerarRegsGPS(pag: PagamentoGPS, lote: number, seq: number): string[] {
  return [
    gerarSegmentoNGPS({
      lote, seq,
      dataPagamento: pag.dataPagamento,
      identificador: pag.identificador,
      codigoPagamento: pag.codigoPagamento,
      competencia: pag.competencia,
      valorInss: pag.valorInss,
      valorOutrasEntidades: pag.valorOutrasEntidades,
      valorAtualizacao: pag.valorAtualizacao,
      dataVencimento: pag.dataVencimento || pag.dataPagamento,
    }),
  ];
}

function gerarRegsGARE(pag: PagamentoGARE, lote: number, seq: number): string[] {
  if (pag.modalidade === 'gnre') {
    return [
      gerarSegmentoNGNRE({
        lote, seq,
        dataPagamento: pag.dataPagamento,
        cnpjCpf: pag.cnpjCpfContribuinte,
        tipoInsc: pag.tipoInscricao,
        codigoReceita: pag.codigoReceita,
        ufFavorecida: pag.ufFavorecida || 'SP',
        periodoApuracao: pag.periodoApuracao,
        numeroReferencia: pag.numeroReferencia,
        valorPrincipal: pag.valorPrincipal,
        valorMulta: pag.valorMulta,
        valorJuros: pag.valorJuros,
        dataVencimento: pag.dataVencimento || pag.dataPagamento,
      }),
    ];
  }

  if (pag.modalidade === 'fgts') {
    return [
      gerarSegmentoNFGTS({
        lote, seq,
        dataPagamento: pag.dataPagamento,
        cnpjEmpregador: pag.cnpjCpfContribuinte,
        nrRecolhimento: pag.numeroReferencia,
        competencia: pag.periodoApuracao,
        valorPrincipal: pag.valorPrincipal,
        valorMulta: pag.valorMulta,
        valorJuros: pag.valorJuros,
        dataVencimento: pag.dataVencimento || pag.dataPagamento,
      }),
    ];
  }

  return [
    gerarSegmentoNGARE({
      lote, seq,
      dataPagamento: pag.dataPagamento,
      tipoTributo: '19',
      inscricaoEstadual: pag.cnpjCpfContribuinte,
      codigoReceita: pag.codigoReceita,
      periodoApuracao: pag.periodoApuracao,
      numeroReferencia: pag.numeroReferencia,
      valorPrincipal: pag.valorPrincipal,
      valorMulta: pag.valorMulta,
      valorJuros: pag.valorJuros,
      dataVencimento: pag.dataVencimento || pag.dataPagamento,
    }),
  ];
}

export function gerarArquivoCNAB240(empresa: EmpresaData, pagamentos: Pagamento[]): string {
  if (pagamentos.length === 0) throw new Error('Nenhum pagamento adicionado.');

  const lines: string[] = [];
  lines.push(gerarHeaderArquivo(empresa));

  let loteNum = 1;
  let totalRegistros = 1;

  for (const grupo of LOTE_GROUPS) {
    const pagsGrupo = pagamentos.filter((p) => grupo.modalidades.includes(p.modalidade));
    if (pagsGrupo.length === 0) continue;

    const loteLines: string[] = [];
    loteLines.push(gerarHeaderLote(empresa, {
      lote: loteNum,
      tipoServico: grupo.tipoServico,
      formaLancamento: grupo.formaLancamento,
      finalidade: grupo.finalidade,
    }));

    let seqLote = 1;
    let valorLote = 0;

    for (const pag of pagsGrupo) {
      let regs: string[] = [];
      switch (pag.modalidade) {
        case 'credito-conta':
        case 'salario-conta':
        case 'salario-conta-salario':
          regs = gerarRegsCC(pag as PagamentoCreditoConta, loteNum, seqLote); break;
        case 'ted':
          regs = gerarRegsTED(pag as PagamentoTED, loteNum, seqLote); break;
        case 'boleto-bradesco':
        case 'boleto-outros':
        case 'codigo-barras':
        case 'dda':
          regs = gerarRegsBoleto(pag as PagamentoBoleto, loteNum, seqLote); break;
        case 'pix-chave':
        case 'ted-to-pix':
          regs = gerarRegsPix(pag as PagamentoPix, loteNum, seqLote); break;
        case 'pix-qrcode':
          regs = gerarRegsPixQR(pag as PagamentoPixQR, loteNum, seqLote); break;
        case 'darf':
          regs = gerarRegsDARF(pag as PagamentoDARF, loteNum, seqLote); break;
        case 'gps':
          regs = gerarRegsGPS(pag as PagamentoGPS, loteNum, seqLote); break;
        case 'gare-icms':
        case 'gnre':
        case 'fgts':
          regs = gerarRegsGARE(pag as PagamentoGARE, loteNum, seqLote); break;
      }
      loteLines.push(...regs);
      seqLote += regs.length;
      valorLote += pag.valor;
    }

    const qtdRegsLote = loteLines.length + 1;
    loteLines.push(gerarTrailerLote(loteNum, qtdRegsLote, valorLote));
    lines.push(...loteLines);
    totalRegistros += loteLines.length;
    loteNum++;
  }

  const qtdLotes = loteNum - 1;
  totalRegistros += 1;
  lines.push(gerarTrailerArquivo(qtdLotes, totalRegistros));

  return lines.join('\r\n') + '\r\n';
}

export function downloadCNAB240(empresa: EmpresaData, pagamentos: Pagamento[]): void {
  const content = gerarArquivoCNAB240(empresa, pagamentos);
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const blob = new Blob([content], { type: 'text/plain;charset=iso-8859-1' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MULTIPAG_${dd}${mm}${yyyy}_${hh}${min}${ss}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
