import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  size: string;
  quantity: number;
  product?: any;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, size: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getSessionId = () => {
    let sessionId = localStorage.getItem("cart_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("cart_items")
        .select(`
          *,
          product:products(*)
        `);

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("session_id", getSessionId());
      }

      const { data, error } = await query;

      if (error) throw error;

      const cartItems = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product ? `${item.product.brand} ${item.product.name}` : "",
        product_image: item.product?.images?.[0] || "",
        product_price: item.product?.price || 0,
        size: item.size,
        quantity: item.quantity,
        product: item.product,
      }));

      setItems(cartItems);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const mergeGuestCart = async (userId: string) => {
    const sessionId = getSessionId();
    try {
      // Update guest cart items to user cart
      await supabase
        .from("cart_items")
        .update({ user_id: userId, session_id: null })
        .eq("session_id", sessionId);
    } catch (error) {
      console.error("Error merging cart:", error);
    }
  };

  useEffect(() => {
    if (user) {
      mergeGuestCart(user.id).then(() => loadCart());
    }
  }, [user]);

  const addToCart = async (productId: string, size: string, quantity: number) => {
    try {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      const sizes = product.sizes as Record<string, number>;
      const availableStock = sizes[size] || 0;

      if (availableStock < quantity) {
        throw new Error("Insufficient stock");
      }

      // Check if item already exists
      const existingItem = items.find(
        (item) => item.product_id === productId && item.size === size
      );

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase.from("cart_items").insert({
          product_id: productId,
          size,
          quantity,
          user_id: user?.id || null,
          session_id: user ? null : getSessionId(),
        });

        if (error) throw error;
        await loadCart();
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

      if (error) throw error;
      await loadCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;
      await loadCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      let query = supabase.from("cart_items").delete();

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("session_id", getSessionId());
      }

      const { error } = await query;
      if (error) throw error;
      
      setItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const cartTotal = items.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
