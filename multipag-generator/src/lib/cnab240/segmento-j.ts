import { buildLine, formatDate, formatMoney, linhaDigitavelToCodigoBarras, normalize, onlyDigits, padRight } from './utils';

export interface SegmentoJData {
  lote: number;
  seq: number;
  codigoBarras: string;  // 44-digit barcode or 47-digit linha digitável (auto-converted)
  nomeBeneficiario: string;
  dataVencimento: string;
  dataPagamento: string;
  valor: number;
  numeroDocumento: string;
  valorDesconto?: number;
  valorMora?: number;
}

// Segmento J — Registro Tipo 3, Segmento J (240 posições)
// Usado para: Boleto Bradesco, Boleto Outros Bancos, Código de Barras, DDA
export function gerarSegmentoJ(data: SegmentoJData): string {
  const barcode = linhaDigitavelToCodigoBarras(onlyDigits(data.codigoBarras))
    .padEnd(44, '0')
    .slice(0, 44);

  return buildLine([
    ['237', 3, 'R'],                                        // 001-003 Banco
    [String(data.lote), 4, 'R'],                            // 004-007 Lote
    ['3', 1, 'L'],                                          // 008 Tipo Registro
    [String(data.seq), 5, 'R'],                             // 009-013 Seq
    ['J', 1, 'L'],                                          // 014 Segmento
    ['0', 1, 'L'],                                          // 015 Tipo Movimento
    ['00', 2, 'L'],                                         // 016-017 Cód Instrução
    [barcode, 44, 'L'],                                     // 018-061 Código de Barras (44)
    [padRight(normalize(data.nomeBeneficiario || ''), 30), 30, 'L'], // 062-091 Nome Beneficiário (30)
    [formatDate(data.dataVencimento || data.dataPagamento), 8, 'L'], // 092-099 Data Vencimento
    [formatMoney(data.valor, 15), 15, 'R'],                 // 100-114 Valor do Título (15)
    [formatMoney(data.valorDesconto || 0, 15), 15, 'R'],   // 115-129 Valor Desconto/Abatimento (15)
    [formatMoney(data.valorMora || 0, 15), 15, 'R'],       // 130-144 Valor Mora/Multa (15)
    [formatDate(data.dataPagamento), 8, 'L'],               // 145-152 Data Pagamento
    [formatMoney(data.valor, 15), 15, 'R'],                 // 153-167 Valor Pagamento (15)
    [padRight(normalize(data.numeroDocumento || ''), 15), 15, 'L'], // 168-182 Nº Doc Empresa (15)
    ['', 20, 'L'],                                          // 183-202 Nº Doc Banco (20)
    ['', 7, 'L'],                                           // 203-209 Uso FEBRABAN
    ['', 21, 'L'],                                          // 210-230 Uso FEBRABAN
    ['', 10, 'L'],                                          // 231-240 Ocorrências
  ]);
}
