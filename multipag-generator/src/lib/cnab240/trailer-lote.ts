import { buildLine, formatMoney } from './utils';

// Trailer de Lote — Registro Tipo 5 (240 posições)
export function gerarTrailerLote(
  lote: number,
  qtdRegistros: number,
  valorTotal: number,
): string {
  return buildLine([
    ['237', 3, 'R'],                    // 001-003 Banco
    [String(lote), 4, 'R'],            // 004-007 Lote
    ['5', 1, 'L'],                      // 008 Tipo Registro
    ['', 9, 'L'],                       // 009-017 Uso FEBRABAN
    [String(qtdRegistros), 6, 'R'],    // 018-023 Qtd Registros no Lote
    ['000000', 6, 'L'],                 // 024-029 Somatória Quantidades
    [formatMoney(valorTotal, 17), 17, 'R'], // 030-046 Somatória Valores (17)
    ['000000', 6, 'L'],                 // 047-052 Qtd Cobranças Simples
    ['00000000000000000', 17, 'L'],     // 053-069 Valor Cobranças Simples
    ['000000', 6, 'L'],                 // 070-075 Qtd Cobranças Vinculadas
    ['00000000000000000', 17, 'L'],     // 076-092 Valor Cobranças Vinculadas
    ['', 138, 'L'],                     // 093-230 Uso FEBRABAN
    ['', 10, 'L'],                      // 231-240 Nº Aviso Débito
  ]);
}
