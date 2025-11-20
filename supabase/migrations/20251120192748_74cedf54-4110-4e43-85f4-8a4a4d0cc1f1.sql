-- Drop the unused session_id column from cart_items table
-- This column was previously used for guest cart functionality which has been removed
ALTER TABLE cart_items DROP COLUMN IF EXISTS session_id;