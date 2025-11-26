import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, X } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  const [productDetails, setProductDetails] = useState<Record<string, { is_preorder: boolean; price: number }>>({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      const productIds = items.map(item => item.product_id);
      if (productIds.length === 0) return;

      const { data } = await supabase
        .from("products")
        .select("id, is_preorder, price")
        .in("id", productIds);

      if (data) {
        const details: Record<string, { is_preorder: boolean; price: number }> = {};
        data.forEach(product => {
          details[product.id] = {
            is_preorder: product.is_preorder || false,
            price: Number(product.price),
          };
        });
        setProductDetails(details);
      }
    };

    if (open) {
      fetchProductDetails();
    }
  }, [items, open]);

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  const downpaymentTotal = items.reduce((sum, item) => {
    const isPreorder = productDetails[item.product_id]?.is_preorder;
    return sum + (isPreorder ? item.product_price * item.quantity * 0.5 : 0);
  }, 0);

  const balanceTotal = items.reduce((sum, item) => {
    const isPreorder = productDetails[item.product_id]?.is_preorder;
    return sum + (isPreorder ? item.product_price * item.quantity * 0.5 : 0);
  }, 0);

  const regularTotal = items.reduce((sum, item) => {
    const isPreorder = productDetails[item.product_id]?.is_preorder;
    return sum + (!isPreorder ? item.product_price * item.quantity : 0);
  }, 0);

  const hasPreorderItems = items.some(item => productDetails[item.product_id]?.is_preorder);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart ({items.length} items)</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => onOpenChange(false)}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-4">
                {items.map((item) => {
                  const isPreorder = productDetails[item.product_id]?.is_preorder;
                  return (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{item.product_name}</p>
                        {isPreorder && (
                          <Badge className="bg-orange-500 text-white text-[9px] px-1 py-0 h-4">PRE-ORDER</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                      {isPreorder ? (
                        <div className="text-xs mt-1 space-y-0.5">
                          <p className="text-muted-foreground">
                            Price: {formatPrice(item.product_price * item.quantity)}
                          </p>
                          <p className="font-semibold text-primary">
                            Pay Now: {formatPrice(item.product_price * item.quantity * 0.5)} (50%)
                          </p>
                          <p className="text-muted-foreground">
                            On Delivery: {formatPrice(item.product_price * item.quantity * 0.5)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold mt-1">
                          {formatPrice(item.product_price * item.quantity)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              {hasPreorderItems ? (
                <div className="space-y-2 text-sm">
                  {regularTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Regular Items:</span>
                      <span className="font-medium">{formatPrice(regularTotal)}</span>
                    </div>
                  )}
                  {downpaymentTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pre-Order (50% Down):</span>
                      <span className="font-medium">{formatPrice(downpaymentTotal)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Amount Due Now:</span>
                    <span className="text-primary">{formatPrice(regularTotal + downpaymentTotal)}</span>
                  </div>
                  {balanceTotal > 0 && (
                    <div className="flex justify-between text-orange-600 dark:text-orange-400">
                      <span>Balance on Delivery:</span>
                      <span className="font-semibold">{formatPrice(balanceTotal)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              )}
              <div className="space-y-2">
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
