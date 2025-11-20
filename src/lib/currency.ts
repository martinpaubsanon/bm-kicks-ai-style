export type Currency = 'QAR' | 'USD' | 'PHP';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Conversion rate from QAR
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  QAR: {
    code: 'QAR',
    symbol: 'QAR',
    name: 'Qatari Riyal',
    rate: 1.00,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 0.27,
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    rate: 15.50,
  },
};

export function convertPrice(
  amount: number,
  fromCurrency: Currency = 'QAR',
  toCurrency: Currency = 'QAR'
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to QAR first (base currency)
  const amountInQAR = amount / CURRENCIES[fromCurrency].rate;
  
  // Then convert to target currency
  return amountInQAR * CURRENCIES[toCurrency].rate;
}

export function formatCurrency(amount: number, currency: Currency = 'QAR'): string {
  const config = CURRENCIES[currency];
  const convertedAmount = convertPrice(amount, 'QAR', currency);
  
  // Format with thousand separators and 2 decimal places
  const formattedAmount = convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${config.symbol} ${formattedAmount}`;
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol;
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name;
}

export function getExchangeRate(currency: Currency): number {
  return CURRENCIES[currency].rate;
}
