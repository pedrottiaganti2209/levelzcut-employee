import { buildLine, formatDate, normalize, onlyDigits, padRight } from './utils';
import type { EmpresaData } from '../../types/pagamento';

export interface LoteConfig {
  lote: number;
  tipoServico: string;   // '20'=Fornecedores, '30'=Salários, '22'=Tributos
  formaLancamento: string; // '01'=CC, '41'=TED, '30'=Boleto próprio, '31'=Boleto outros, '43'=PIX...
  finalidade: string;
}

// Header de Lote — Registro Tipo 1 (240 posições)
export function gerarHeaderLote(empresa: EmpresaData, config: LoteConfig): string {
  const now = new Date();
  const cnpj = onlyDigits(empresa.cnpj);
  const tipoInsc = cnpj.length <= 11 ? '1' : '2';

  return buildLine([
    ['237', 3, 'R'],                                      // 001-003 Banco
    [String(config.lote), 4, 'R'],                        // 004-007 Lote
    ['1', 1, 'L'],                                        // 008 Tipo Registro
    ['C', 1, 'L'],                                        // 009 Tipo Operação (C=crédito)
    [config.tipoServico, 2, 'R'],                         // 010-011 Tipo Serviço
    [config.formaLancamento, 2, 'R'],                     // 012-013 Forma Lançamento
    ['046', 3, 'L'],                                      // 014-016 Versão Layout Lote
    [' ', 1, 'L'],                                        // 017 Uso FEBRABAN
    [tipoInsc, 1, 'L'],                                   // 018 Tipo Inscrição
    [cnpj.padStart(14, '0'), 14, 'R'],                    // 019-032 Nº Inscrição (14)
    [padRight(normalize(empresa.convenio || ''), 20), 20, 'L'], // 033-052 Convênio (20)
    [onlyDigits(empresa.agencia).padStart(5, '0'), 5, 'R'],    // 053-057 Agência (5)
    [(empresa.agenciaDv || '0').slice(0, 1), 1, 'L'],    // 058 DV Agência
    [onlyDigits(empresa.conta).padStart(12, '0'), 12, 'R'],    // 059-070 Conta (12)
    [(empresa.contaDv || '0').slice(0, 1), 1, 'L'],      // 071 DV Conta
    ['0', 1, 'L'],                                        // 072 DV Agência/Conta
    [padRight(normalize(empresa.nome), 30), 30, 'L'],     // 073-102 Nome Empresa (30)
    [padRight(normalize(config.finalidade), 40), 40, 'L'], // 103-142 Finalidade Lote (40)
    ['', 40, 'L'],                                        // 143-182 Histórico (40)
    [onlyDigits(empresa.numeroArquivo || '1').padStart(5, '0'), 5, 'R'], // 183-187 Nº Remessa
    [formatDate(now), 8, 'L'],                            // 188-195 Data Gravação (DDMMAAAA)
    ['0000', 4, 'L'],                                     // 196-199 Data Crédito
    ['', 41, 'L'],                                        // 200-240 Uso FEBRABAN
  ]);
}
