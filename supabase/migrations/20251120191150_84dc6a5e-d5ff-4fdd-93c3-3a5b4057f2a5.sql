-- Fix 1: Add CASCADE DELETE to foreign keys to replace manual client-side cascade
-- This prevents information leakage and ensures atomic deletions

-- Drop existing foreign key constraints and recreate with CASCADE DELETE
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey,
ADD CONSTRAINT order_items_order_id_fkey
  FOREIGN KEY (order_id)
  REFERENCES orders(id)
  ON DELETE CASCADE;

ALTER TABLE payment_confirmations
DROP CONSTRAINT IF EXISTS payment_confirmations_order_id_fkey,
ADD CONSTRAINT payment_confirmations_order_id_fkey
  FOREIGN KEY (order_id)
  REFERENCES orders(id)
  ON DELETE CASCADE;

-- Fix 2: Add rate limiting for order creation
-- Create table to track order creation attempts
CREATE TABLE IF NOT EXISTS order_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user_id
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_order_rate_limits_identifier ON order_rate_limits(identifier, window_start);

-- Enable RLS
ALTER TABLE order_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view rate limit records
CREATE POLICY "Admins can view rate limits"
ON order_rate_limits FOR SELECT
USING (is_admin());

-- Create function to check and enforce rate limits
CREATE OR REPLACE FUNCTION check_order_rate_limit(user_identifier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
  rate_limit integer := 5; -- Max 5 orders per hour
  window_duration interval := '1 hour';
BEGIN
  -- Clean up old records (older than 1 hour)
  DELETE FROM order_rate_limits 
  WHERE window_start < now() - window_duration;
  
  -- Get current count for this identifier
  SELECT attempt_count, window_start INTO current_count, window_start_time
  FROM order_rate_limits
  WHERE identifier = user_identifier
    AND window_start > now() - window_duration
  ORDER BY window_start DESC
  LIMIT 1;
  
  -- If no record exists or window expired, create new record
  IF current_count IS NULL THEN
    INSERT INTO order_rate_limits (identifier, attempt_count, window_start)
    VALUES (user_identifier, 1, now());
    RETURN true;
  END IF;
  
  -- Check if rate limit exceeded
  IF current_count >= rate_limit THEN
    RETURN false;
  END IF;
  
  -- Increment attempt count
  UPDATE order_rate_limits
  SET attempt_count = attempt_count + 1
  WHERE identifier = user_identifier
    AND window_start = window_start_time;
  
  RETURN true;
END;
$$;