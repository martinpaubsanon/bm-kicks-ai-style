import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Package, TrendingUp, Clock, CheckCircle, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LoyaltyProgress } from "@/components/customer/LoyaltyProgress";
import { useLoyalty } from "@/hooks/useLoyalty";

export default function Dashboard() {
  const { user, customerProfile } = useAuth();
  const { account, combinedScore, bonusPoints } = useLoyalty();
  const game = loadGameState();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setOrders(ordersData || []);

      // Calculate stats
      const { data: allOrders } = await supabase
        .from("orders")
        .select("order_status, total")
        .eq("user_id", user?.id);

      if (allOrders) {
        const totalSpent = allOrders.reduce((sum, order) => sum + Number(order.total), 0);
        const pending = allOrders.filter(o => o.order_status === 'pending' || o.order_status === 'processing').length;
        const delivered = allOrders.filter(o => o.order_status === 'delivered').length;

        setStats({
          total: allOrders.length,
          pending,
          delivered,
          totalSpent,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-foreground">
          Welcome back, {customerProfile?.full_name || 'Customer'}!
        </h1>
        <p className="text-xs md:text-base text-muted-foreground">Here's what's happening with your orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Link to="/" className="block">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Browse Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Shop Now</div>
              <p className="text-xs text-muted-foreground">Check out new arrivals</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">QAR {stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty / Gamified Progress */}
      <LoyaltyProgress
        totalSpent={stats.totalSpent}
        totalOrders={stats.total}
        deliveredOrders={stats.delivered}
        pointsBalance={account?.points_balance ?? 0}
      />

      {/* Need Help Section */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-green-900 dark:text-green-100 mb-1">Need Help with Your Order?</h3>
              <p className="text-xs md:text-sm text-green-800/80 dark:text-green-200/80">Our team is available 24/7 to assist you via WhatsApp</p>
            </div>
            <WhatsAppButton
              message="Hi! I need help with my order from BM Kicks."
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/customer/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Link to="/">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/customer/orders/${order.id}`}
                  className="block p-3 md:p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm md:text-base truncate">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <p className="font-bold text-foreground text-sm md:text-base whitespace-nowrap">
                      QAR {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StatusBadge status={order.order_status} type="order" />
                    <StatusBadge status={order.payment_status} type="payment" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
