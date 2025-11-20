import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Plus, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  
  const ageFilter = searchParams.get("ageFilter");
  const statusFilter = searchParams.get("status");

  useEffect(() => {
    loadOrders();

    // Set up real-time subscription for orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            // Remove deleted order from state
            setOrders((current) => current.filter((order) => order.id !== payload.old.id));
          } else if (payload.eventType === 'INSERT') {
            // Add new order to state
            setOrders((current) => [payload.new as any, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing order in state
            setOrders((current) =>
              current.map((order) => order.id === payload.new.id ? payload.new as any : order)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    // Apply age filter
    if (ageFilter && statusFilter) {
      const now = new Date();
      filtered = filtered.filter((order) => {
        if (order.order_status !== statusFilter) return false;
        
        const orderDate = new Date(order.created_at);
        const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (ageFilter) {
          case "0-7":
            return daysDiff <= 7;
          case "8-30":
            return daysDiff > 7 && daysDiff <= 30;
          case "31-60":
            return daysDiff > 30 && daysDiff <= 60;
          case "60plus":
            return daysDiff > 60;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.order_number.toLowerCase().includes(query) ||
          o.customer_name.toLowerCase().includes(query) ||
          o.customer_email.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, orders, ageFilter, statusFilter]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error loading orders:", error);
      }
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (order: any) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      // Delete order - CASCADE will handle order_items and payment_confirmations
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      // Reload orders
      loadOrders();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error deleting order:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete order",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-xs md:text-base text-muted-foreground">Manage customer orders</p>
        </div>
        <Link to="/admin/orders/create">
          <Button size="sm">
            <Plus className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Create Order</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 md:pl-9 text-xs md:text-sm"
          />
        </div>
      </div>

      {/* Active Filters */}
      {(ageFilter || statusFilter) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active Filters:</span>
          {ageFilter && (
            <Badge variant="secondary" className="gap-2">
              Age: {ageFilter === "60plus" ? "60+ days" : `${ageFilter} days`}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete("ageFilter");
                  setSearchParams(params);
                }}
              />
            </Badge>
          )}
          {statusFilter && (
            <Badge variant="secondary" className="gap-2">
              Status: {statusFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete("status");
                  setSearchParams(params);
                }}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchParams(new URLSearchParams())}
          >
            Clear All
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.customer_email}</TableCell>
                <TableCell>{formatPrice(Number(order.total))}</TableCell>
                <TableCell>
                  <StatusBadge status={order.payment_status} type="payment" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.order_status} type="order" />
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/orders/${order.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClick(order)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order <strong>{orderToDelete?.order_number}</strong>? 
              This action cannot be undone and will also delete all associated order items and payment confirmations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
