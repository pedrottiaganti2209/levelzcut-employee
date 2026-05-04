import { buildLine, formatDate, formatMoney, normalize, onlyDigits, padRight } from './utils';

export interface SegmentoAData {
  lote: number;
  seq: number;
  camara: string;    // '237'=Bradesco, '018'=TED/STR, '009'=PIX
  bancoBeneficiario: string;
  agenciaBeneficiario: string;
  agenciaBeneficiarioDv: string;
  contaBeneficiario: string;
  contaBeneficiarioDv: string;
  nomeBeneficiario: string;
  numeroDocumento: string;
  dataPagamento: string;
  valor: number;
  finalidadeDOC?: string;
  finalidadeTED?: string;   // 2 chars
  finalidadeCompl?: string;
  aviso?: string;
  tipoInscBeneficiario: '1' | '2';
  cpfCnpjBeneficiario: string;
}

export const FINALIDADES_TED: Record<string, string> = {
  '01': 'Pagamento de Impostos, Taxas e Tributos',
  '02': 'Pagamento a Concessionárias de Serviço Público',
  '03': 'Pagamento de Dividendos',
  '04': 'Pagamento de Salários',
  '05': 'Pagamento de Fornecedores',
  '06': 'Pagamento de Honorários',
  '07': 'Pagamento de Aluguéis e Condomínio',
  '08': 'Pagamento de Duplicatas e Títulos',
  '09': 'Pagamento de Honorários Advocatícios',
  '10': 'Crédito em Conta',
  '11': 'Pagamento a Corretoras',
  '98': 'Transferência pelo Banco',
  '99': 'Outros',
};

// Segmento A — Registro Tipo 3, Segmento A (240 posições)
// Usado para: Crédito CC, TED, Salário, PIX Chave
export function gerarSegmentoA(data: SegmentoAData): string {
  const cpfCnpj = onlyDigits(data.cpfCnpjBeneficiario);
  const nrInsc = cpfCnpj.padStart(14, '0');
  const finalidadeTED = (data.finalidadeTED || '  ').slice(0, 2).padEnd(2, ' ');
  const finalidadeDOC = (data.finalidadeDOC || '  ').slice(0, 2).padEnd(2, ' ');
  const finalidadeCompl = (data.finalidadeCompl || '').slice(0, 15).padEnd(15, ' ');

  return buildLine([
    ['237', 3, 'R'],                                        // 001-003 Banco
    [String(data.lote), 4, 'R'],                            // 004-007 Lote
    ['3', 1, 'L'],                                          // 008 Tipo Registro
    [String(data.seq), 5, 'R'],                             // 009-013 Seq Registro
    ['A', 1, 'L'],                                          // 014 Segmento
    ['0', 1, 'L'],                                          // 015 Tipo Movimento (0=inclusão)
    ['00', 2, 'L'],                                         // 016-017 Cód Instrução (00)
    [onlyDigits(data.camara).padStart(3, '0'), 3, 'R'],    // 018-020 Câmara Centralizadora
    [onlyDigits(data.bancoBeneficiario).padStart(3, '0'), 3, 'R'], // 021-023 Banco Beneficiário
    [onlyDigits(data.agenciaBeneficiario).padStart(5, '0'), 5, 'R'], // 024-028 Agência
    [(data.agenciaBeneficiarioDv || '0').slice(0, 1), 1, 'L'], // 029 DV Agência
    [onlyDigits(data.contaBeneficiario).padStart(12, '0'), 12, 'R'], // 030-041 Conta
    [(data.contaBeneficiarioDv || '0').slice(0, 1), 1, 'L'],        // 042 DV Conta
    ['0', 1, 'L'],                                          // 043 DV Ag/Conta
    [padRight(normalize(data.nomeBeneficiario), 30), 30, 'L'],      // 044-073 Nome (30)
    [padRight(normalize(data.numeroDocumento || ''), 20), 20, 'L'], // 074-093 Nº Doc Empresa (20)
    [formatDate(data.dataPagamento), 8, 'L'],               // 094-101 Data Pagamento (DDMMAAAA)
    ['BRL', 3, 'L'],                                        // 102-104 Tipo Moeda
    ['00000000000000', 14, 'L'],                            // 105-118 Qtd Moeda (não usado)
    [formatMoney(data.valor, 15), 15, 'R'],                 // 119-133 Valor Pagamento (15)
    ['', 15, 'L'],                                          // 134-148 Nº Doc Banco (15)
    ['00000000', 8, 'L'],                                   // 149-156 Data Real Efetivação
    ['000000000000000', 15, 'L'],                           // 157-171 Valor Real Efetivação
    ['', 20, 'L'],                                          // 172-191 Info Complementar (20)
    [finalidadeDOC, 2, 'L'],                                // 192-193 Finalidade DOC
    [finalidadeTED, 2, 'L'],                                // 194-195 Finalidade TED
    [finalidadeCompl, 15, 'L'],                             // 196-210 Finalidade Complemento
    [(data.aviso || '0').slice(0, 1), 1, 'L'],              // 211 Aviso Favorecido
    [data.tipoInscBeneficiario, 1, 'L'],                    // 212 Tipo Inscrição
    [nrInsc, 14, 'R'],                                      // 213-226 Nº Inscrição (14)
    ['', 4, 'L'],                                           // 227-230 Brancos
    ['', 10, 'L'],                                          // 231-240 Ocorrências
  ]);
}
