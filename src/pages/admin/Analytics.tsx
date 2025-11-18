import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, TrendingUp, ShoppingCart, Package } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Analytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    avgOrderValue: 0,
    topProducts: [] as any[],
    revenueByCategory: [] as any[],
    dailyRevenue: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get orders for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orders } = await supabase
        .from("orders")
        .select("total, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const orderCount = orders?.length || 0;
      const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      // Get order items with product info
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal, product_id");

      // Calculate top products
      const productSales: { [key: string]: { name: string; revenue: number; quantity: number } } = {};
      
      orderItems?.forEach((item) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = {
            name: item.product_name,
            revenue: 0,
            quantity: 0,
          };
        }
        productSales[item.product_name].revenue += Number(item.subtotal);
        productSales[item.product_name].quantity += item.quantity;
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((p) => ({
          name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
          revenue: p.revenue,
        }));

      // Get products for category breakdown
      const { data: products } = await supabase.from("products").select("category, price");

      const categoryRevenue: { [key: string]: number } = {};
      products?.forEach((product) => {
        categoryRevenue[product.category] = (categoryRevenue[product.category] || 0) + Number(product.price);
      });

      const revenueByCategory = Object.entries(categoryRevenue).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // Generate daily revenue for last 7 days
      const dailyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayOrders = orders?.filter(
          (o) => new Date(o.created_at) >= dayStart && new Date(o.created_at) <= dayEnd
        );

        const dayRevenue = dayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

        dailyRevenue.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: dayRevenue,
        });
      }

      setStats({
        totalRevenue,
        orderCount,
        avgOrderValue,
        topProducts,
        revenueByCategory,
        dailyRevenue,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
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
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Sales and revenue insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue (30d)"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          change={12}
        />
        <StatCard
          title="Total Orders (30d)"
          value={stats.orderCount}
          icon={ShoppingCart}
          change={8}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${stats.avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          change={5}
        />
        <StatCard title="Active Products" value={48} icon={Package} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
