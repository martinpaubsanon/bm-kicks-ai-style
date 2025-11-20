import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency, CURRENCIES } from '@/lib/currency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();

  return (
    <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as Currency)}>
      <SelectTrigger className="w-[90px] h-9 border-border/50 bg-background/50 backdrop-blur-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCIES).map(([code, config]) => (
          <SelectItem key={code} value={code}>
            {config.symbol} {code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
