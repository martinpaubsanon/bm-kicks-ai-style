import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <WhatsAppButton 
          message="Hi! I have a question about my order from BM Kicks."
          size="sm"
        />
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
            <Button asChild>
              <Link to="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={order.order_status === "delivered" ? "default" : "secondary"}>
                        {order.order_status}
                      </Badge>
                      <Badge variant={order.payment_status === "confirmed" ? "default" : "secondary"}>
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">QAR {order.total.toFixed(2)}</p>
                    <Button asChild size="sm" className="mt-2">
                      <Link to={`/customer/orders/${order.id}`}>View Details</Link>
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
