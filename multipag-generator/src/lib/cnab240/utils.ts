export function padLeft(value: string | number, length: number, pad = '0'): string {
  return String(value ?? '').padStart(length, pad).slice(-length);
}

export function padRight(value: string | number, length: number, pad = ' '): string {
  return String(value ?? '').padEnd(length, pad).slice(0, length);
}

export function formatMoney(value: number, length = 15): string {
  const cents = Math.round(value * 100);
  return String(cents).padStart(length, '0').slice(-length);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear());
  return day + month + year;
}

export function formatTime(date: Date): string {
  return (
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0')
  );
}

// Remove accents, keep only alphanumeric, spaces, and common punctuation; uppercase
export function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 .\/\-]/g, '')
    .toUpperCase();
}

export function onlyDigits(str: string): string {
  return (str || '').replace(/\D/g, '');
}

// 'L' = left-align (pad right with spaces), 'R' = right-align (pad left with zeros)
type FieldDef = [value: string | number, length: number, align?: 'L' | 'R', pad?: string];

export function buildLine(fields: FieldDef[]): string {
  let line = '';
  for (const [value, length, align = 'L', pad] of fields) {
    const str = String(value ?? '');
    const defaultPad = align === 'R' ? '0' : ' ';
    const fillChar = pad ?? defaultPad;
    if (align === 'R') {
      line += str.padStart(length, fillChar).slice(-length);
    } else {
      line += str.padEnd(length, fillChar).slice(0, length);
    }
  }
  if (line.length !== 240) {
    console.error('CNAB 240 line length error:', line.length, 'fields:', JSON.stringify(fields));
    throw new Error(`Linha CNAB 240 deve ter 240 caracteres, obteve ${line.length}`);
  }
  return line;
}

// Convert linha digitável (47 digits) to código de barras (44 digits)
export function linhaDigitavelToCodigoBarras(input: string): string {
  const d = onlyDigits(input);
  if (d.length === 44) return d;
  if (d.length !== 47) {
    // Return padded to 44 as best effort
    return d.padEnd(44, '0').slice(0, 44);
  }
  // d[0-3]: banco+moeda
  // d[4-8]: campo livre part 1 (5 chars)
  // d[9]: DV campo 1 (skip)
  // d[10-19]: campo livre part 2 (10 chars)
  // d[20]: DV campo 2 (skip)
  // d[21-30]: campo livre part 3 (10 chars)
  // d[31]: DV campo 3 (skip)
  // d[32]: DV geral
  // d[33-36]: fator vencimento
  // d[37-46]: valor
  const bancoMoeda = d.slice(0, 4);
  const dvGeral = d[32];
  const vencimento = d.slice(33, 37);
  const valor = d.slice(37, 47);
  const campoLivre = d.slice(4, 9) + d.slice(10, 20) + d.slice(21, 31);
  return bancoMoeda + dvGeral + vencimento + valor + campoLivre;
}
