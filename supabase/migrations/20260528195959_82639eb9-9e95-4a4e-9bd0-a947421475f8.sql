
-- Remove permissive policies that let users fabricate prices / alter orders
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Ensure the existing sensitive-field guard trigger is attached (defense in depth)
DROP TRIGGER IF EXISTS prevent_user_sensitive_order_updates ON public.orders;
CREATE TRIGGER prevent_user_sensitive_order_updates
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.prevent_user_sensitive_order_updates();

-- Server-side order placement: derives prices from products/colorways
CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb,
  p_shipping jsonb,
  p_payment_method text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product_id uuid;
  v_colorway_id uuid;
  v_size text;
  v_qty integer;
  v_price numeric;
  v_sizes jsonb;
  v_is_preorder boolean;
  v_colorway_name text;
  v_product_name text;
  v_product_image text;
  v_available numeric;
  v_subtotal numeric := 0;
  v_downpayment numeric := 0;
  v_balance numeric := 0;
  v_has_preorder boolean := false;
  v_item_subtotal numeric;
  v_rate_ok boolean;
  v_order_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_payment_method NOT IN ('cod', 'bank_transfer') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items provided';
  END IF;

  SELECT public.check_order_rate_limit(v_user_id::text) INTO v_rate_ok;
  IF NOT v_rate_ok THEN
    RAISE EXCEPTION 'Too many orders. Please wait before placing another order.';
  END IF;

  -- First pass: validate stock and compute totals using server-side prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_colorway_id := NULLIF(v_item->>'colorway_id', '')::uuid;
    v_size := v_item->>'size';
    v_qty := COALESCE((v_item->>'quantity')::integer, 0);

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    IF v_colorway_id IS NOT NULL THEN
      SELECT cw.name, cw.sizes,
             COALESCE(cw.price_override, p.price),
             COALESCE(cw.is_preorder, p.is_preorder, false)
        INTO v_colorway_name, v_sizes, v_price, v_is_preorder
        FROM public.product_colorways cw
        JOIN public.products p ON p.id = cw.product_id
        WHERE cw.id = v_colorway_id AND cw.product_id = v_product_id;
      IF v_price IS NULL THEN RAISE EXCEPTION 'Invalid colorway'; END IF;
    ELSE
      v_colorway_name := NULL;
      SELECT sizes, price, COALESCE(is_preorder, false)
        INTO v_sizes, v_price, v_is_preorder
        FROM public.products WHERE id = v_product_id;
      IF v_price IS NULL THEN RAISE EXCEPTION 'Invalid product'; END IF;
    END IF;

    v_available := COALESCE((v_sizes ->> v_size)::numeric, 0);
    IF v_available < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for size %', v_size;
    END IF;

    v_item_subtotal := v_price * v_qty;
    v_subtotal := v_subtotal + v_item_subtotal;
    IF v_is_preorder THEN
      v_has_preorder := true;
      v_downpayment := v_downpayment + v_item_subtotal * 0.5;
      v_balance := v_balance + v_item_subtotal * 0.5;
    END IF;
  END LOOP;

  -- Insert order header
  INSERT INTO public.orders (
    user_id, customer_name, customer_email, customer_phone,
    shipping_address, payment_method, subtotal, total,
    order_status, payment_status, order_number,
    has_preorder_items, downpayment_total, balance_total,
    preorder_status
  )
  VALUES (
    v_user_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping, p_payment_method, v_subtotal, v_subtotal,
    'pending', 'pending', '',
    v_has_preorder, v_downpayment, v_balance,
    CASE WHEN v_has_preorder THEN 'awaiting_downpayment' ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  -- Second pass: insert items with server-derived prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_colorway_id := NULLIF(v_item->>'colorway_id', '')::uuid;
    v_size := v_item->>'size';
    v_qty := (v_item->>'quantity')::integer;
    v_product_name := v_item->>'product_name';
    v_product_image := v_item->>'product_image';

    IF v_colorway_id IS NOT NULL THEN
      SELECT cw.name, COALESCE(cw.price_override, p.price),
             COALESCE(cw.is_preorder, p.is_preorder, false)
        INTO v_colorway_name, v_price, v_is_preorder
        FROM public.product_colorways cw
        JOIN public.products p ON p.id = cw.product_id
        WHERE cw.id = v_colorway_id;
    ELSE
      v_colorway_name := NULL;
      SELECT price, COALESCE(is_preorder, false)
        INTO v_price, v_is_preorder
        FROM public.products WHERE id = v_product_id;
    END IF;

    v_item_subtotal := v_price * v_qty;

    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image,
      colorway_id, colorway_name, size, quantity,
      price, original_price, actual_price, subtotal,
      is_preorder, downpayment_amount, balance_due
    )
    VALUES (
      v_order_id, v_product_id, v_product_name, v_product_image,
      v_colorway_id, v_colorway_name, v_size, v_qty,
      v_price, v_price, v_price, v_item_subtotal,
      v_is_preorder,
      CASE WHEN v_is_preorder THEN v_item_subtotal * 0.5 ELSE 0 END,
      CASE WHEN v_is_preorder THEN v_item_subtotal * 0.5 ELSE 0 END
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text, text, text, text) TO authenticated;
