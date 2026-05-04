function modulo10(block: string): string {
  let sum = 0;
  let mult = 2;
  for (let i = block.length - 1; i >= 0; i--) {
    let prod = parseInt(block[i]) * mult;
    if (prod > 9) prod = Math.floor(prod / 10) + (prod % 10);
    sum += prod;
    mult = mult === 2 ? 1 : 2;
  }
  const rem = sum % 10;
  return rem === 0 ? '0' : String(10 - rem);
}

export function validarLinhaDigitavel(linha: string): { valid: boolean; error?: string } {
  const d = linha.replace(/\D/g, '');
  if (d.length !== 47) return { valid: false, error: 'Linha digitável deve ter 47 dígitos' };

  const campo1 = d.slice(0, 9);
  const dv1 = d[9];
  const campo2 = d.slice(10, 20);
  const dv2 = d[20];
  const campo3 = d.slice(21, 31);
  const dv3 = d[31];

  if (modulo10(campo1) !== dv1) return { valid: false, error: 'DV do campo 1 inválido' };
  if (modulo10(campo2) !== dv2) return { valid: false, error: 'DV do campo 2 inválido' };
  if (modulo10(campo3) !== dv3) return { valid: false, error: 'DV do campo 3 inválido' };

  return { valid: true };
}

export function validarCodigoBarras(barcode: string): { valid: boolean; error?: string } {
  const d = barcode.replace(/\D/g, '');
  if (d.length !== 44) return { valid: false, error: 'Código de barras deve ter 44 dígitos' };
  return { valid: true };
}

export function validarBoleto(input: string): { valid: boolean; error?: string } {
  const d = input.replace(/\D/g, '');
  if (d.length === 44) return validarCodigoBarras(d);
  if (d.length === 47) return validarLinhaDigitavel(d);
  return { valid: false, error: 'Código inválido. Use linha digitável (47 dígitos) ou código de barras (44 dígitos)' };
}
