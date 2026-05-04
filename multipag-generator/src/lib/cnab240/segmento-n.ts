import { buildLine, formatDate, formatMoney, normalize, onlyDigits, padRight } from './utils';

interface SegmentoNBase {
  lote: number;
  seq: number;
  dataPagamento: string;
}

export interface SegmentoNDARFData extends SegmentoNBase {
  tipoTributo: '16' | '17';
  cnpjCpf: string;
  tipoInsc: '1' | '2';
  codigoReceita: string; // 4 digits
  periodoApuracao: string; // MMAAAA
  numeroReferencia: string;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  dataVencimento: string;
}

// Segmento N — DARF Normal (tipo 16) / DARF Simples (tipo 17)
export function gerarSegmentoNDARF(data: SegmentoNDARFData): string {
  const cnpjCpf = onlyDigits(data.cnpjCpf).padStart(14, '0');
  let periodo = onlyDigits(data.periodoApuracao);
  if (periodo.length === 6) periodo += '00'; // MMAAAA → MMAAAA00
  periodo = periodo.padEnd(8, '0').slice(0, 8);
  const valorTotal = data.valorPrincipal + data.valorMulta + data.valorJuros;

  return buildLine([
    ['237', 3, 'R'],                                        // 001-003
    [String(data.lote), 4, 'R'],                            // 004-007
    ['3', 1, 'L'],                                          // 008
    [String(data.seq), 5, 'R'],                             // 009-013
    ['N', 1, 'L'],                                          // 014
    ['0', 1, 'L'],                                          // 015
    ['00', 2, 'L'],                                         // 016-017
    [formatDate(data.dataPagamento), 8, 'L'],               // 018-025 Data Pagamento
    [data.tipoTributo, 2, 'L'],                             // 026-027 Tipo Tributo
    [onlyDigits(data.codigoReceita).padStart(4, '0'), 4, 'R'], // 028-031 Código Receita (4)
    [formatDate(data.dataVencimento), 8, 'L'],              // 032-039 Data Vencimento
    [periodo, 8, 'L'],                                      // 040-047 Período Apuração
    [cnpjCpf, 14, 'R'],                                     // 048-061 CNPJ/CPF (14)
    [padRight(normalize(data.numeroReferencia || ''), 16), 16, 'L'], // 062-077 Nº Referência (16)
    [formatMoney(data.valorPrincipal, 15), 15, 'R'],        // 078-092 Valor Principal
    [formatMoney(data.valorMulta, 15), 15, 'R'],            // 093-107 Valor Multa
    [formatMoney(data.valorJuros, 15), 15, 'R'],            // 108-122 Valor Juros
    [formatMoney(valorTotal, 15), 15, 'R'],                 // 123-137 Valor Total
    ['', 93, 'L'],                                          // 138-230 Uso FEBRABAN
    ['', 10, 'L'],                                          // 231-240 Ocorrências
  ]);
}

export interface SegmentoNGPSData extends SegmentoNBase {
  identificador: string; // NIT/PIS/CNPJ (9-14 digits)
  codigoPagamento: string;
  competencia: string; // MMAAAA
  valorInss: number;
  valorOutrasEntidades: number;
  valorAtualizacao: number;
  dataVencimento: string;
}

// Segmento N — GPS (tipo 18)
export function gerarSegmentoNGPS(data: SegmentoNGPSData): string {
  const ident = onlyDigits(data.identificador).padStart(14, '0');
  const competencia = onlyDigits(data.competencia).padStart(6, '0').slice(0, 6);
  const valorTotal = data.valorInss + data.valorOutrasEntidades + data.valorAtualizacao;

  return buildLine([
    ['237', 3, 'R'],
    [String(data.lote), 4, 'R'],
    ['3', 1, 'L'],
    [String(data.seq), 5, 'R'],
    ['N', 1, 'L'],
    ['0', 1, 'L'],
    ['00', 2, 'L'],
    [formatDate(data.dataPagamento), 8, 'L'],               // 018-025 Data Pagamento
    ['18', 2, 'L'],                                         // 026-027 Tipo Tributo GPS
    [ident, 14, 'R'],                                       // 028-041 Identificador NIT/PIS (14)
    [onlyDigits(data.codigoPagamento).padStart(6, '0'), 6, 'R'], // 042-047 Código Pagamento (6)
    [competencia, 6, 'L'],                                  // 048-053 Competência MMAAAA (6)
    [formatMoney(data.valorInss, 15), 15, 'R'],             // 054-068 Valor INSS
    [formatMoney(data.valorOutrasEntidades, 15), 15, 'R'],  // 069-083 Valor Outras Entidades
    [formatMoney(data.valorAtualizacao, 15), 15, 'R'],      // 084-098 Valor Atualização
    [formatMoney(valorTotal, 15), 15, 'R'],                 // 099-113 Valor Total
    [formatDate(data.dataVencimento), 8, 'L'],              // 114-121 Data Vencimento
    ['', 109, 'L'],                                         // 122-230 Uso FEBRABAN
    ['', 10, 'L'],                                          // 231-240 Ocorrências
  ]);
}

export interface SegmentoNGAREData extends SegmentoNBase {
  tipoTributo: '19' | '20' | '21';
  inscricaoEstadual: string;
  codigoReceita: string;
  periodoApuracao: string; // MMAAAA
  numeroReferencia: string;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  dataVencimento: string;
}

// Segmento N — GARE-SP ICMS (19), GARE-SP DR (20), GARE-SP ITCMD (21)
export function gerarSegmentoNGARE(data: SegmentoNGAREData): string {
  const ie = onlyDigits(data.inscricaoEstadual).padStart(14, '0');
  const periodo = onlyDigits(data.periodoApuracao).padStart(8, '0').slice(0, 8);
  const valorTotal = data.valorPrincipal + data.valorMulta + data.valorJuros;

  return buildLine([
    ['237', 3, 'R'],
    [String(data.lote), 4, 'R'],
    ['3', 1, 'L'],
    [String(data.seq), 5, 'R'],
    ['N', 1, 'L'],
    ['0', 1, 'L'],
    ['00', 2, 'L'],
    [formatDate(data.dataPagamento), 8, 'L'],               // 018-025
    [data.tipoTributo, 2, 'L'],                             // 026-027
    [ie, 14, 'R'],                                          // 028-041 IE (14)
    [onlyDigits(data.codigoReceita).padStart(6, '0'), 6, 'R'], // 042-047 Código Receita (6)
    [periodo, 8, 'L'],                                      // 048-055 Período Apuração (8)
    [padRight(normalize(data.numeroReferencia || ''), 16), 16, 'L'], // 056-071 Nº Referência (16)
    [formatMoney(data.valorPrincipal, 15), 15, 'R'],        // 072-086 Valor Principal
    [formatMoney(data.valorMulta, 15), 15, 'R'],            // 087-101 Valor Multa
    [formatMoney(data.valorJuros, 15), 15, 'R'],            // 102-116 Valor Juros
    [formatMoney(valorTotal, 15), 15, 'R'],                 // 117-131 Valor Total
    ['', 99, 'L'],                                          // 132-230 Uso FEBRABAN
    ['', 10, 'L'],                                          // 231-240 Ocorrências
  ]);
}

export interface SegmentoNGNREData extends SegmentoNBase {
  cnpjCpf: string;
  tipoInsc: '1' | '2';
  codigoReceita: string;
  ufFavorecida: string;
  periodoApuracao: string; // MMAAAA
  numeroReferencia: string;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  dataVencimento: string;
}

// Segmento N — GNRE (tipo 22)
export function gerarSegmentoNGNRE(data: SegmentoNGNREData): string {
  const cnpjCpf = onlyDigits(data.cnpjCpf).padStart(14, '0');
  const periodo = onlyDigits(data.periodoApuracao).padStart(8, '0').slice(0, 8);
  const valorTotal = data.valorPrincipal + data.valorMulta + data.valorJuros;
  const uf = (data.ufFavorecida || 'SP').toUpperCase().padEnd(2, ' ').slice(0, 2);

  return buildLine([
    ['237', 3, 'R'],
    [String(data.lote), 4, 'R'],
    ['3', 1, 'L'],
    [String(data.seq), 5, 'R'],
    ['N', 1, 'L'],
    ['0', 1, 'L'],
    ['00', 2, 'L'],
    [formatDate(data.dataPagamento), 8, 'L'],               // 018-025
    ['22', 2, 'L'],                                         // 026-027
    [cnpjCpf, 14, 'R'],                                     // 028-041 CNPJ/CPF (14)
    [onlyDigits(data.codigoReceita).padStart(6, '0'), 6, 'R'], // 042-047 Código Receita (6)
    [uf, 2, 'L'],                                           // 048-049 UF Favorecida (2)
    [periodo, 8, 'L'],                                      // 050-057 Período Apuração (8)
    [padRight(normalize(data.numeroReferencia || ''), 16), 16, 'L'], // 058-073 Nº Referência (16)
    [formatMoney(data.valorPrincipal, 15), 15, 'R'],        // 074-088 Valor Principal
    [formatMoney(data.valorMulta, 15), 15, 'R'],            // 089-103 Valor Multa
    [formatMoney(data.valorJuros, 15), 15, 'R'],            // 104-118 Valor Juros
    [formatMoney(valorTotal, 15), 15, 'R'],                 // 119-133 Valor Total
    ['', 97, 'L'],                                          // 134-230 Uso FEBRABAN
    ['', 10, 'L'],                                          // 231-240 Ocorrências
  ]);
}

export interface SegmentoNFGTSData extends SegmentoNBase {
  cnpjEmpregador: string;
  nrRecolhimento: string;
  competencia: string; // MMAAAA
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  dataVencimento: string;
}

// Segmento N — FGTS (tipo 23)
export function gerarSegmentoNFGTS(data: SegmentoNFGTSData): string {
  const cnpj = onlyDigits(data.cnpjEmpregador).padStart(14, '0');
  const competencia = onlyDigits(data.competencia).padStart(8, '0').slice(0, 8);
  const valorTotal = data.valorPrincipal + data.valorMulta + data.valorJuros;

  return buildLine([
    ['237', 3, 'R'],
    [String(data.lote), 4, 'R'],
    ['3', 1, 'L'],
    [String(data.seq), 5, 'R'],
    ['N', 1, 'L'],
    ['0', 1, 'L'],
    ['00', 2, 'L'],
    [formatDate(data.dataPagamento), 8, 'L'],               // 018-025
    ['23', 2, 'L'],                                         // 026-027
    [cnpj, 14, 'R'],                                        // 028-041 CNPJ Empregador (14)
    [padRight(normalize(data.nrRecolhimento || ''), 15), 15, 'L'], // 042-056 Nº Recolhimento (15)
    [competencia, 8, 'L'],                                  // 057-064 Competência (8)
    [formatMoney(data.valorPrincipal, 15), 15, 'R'],        // 065-079 Valor Principal
    [formatMoney(data.valorMulta, 15), 15, 'R'],            // 080-094 Valor Multa
    [formatMoney(data.valorJuros, 15), 15, 'R'],            // 095-109 Valor Juros
    [formatMoney(valorTotal, 15), 15, 'R'],                 // 110-124 Valor Total
    [formatDate(data.dataVencimento), 8, 'L'],              // 125-132 Data Vencimento
    ['', 98, 'L'],                                          // 133-230 Uso FEBRABAN
    ['', 10, 'L'],                                          // 231-240 Ocorrências
  ]);
}
