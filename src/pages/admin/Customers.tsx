import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter((c) => c.email.toLowerCase().includes(query))
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    try {
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_email, customer_name, total, created_at");

      if (!orders) return;

      // Group by email
      const customerMap: { [key: string]: any } = {};
      
      orders.forEach((order) => {
        if (!customerMap[order.customer_email]) {
          customerMap[order.customer_email] = {
            email: order.customer_email,
            name: order.customer_name,
            orderCount: 0,
            totalSpent: 0,
            lastOrder: order.created_at,
          };
        }
        
        customerMap[order.customer_email].orderCount += 1;
        customerMap[order.customer_email].totalSpent += Number(order.total);
        
        if (new Date(order.created_at) > new Date(customerMap[order.customer_email].lastOrder)) {
          customerMap[order.customer_email].lastOrder = order.created_at;
        }
      });

      const customersArray = Object.values(customerMap).sort(
        (a: any, b: any) => b.totalSpent - a.totalSpent
      );

      setCustomers(customersArray);
      setFilteredCustomers(customersArray);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground">View customer information and order history</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell>QAR {customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(customer.lastOrder).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}
    </div>
  );
}
