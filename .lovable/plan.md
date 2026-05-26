In `src/components/AIShoeConsultant.tsx`, replace the hardcoded "Under $150" quick suggestion with a dynamic one driven by `useCurrency()`:

- Import `useCurrency` from `@/contexts/CurrencyContext`.
- Compute a budget threshold by converting 150 USD into the selected currency (using `convertPrice(150, 'USD')`) and format it with `formatPrice` (rounded to a clean number).
- Render label as `💰 Under {formattedBudget}` and pass the same string into the query (e.g., `Show me shoes under ${formattedBudget}`) so the AI receives the correct currency context.

No other suggestions or logic change.