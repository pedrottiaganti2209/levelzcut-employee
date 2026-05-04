import { buildLine, normalize, onlyDigits, padRight } from './utils';

export interface SegmentoBData {
  lote: number;
  seq: number;
  // Tipo Inscrição/Chave: 1=CPF, 2=CNPJ, 3=Celular, 4=Email, 5=EVP, 9=QRCode
  tipoChave: '1' | '2' | '3' | '4' | '5' | '9';
  chave: string;          // PIX key or CNPJ/CPF
  logradouro?: string;
  nrLogradouro?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  estado?: string;
}

// Segmento B — Registro Tipo 3, Segmento B (240 posições)
// Usado para: dados complementares de PIX, endereço de beneficiário
export function gerarSegmentoB(data: SegmentoBData): string {
  const chave = data.chave || '';

  // For numeric keys (CPF/CNPJ/Phone), place directly in NrInsc (14 chars)
  // For alphanumeric keys (email, EVP, QRCode), use available text fields
  const isNumeric = ['1', '2', '3'].includes(data.tipoChave);
  const nrInsc = isNumeric
    ? onlyDigits(chave).padStart(14, '0').slice(-14)
    : chave.padEnd(14, ' ').slice(0, 14);

  // Long key overflow into address fields
  const chaveResto = !isNumeric && chave.length > 14 ? chave.slice(14) : '';
  const logradouro = chaveResto ? chaveResto.slice(0, 30) : (data.logradouro || '');
  const nrEndereco = chaveResto ? chaveResto.slice(30, 35) : (data.nrLogradouro || '');
  const compl = chaveResto ? chaveResto.slice(35, 50) : (data.complemento || '');

  return buildLine([
    ['237', 3, 'R'],                                      // 001-003 Banco
    [String(data.lote), 4, 'R'],                          // 004-007 Lote
    ['3', 1, 'L'],                                        // 008 Tipo Registro
    [String(data.seq), 5, 'R'],                           // 009-013 Seq
    ['B', 1, 'L'],                                        // 014 Segmento
    ['0', 1, 'L'],                                        // 015 Tipo Movimento
    ['00', 2, 'L'],                                       // 016-017 Cód Instrução
    [data.tipoChave, 1, 'L'],                             // 018 Tipo Inscrição/Chave
    [nrInsc, 14, 'R'],                                    // 019-032 Nº Inscrição (14)
    [padRight(normalize(logradouro), 30), 30, 'L'],       // 033-062 Logradouro (30)
    [padRight(normalize(nrEndereco), 5), 5, 'L'],         // 063-067 Nº (5)
    [padRight(normalize(compl), 15), 15, 'L'],            // 068-082 Complemento (15)
    [padRight(normalize(data.bairro || ''), 15), 15, 'L'], // 083-097 Bairro (15)
    [padRight(normalize(data.cidade || ''), 20), 20, 'L'], // 098-117 Cidade (20)
    [onlyDigits(data.cep || '').padStart(5, '0').slice(0, 5), 5, 'R'], // 118-122 CEP (5)
    [onlyDigits(data.cep || '').padStart(8, '0').slice(5, 8), 3, 'L'], // 123-125 Compl CEP (3)
    [(data.estado || '').toUpperCase().padEnd(2, ' ').slice(0, 2), 2, 'L'], // 126-127 UF (2)
    ['00000000', 8, 'L'],                                 // 128-135 Data Vencimento
    ['000000000000000', 15, 'L'],                         // 136-150 Valor Doc
    ['000000000000000', 15, 'L'],                         // 151-165 Valor Abatimento
    ['000000000000000', 15, 'L'],                         // 166-180 Valor Desconto
    ['000000000000000', 15, 'L'],                         // 181-195 Valor Mora
    ['000000000000000', 15, 'L'],                         // 196-210 Valor Multa
    ['0', 1, 'L'],                                        // 211 Cód Doc Favorecido
    ['', 15, 'L'],                                        // 212-226 Nº Doc Favorecido (15)
    ['00', 2, 'L'],                                       // 227-228 Cód Finalidade Complemento
    ['', 10, 'L'],                                        // 229-238 Info Complementar
    ['', 2, 'L'],                                         // 239-240 Uso FEBRABAN
  ]);
}
