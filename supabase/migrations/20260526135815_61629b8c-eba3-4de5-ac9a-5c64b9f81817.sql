
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sizes jsonb;
  v_current numeric;
  v_new numeric;
  v_stock_total integer;
BEGIN
  IF NEW.colorway_id IS NOT NULL THEN
    SELECT sizes INTO v_sizes FROM public.product_colorways WHERE id = NEW.colorway_id FOR UPDATE;
    IF v_sizes IS NULL THEN v_sizes := '{}'::jsonb; END IF;
    v_current := COALESCE((v_sizes ->> NEW.size)::numeric, 0);
    v_new := v_current - NEW.quantity;
    IF v_new < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for colorway % size %', NEW.colorway_id, NEW.size;
    END IF;
    v_sizes := jsonb_set(v_sizes, ARRAY[NEW.size], to_jsonb(v_new), true);

    SELECT COALESCE(SUM((value)::numeric), 0)::integer
      INTO v_stock_total
      FROM jsonb_each_text(v_sizes);

    UPDATE public.product_colorways
      SET sizes = v_sizes, stock_total = v_stock_total
      WHERE id = NEW.colorway_id;
  ELSIF NEW.product_id IS NOT NULL THEN
    SELECT sizes INTO v_sizes FROM public.products WHERE id = NEW.product_id FOR UPDATE;
    IF v_sizes IS NULL THEN v_sizes := '{}'::jsonb; END IF;
    v_current := COALESCE((v_sizes ->> NEW.size)::numeric, 0);
    v_new := v_current - NEW.quantity;
    IF v_new < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for product % size %', NEW.product_id, NEW.size;
    END IF;
    v_sizes := jsonb_set(v_sizes, ARRAY[NEW.size], to_jsonb(v_new), true);

    SELECT COALESCE(SUM((value)::numeric), 0)::integer
      INTO v_stock_total
      FROM jsonb_each_text(v_sizes);

    UPDATE public.products
      SET sizes = v_sizes, stock_total = v_stock_total
      WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_stock_on_order_item ON public.order_items;
CREATE TRIGGER trg_decrement_stock_on_order_item
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrement_stock_on_order_item();
