import { buildLine } from './utils';

// Trailer de Arquivo — Registro Tipo 9 (240 posições)
export function gerarTrailerArquivo(qtdLotes: number, qtdRegistros: number): string {
  return buildLine([
    ['237', 3, 'R'],             // 001-003 Banco
    ['9999', 4, 'L'],            // 004-007 Lote = arquivo
    ['9', 1, 'L'],               // 008 Tipo Registro
    ['', 9, 'L'],                // 009-017 Uso FEBRABAN
    [String(qtdLotes), 6, 'R'],  // 018-023 Qtd Lotes
    [String(qtdRegistros), 6, 'R'], // 024-029 Qtd Registros Total
    ['000000', 6, 'L'],          // 030-035 Qtd Contas
    ['', 205, 'L'],              // 036-240 Uso FEBRABAN
  ]);
}
