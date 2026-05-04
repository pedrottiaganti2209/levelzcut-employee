import { validarCpfOuCnpj } from './cnpj-cpf';
import type { TipoChavePix } from '../../types/pagamento';

export function validarChavePix(chave: string, tipo: TipoChavePix): { valid: boolean; error?: string } {
  if (!chave.trim()) return { valid: false, error: 'Chave PIX é obrigatória' };

  switch (tipo) {
    case 'cpf':
    case 'cnpj': {
      if (!validarCpfOuCnpj(chave)) return { valid: false, error: `${tipo.toUpperCase()} inválido` };
      return { valid: true };
    }
    case 'celular': {
      const digits = chave.replace(/\D/g, '');
      // Format: +5511999999999 (with country code) or 11999999999 (11 digits)
      if (!/^(\+55)?\d{10,11}$/.test(chave.replace(/[\s\-()]/g, ''))) {
        return { valid: false, error: 'Celular inválido. Use formato +5511999999999 ou 11999999999' };
      }
      if (digits.length < 10 || digits.length > 13) {
        return { valid: false, error: 'Celular inválido' };
      }
      return { valid: true };
    }
    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) {
        return { valid: false, error: 'E-mail inválido' };
      }
      if (chave.length > 77) return { valid: false, error: 'E-mail muito longo (máx 77 chars)' };
      return { valid: true };
    }
    case 'evp': {
      // EVP = UUID format (8-4-4-4-12)
      if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(chave)) {
        return { valid: false, error: 'Chave aleatória inválida. Deve ser no formato UUID' };
      }
      return { valid: true };
    }
  }
}
