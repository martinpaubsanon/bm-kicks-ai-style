import { supabase } from "@/integrations/supabase/client";

export interface Colorway {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  sku: string | null;
  swatch_hex: string | null;
  swatch_image: string | null;
  images: string[];
  sizes: Record<string, number>;
  stock_total: number;
  price_override: number | null;
  is_default: boolean;
  is_preorder: boolean;
  is_limited_edition: boolean;
  sort_order: number;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `cw-${Date.now()}`;
}

export async function fetchColorways(productId: string): Promise<Colorway[]> {
  const { data, error } = await supabase
    .from("product_colorways")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((c: any) => ({
    ...c,
    sizes: (c.sizes as Record<string, number>) || {},
    images: c.images || [],
  }));
}

export function pickDefaultColorway(colorways: Colorway[]): Colorway | null {
  if (colorways.length === 0) return null;
  return colorways.find((c) => c.is_default) || colorways[0];
}

export function totalStockFromSizes(sizes: Record<string, number>): number {
  return Object.values(sizes).reduce((s, n) => s + (typeof n === "number" ? n : 0), 0);
}
