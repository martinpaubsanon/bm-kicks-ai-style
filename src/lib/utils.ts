import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currencySymbol: string = 'QAR'): string {
  return `${currencySymbol} ${price.toFixed(2)}`;
}
