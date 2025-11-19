import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalProducts: 0,
  });
  const [agingStats, setAgingStats] = useState({
    week1: 0,
    week2to4: 0,
    month2: 0,
    older: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get total revenue and orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orders } = await supabase
        .from("orders")
        .select("total, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get total products
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalProducts: totalProducts || 0,
      });

      // Get aging data for pending orders
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgoDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const { data: pendingOrders } = await supabase
        .from("orders")
        .select("created_at")
        .eq("order_status", "pending");

      const aging = {
        week1: 0,
        week2to4: 0,
        month2: 0,
        older: 0,
      };

      pendingOrders?.forEach((order) => {
        const orderDate = new Date(order.created_at);
        if (orderDate >= sevenDaysAgo) {
          aging.week1++;
        } else if (orderDate >= thirtyDaysAgoDate) {
          aging.week2to4++;
        } else if (orderDate >= sixtyDaysAgo) {
          aging.month2++;
        } else {
          aging.older++;
        }
      });

      setAgingStats(aging);

      // Get recent orders
      const { data: recent } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, order_status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentOrders(recent || []);

      // Get low stock products
      const { data: lowStock } = await supabase
        .from("products")
        .select("id, name, brand, stock_total, price")
        .lt("stock_total", 20)
        .order("stock_total", { ascending: true })
        .limit(10);

      setLowStockProducts(lowStock || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue (30d)"
          value={`QAR ${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          change={12}
          onClick={() => navigate("/admin/orders")}
        />
        <StatCard
          title="Total Orders (30d)"
          value={stats.totalOrders}
          icon={ShoppingCart}
          change={8}
          onClick={() => navigate("/admin/orders")}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${stats.avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          change={5}
          onClick={() => navigate("/admin/orders")}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          onClick={() => navigate("/admin/products")}
        />
      </div>

      {/* Aging of Accounts - Pending Orders */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Pending Orders Aging</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="0-7 Days"
            value={agingStats.week1}
            icon={Clock}
            description="Recent pending orders"
            onClick={() => navigate("/admin/orders?ageFilter=0-7&status=pending")}
          />
          <StatCard
            title="8-30 Days"
            value={agingStats.week2to4}
            icon={Clock}
            description="Pending 1-4 weeks"
            onClick={() => navigate("/admin/orders?ageFilter=8-30&status=pending")}
          />
          <StatCard
            title="31-60 Days"
            value={agingStats.month2}
            icon={Clock}
            description="Pending 1-2 months"
            onClick={() => navigate("/admin/orders?ageFilter=31-60&status=pending")}
          />
          <StatCard
            title="60+ Days"
            value={agingStats.older}
            icon={Clock}
            description="Overdue orders"
            onClick={() => navigate("/admin/orders?ageFilter=60plus&status=pending")}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>QAR {Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.order_status} type="order" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>
                      <span className="text-yellow-500 font-medium">{product.stock_total}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/products">Manage Products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
