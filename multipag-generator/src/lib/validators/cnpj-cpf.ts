export function validarCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

export function validarCNPJ(cnpj: string): boolean {
  const c = cnpj.replace(/\D/g, '');
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (s: string, len: number) => {
    const w = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = [...s.slice(0, len)].reduce((a, d, i) => a + parseInt(d) * w[i], 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(c, 12) === parseInt(c[12]) && calc(c, 13) === parseInt(c[13]);
}

export function validarCpfOuCnpj(value: string): boolean {
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return validarCPF(d);
  if (d.length === 14) return validarCNPJ(d);
  return false;
}

export function detectarTipoDocumento(value: string): '1' | '2' | null {
  const d = value.replace(/\D/g, '');
  if (d.length <= 11) return '1';
  if (d.length <= 14) return '2';
  return null;
}
