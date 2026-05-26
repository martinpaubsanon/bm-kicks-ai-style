import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, ShoppingBag, Clock } from "lucide-react";
import { Header } from "@/components/Header";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    loadOrderDetails();

    // Auto-redirect after 30 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 30000);

    return () => clearTimeout(timer);
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("product_name, quantity, price")
        .eq("order_id", orderId);

      setOrder(orderData);
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container max-w-2xl">
          <Card className="border-2">
            <CardContent className="pt-12 pb-8 text-center space-y-6">
              {/* Success Icon with Animation */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="relative bg-primary/10 rounded-full p-6">
                    <CheckCircle2 className="h-16 w-16 text-primary animate-scale-in" />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {order?.has_preorder_items ? "Pre-Order" : "Order"} Placed Successfully!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Thank you for your order, {order?.customer_name}!
                </p>
              </div>

              {/* Order Details */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Order Number</span>
                  <span className="text-sm font-bold">#{order?.order_number}</span>
                </div>
                
                {order?.has_preorder_items ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Downpayment Paid</span>
                      <span className="text-sm font-bold text-primary">QAR {order?.downpayment_total?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Balance on Delivery</span>
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">QAR {order?.balance_total?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                      <span className="text-sm font-bold">QAR {order?.total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                    <span className="text-sm font-bold">QAR {order?.total.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                  <span className="text-sm capitalize">{order?.payment_method.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Estimated Delivery</span>
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {order?.has_preorder_items ? "10-14 business days" : "3-5 business days"}
                  </span>
                </div>
              </div>

              {/* Pre-Order Info Box */}
              {order?.has_preorder_items && (
                <div className="bg-orange-50 dark:bg-orange-950 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔔</span>
                    <span className="font-semibold text-orange-700 dark:text-orange-300">Pre-Order Details</span>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                    Your pre-order items will be sourced and delivered within 10-14 business days.
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                    We'll contact you when your items arrive and schedule delivery for final payment collection.
                  </p>
                </div>
              )}

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-left">
                  <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items Ordered
                  </h2>
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product_name} x{item.quantity}
                      </span>
                      <span className="font-medium">QAR {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Message */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm text-left">
                <p className="text-muted-foreground">
                  📧 A confirmation email has been sent to <strong>{order?.customer_email}</strong>
                </p>
                <p className="text-muted-foreground mt-2">
                  📦 You can track your order status in your dashboard.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/customer/orders/${orderId}`)}
                >
                  <Package className="mr-2 h-5 w-5" />
                  View Order Details
                </Button>
              </div>

              <p className="text-xs text-muted-foreground pt-4">
                You'll be redirected to the homepage in 30 seconds...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
