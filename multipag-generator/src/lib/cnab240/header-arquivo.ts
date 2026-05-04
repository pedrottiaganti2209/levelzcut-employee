import { buildLine, formatDate, formatTime, normalize, onlyDigits, padRight } from './utils';
import type { EmpresaData } from '../../types/pagamento';

// Header de Arquivo — Registro Tipo 0 (240 posições)
export function gerarHeaderArquivo(empresa: EmpresaData): string {
  const now = new Date();
  const cnpj = onlyDigits(empresa.cnpj);
  const tipoInsc = cnpj.length <= 11 ? '1' : '2';

  return buildLine([
    ['237', 3, 'R'],                                    // 001-003 Banco
    ['0000', 4, 'L'],                                   // 004-007 Lote = arquivo
    ['0', 1, 'L'],                                      // 008 Tipo Registro
    ['', 9, 'L'],                                       // 009-017 Uso FEBRABAN
    [tipoInsc, 1, 'L'],                                 // 018 Tipo Inscrição
    [cnpj.padStart(14, '0'), 14, 'R'],                  // 019-032 Nº Inscrição (14)
    [padRight(normalize(empresa.convenio || ''), 20), 20, 'L'], // 033-052 Convênio (20)
    [onlyDigits(empresa.agencia).padStart(5, '0'), 5, 'R'],    // 053-057 Agência (5)
    [(empresa.agenciaDv || '0').slice(0, 1), 1, 'L'],  // 058 DV Agência
    [onlyDigits(empresa.conta).padStart(12, '0'), 12, 'R'],    // 059-070 Conta (12)
    [(empresa.contaDv || '0').slice(0, 1), 1, 'L'],    // 071 DV Conta
    ['0', 1, 'L'],                                      // 072 DV Agência/Conta
    [padRight(normalize(empresa.nome), 30), 30, 'L'],   // 073-102 Nome Empresa (30)
    [padRight('BANCO BRADESCO S.A.', 30), 30, 'L'],     // 103-132 Nome Banco (30)
    ['', 10, 'L'],                                      // 133-142 Uso FEBRABAN
    ['1', 1, 'L'],                                      // 143 Código Remessa
    [formatDate(now), 8, 'L'],                          // 144-151 Data Geração (DDMMAAAA)
    [formatTime(now), 6, 'L'],                          // 152-157 Hora Geração (HHMMSS)
    [onlyDigits(empresa.numeroArquivo || '1').padStart(6, '0'), 6, 'R'], // 158-163 Nº Seq Arquivo
    ['089', 3, 'L'],                                    // 164-166 Versão Layout
    ['01600', 5, 'L'],                                  // 167-171 Densidade
    ['', 20, 'L'],                                      // 172-191 Reservado Banco
    ['', 20, 'L'],                                      // 192-211 Reservado Empresa
    ['', 29, 'L'],                                      // 212-240 Uso FEBRABAN
  ]);
}
