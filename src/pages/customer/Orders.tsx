import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { WhatsAppButton } from "@/components/WhatsAppButton";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total: number;
}

export default function CustomerOrders() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    if (!user) return;

    // Set up real-time subscription for user's orders
    const channel = supabase
      .channel('customer-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          // Only process changes for current user's orders
          const userId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
          if (userId !== user.id) return;

          if (payload.eventType === 'DELETE') {
            setOrders((current) => current.filter((order) => order.id !== payload.old.id));
          } else if (payload.eventType === 'INSERT') {
            setOrders((current) => [payload.new as Order, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((current) =>
              current.map((order) => order.id === payload.new.id ? payload.new as Order : order)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <h1 className="text-xl md:text-3xl font-bold">My Orders</h1>
        <WhatsAppButton 
          message="Hi! I have a question about my order from BM Kicks."
          size="sm"
        />
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-4 md:pt-6 text-center">
            <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-4">You haven't placed any orders yet</p>
            <Button asChild size="sm">
              <Link to="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs md:text-base truncate">Order #{order.order_number}</p>
                    <p className="text-[10px] md:text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                    </p>
                    <div className="flex gap-1.5 md:gap-2 mt-1.5 md:mt-2 flex-wrap">
                      <Badge variant={order.order_status === "delivered" ? "default" : "secondary"} className="text-[9px] md:text-xs px-1.5 md:px-2 py-0 h-4 md:h-5">
                        {order.order_status}
                      </Badge>
                      <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="text-[9px] md:text-xs px-1.5 md:px-2 py-0 h-4 md:h-5">
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm md:text-base">{formatPrice(order.total)}</p>
                    <Button asChild size="xs" className="mt-1.5 md:mt-2">
                      <Link to={`/customer/orders/${order.id}`}>
                        <span className="text-[10px] md:text-xs">View</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
