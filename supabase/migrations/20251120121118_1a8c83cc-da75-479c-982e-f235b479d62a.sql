-- Enable realtime for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- The orders table will now be available for realtime subscriptions