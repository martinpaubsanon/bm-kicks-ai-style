-- Update RLS policies for cart_items to support guest users with session_id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

-- Create new policies that support both authenticated users and guest sessions
CREATE POLICY "Users and guests can view their cart items" 
ON public.cart_items 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Users and guests can insert cart items" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Users and guests can update their cart items" 
ON public.cart_items 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Users and guests can delete their cart items" 
ON public.cart_items 
FOR DELETE 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);