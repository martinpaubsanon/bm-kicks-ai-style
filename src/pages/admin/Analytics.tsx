import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, TrendingUp, ShoppingCart, Package } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    actualRevenue: 0,
    totalDiscounts: 0,
    discountRate: 0,
    orderCount: 0,
    avgOrderValue: 0,
    topProducts: [] as any[],
    revenueByCategory: [] as any[],
    dailyRevenue: [] as any[],
    discountTrend: [] as any[],
    topDiscountedProducts: [] as any[],
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
        .select("total, discount_total, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const actualRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const totalDiscounts = orders?.reduce((sum, order) => sum + Number(order.discount_total || 0), 0) || 0;
      const totalRevenue = actualRevenue + totalDiscounts;
      const discountRate = totalRevenue > 0 ? (totalDiscounts / totalRevenue) * 100 : 0;
      const orderCount = orders?.length || 0;
      const avgOrderValue = orderCount > 0 ? actualRevenue / orderCount : 0;

      // Get order items with product info including discount data
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal, product_id, actual_price, original_price, discount_amount");

      // Calculate top products and discount data
      const productSales: { [key: string]: { name: string; revenue: number; quantity: number; discount: number } } = {};
      
      orderItems?.forEach((item) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = {
            name: item.product_name,
            revenue: 0,
            quantity: 0,
            discount: 0,
          };
        }
        productSales[item.product_name].revenue += Number(item.actual_price) * item.quantity;
        productSales[item.product_name].quantity += item.quantity;
        productSales[item.product_name].discount += Number(item.discount_amount || 0);
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((p) => ({
          name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
          revenue: p.revenue,
        }));

      const topDiscountedProducts = Object.values(productSales)
        .filter((p) => p.discount > 0)
        .sort((a, b) => b.discount - a.discount)
        .slice(0, 10)
        .map((p) => ({
          name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
          discount: p.discount,
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

      // Generate daily revenue and discount trends for last 7 days
      const dailyRevenue = [];
      const discountTrend = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayOrders = orders?.filter(
          (o) => new Date(o.created_at) >= dayStart && new Date(o.created_at) <= dayEnd
        );

        const dayRevenue = dayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
        const dayDiscount = dayOrders?.reduce((sum, order) => sum + Number(order.discount_total || 0), 0) || 0;

        const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        
        dailyRevenue.push({
          date: dateLabel,
          revenue: dayRevenue,
        });

        discountTrend.push({
          date: dateLabel,
          discount: dayDiscount,
        });
      }

      setStats({
        totalRevenue,
        actualRevenue,
        totalDiscounts,
        discountRate,
        orderCount,
        avgOrderValue,
        topProducts,
        revenueByCategory,
        dailyRevenue,
        discountTrend,
        topDiscountedProducts,
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
          title="Actual Revenue (30d)"
          value={formatPrice(stats.actualRevenue)}
          icon={DollarSign}
          description="Revenue after discounts"
        />
        <StatCard
          title="Total Discounts (30d)"
          value={formatPrice(stats.totalDiscounts)}
          icon={TrendingUp}
          description={`${stats.discountRate.toFixed(1)}% discount rate`}
        />
        <StatCard
          title="Total Orders (30d)"
          value={stats.orderCount}
          icon={ShoppingCart}
        />
        <StatCard
          title="Avg Order Value"
          value={formatPrice(stats.avgOrderValue)}
          icon={Package}
          description="After discounts"
        />
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
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Actual Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.discountTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="discount" stroke="#ef4444" name="Discounts Given" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Most Discounted Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topDiscountedProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="discount" fill="#ef4444" name="Total Discount" />
              </BarChart>
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
