import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, CURRENCIES, convertPrice, formatCurrency } from '@/lib/currency';

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  convertPrice: (amount: number, fromCurrency?: Currency) => number;
  formatPrice: (amount: number, fromCurrency?: Currency) => string;
  exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred-currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as Currency) || 'QAR';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedCurrency);
  }, [selectedCurrency]);

  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency);
  };

  const convertPriceWrapper = (amount: number, fromCurrency: Currency = 'QAR') => {
    return convertPrice(amount, fromCurrency, selectedCurrency);
  };

  const formatPriceWrapper = (amount: number, fromCurrency: Currency = 'QAR') => {
    return formatCurrency(amount, selectedCurrency);
  };

  const exchangeRate = CURRENCIES[selectedCurrency].rate;

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        convertPrice: convertPriceWrapper,
        formatPrice: formatPriceWrapper,
        exchangeRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
