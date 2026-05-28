// Predefined brand options for sneaker products
// These brands appear in the product form dropdown and filter options
export const BRAND_OPTIONS = [
  "Nike",
  "Adidas",
  "Jordan",
  "New Balance",
  "Puma",
  "Under Armour",
  "Brooks",
  "ASICS",
  "Reebok",
  "Vans",
  "Converse",
  "On",
  "Li Ning",
  "Hoka",
  "Salomon",
  "Mizuno",
  "Saucony",
  "Fila",
  "Sketchers",
  "Seiko",
] as const;


export type BrandOption = typeof BRAND_OPTIONS[number];
