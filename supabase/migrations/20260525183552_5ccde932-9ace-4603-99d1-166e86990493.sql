
-- Create product_colorways table
CREATE TABLE public.product_colorways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sku TEXT,
  swatch_hex TEXT,
  swatch_image TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  sizes JSONB NOT NULL DEFAULT '{}'::jsonb,
  stock_total INTEGER NOT NULL DEFAULT 0,
  price_override NUMERIC,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_preorder BOOLEAN NOT NULL DEFAULT false,
  is_limited_edition BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, slug)
);

CREATE INDEX idx_product_colorways_product_id ON public.product_colorways(product_id);

ALTER TABLE public.product_colorways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colorways are viewable by everyone"
  ON public.product_colorways FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert colorways"
  ON public.product_colorways FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update colorways"
  ON public.product_colorways FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete colorways"
  ON public.product_colorways FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE TRIGGER update_product_colorways_updated_at
  BEFORE UPDATE ON public.product_colorways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one default colorway per product
CREATE OR REPLACE FUNCTION public.enforce_single_default_colorway()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.product_colorways
      SET is_default = false
      WHERE product_id = NEW.product_id
        AND id <> NEW.id
        AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_single_default_colorway
  AFTER INSERT OR UPDATE OF is_default ON public.product_colorways
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.enforce_single_default_colorway();

-- Add colorway tracking to cart_items
ALTER TABLE public.cart_items
  ADD COLUMN colorway_id UUID REFERENCES public.product_colorways(id) ON DELETE CASCADE;

-- Add colorway snapshot to order_items
ALTER TABLE public.order_items
  ADD COLUMN colorway_id UUID,
  ADD COLUMN colorway_name TEXT;
