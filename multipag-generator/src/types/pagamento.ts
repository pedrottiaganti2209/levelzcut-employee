export type TipoModalidade =
  | 'credito-conta'
  | 'ted'
  | 'boleto-bradesco'
  | 'boleto-outros'
  | 'codigo-barras'
  | 'dda'
  | 'salario-conta'
  | 'salario-conta-salario'
  | 'darf'
  | 'gps'
  | 'gare-icms'
  | 'gnre'
  | 'fgts'
  | 'pix-chave'
  | 'pix-qrcode'
  | 'ted-to-pix';

export type TipoChavePix = 'cpf' | 'cnpj' | 'celular' | 'email' | 'evp';

export interface EmpresaData {
  cnpj: string;
  nome: string;
  agencia: string;
  agenciaDv: string;
  conta: string;
  contaDv: string;
  convenio: string;
  numeroArquivo: string;
}

export interface PagamentoBase {
  id: string;
  modalidade: TipoModalidade;
  valor: number;
  dataPagamento: string; // YYYY-MM-DD
  numeroDocumento: string;
}

export interface PagamentoCreditoConta extends PagamentoBase {
  modalidade: 'credito-conta' | 'salario-conta' | 'salario-conta-salario';
  bancoBeneficiario: string;
  agenciaBeneficiario: string;
  agenciaBeneficiarioDv: string;
  contaBeneficiario: string;
  contaBeneficiarioDv: string;
  nomeBeneficiario: string;
  cpfCnpjBeneficiario: string;
  tipoCpfCnpj: '1' | '2';
}

export interface PagamentoTED extends PagamentoBase {
  modalidade: 'ted';
  bancoBeneficiario: string;
  agenciaBeneficiario: string;
  agenciaBeneficiarioDv: string;
  contaBeneficiario: string;
  contaBeneficiarioDv: string;
  nomeBeneficiario: string;
  cpfCnpjBeneficiario: string;
  tipoCpfCnpj: '1' | '2';
  finalidadeTED: string;
}

export interface PagamentoBoleto extends PagamentoBase {
  modalidade: 'boleto-bradesco' | 'boleto-outros' | 'codigo-barras' | 'dda';
  codigoBarras: string;
  nomeBeneficiario: string;
  dataVencimento: string;
}

export interface PagamentoPix extends PagamentoBase {
  modalidade: 'pix-chave' | 'ted-to-pix';
  tipoChave: TipoChavePix;
  chavePix: string;
  nomeBeneficiario: string;
  cpfCnpjBeneficiario: string;
  tipoCpfCnpj: '1' | '2';
}

export interface PagamentoPixQR extends PagamentoBase {
  modalidade: 'pix-qrcode';
  qrCodePayload: string;
  nomeBeneficiario: string;
}

export interface PagamentoDARF extends PagamentoBase {
  modalidade: 'darf';
  cnpjCpfContribuinte: string;
  tipoInscricao: '1' | '2';
  codigoReceita: string;
  periodoApuracao: string; // MMAAAA
  numeroReferencia: string;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  dataVencimento: string;
}

export interface PagamentoGPS extends PagamentoBase {
  modalidade: 'gps';
  identificador: string;
  codigoPagamento: string;
  competencia: string; // MMAAAA
  valorInss: number;
  valorOutrasEntidades: number;
  valorAtualizacao: number;
  dataVencimento: string;
}

export interface PagamentoGARE extends PagamentoBase {
  modalidade: 'gare-icms' | 'gnre' | 'fgts';
  cnpjCpfContribuinte: string;
  tipoInscricao: '1' | '2';
  codigoReceita: string;
  periodoApuracao: string; // MMAAAA
  numeroReferencia: string;
  ufFavorecida?: string; // for GNRE
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  dataVencimento: string;
}

export type Pagamento =
  | PagamentoCreditoConta
  | PagamentoTED
  | PagamentoBoleto
  | PagamentoPix
  | PagamentoPixQR
  | PagamentoDARF
  | PagamentoGPS
  | PagamentoGARE;

export const MODALIDADES = {
  fornecedores: {
    label: 'Pagamento a Fornecedores',
    items: [
      { value: 'credito-conta' as TipoModalidade, label: 'Crédito em Conta Corrente/Poupança' },
      { value: 'ted' as TipoModalidade, label: 'TED' },
      { value: 'boleto-bradesco' as TipoModalidade, label: 'Boleto Bradesco' },
      { value: 'boleto-outros' as TipoModalidade, label: 'Boleto Outros Bancos' },
      { value: 'codigo-barras' as TipoModalidade, label: 'Código de Barras' },
      { value: 'dda' as TipoModalidade, label: 'Rastreamento DDA' },
    ],
  },
  salarios: {
    label: 'Pagamento de Salários',
    items: [
      { value: 'salario-conta' as TipoModalidade, label: 'Crédito em Conta Corrente' },
      { value: 'salario-conta-salario' as TipoModalidade, label: 'Crédito em Conta-Salário' },
    ],
  },
  tributos: {
    label: 'Pagamento de Tributos',
    items: [
      { value: 'darf' as TipoModalidade, label: 'DARF' },
      { value: 'gps' as TipoModalidade, label: 'GPS' },
      { value: 'gare-icms' as TipoModalidade, label: 'GARE-ICMS' },
      { value: 'gnre' as TipoModalidade, label: 'GNRE' },
      { value: 'fgts' as TipoModalidade, label: 'FGTS' },
    ],
  },
  pix: {
    label: 'PIX',
    items: [
      { value: 'pix-chave' as TipoModalidade, label: 'Transferência por Chave PIX' },
      { value: 'pix-qrcode' as TipoModalidade, label: 'Pagamento por QR Code' },
      { value: 'ted-to-pix' as TipoModalidade, label: 'Conversão TED → PIX' },
    ],
  },
} as const;
