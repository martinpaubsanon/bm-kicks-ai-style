CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_order_number TEXT;
  attempt INTEGER := 0;
  random_suffix TEXT;
BEGIN
  LOOP
    -- Generate order number with timestamp + random suffix for uniqueness
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_order_number := 'BM' || TO_CHAR(NOW(), 'YYYYMMDD') || TO_CHAR(NOW(), 'HH24MISS') || random_suffix;
    
    -- Check if this order number already exists
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_order_number) THEN
      RETURN new_order_number;
    END IF;
    
    attempt := attempt + 1;
    IF attempt > 10 THEN
      RAISE EXCEPTION 'Could not generate unique order number after 10 attempts';
    END IF;
  END LOOP;
END;
$function$;