ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'unisex';
ALTER TABLE public.products ADD CONSTRAINT products_gender_check CHECK (gender IN ('men','women','unisex','kids'));
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);