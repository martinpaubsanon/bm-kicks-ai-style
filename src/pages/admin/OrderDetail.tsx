import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [paymentConfirmations, setPaymentConfirmations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<string>("");

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payment_confirmations")
        .select("*")
        .eq("order_id", id);

      if (paymentsError) throw paymentsError;
      setPaymentConfirmations(paymentsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      loadOrderDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: status })
        .eq("id", id)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const startEditingPrice = (itemId: string, currentPrice: number) => {
    setEditingItemId(itemId);
    setEditedPrice(currentPrice.toString());
  };

  const cancelEditingPrice = () => {
    setEditingItemId(null);
    setEditedPrice("");
  };

  const saveActualPrice = async (itemId: string) => {
    try {
      const newPrice = parseFloat(editedPrice);
      if (isNaN(newPrice) || newPrice < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid price",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("order_items")
        .update({ actual_price: newPrice })
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Actual price updated successfully",
      });
      
      setEditingItemId(null);
      setEditedPrice("");
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update actual price",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const shippingAddress = order.shipping_address as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order {order.order_number}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.customer_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customer_phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{shippingAddress?.street}</p>
            <p>
              {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zipCode}
            </p>
            <p>{shippingAddress?.country}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Original Price</TableHead>
                <TableHead>Actual Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <span className="font-medium">{item.product_name}</span>
                        {item.colorway_name && (
                          <div className="text-xs text-muted-foreground">Color: {item.colorway_name}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatPrice(Number(item.original_price))}</TableCell>
                  <TableCell>
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editedPrice}
                          onChange={(e) => setEditedPrice(e.target.value)}
                          className="w-24"
                          step="0.01"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => saveActualPrice(item.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={cancelEditingPrice}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{formatPrice(Number(item.actual_price))}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => startEditingPrice(item.id, Number(item.actual_price))}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {Number(item.discount_amount) > 0 ? (
                      <span className="text-red-500">
                        -{formatPrice(Number(item.discount_amount))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(Number(item.actual_price) * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-2 text-right border-t pt-4">
            <div className="flex justify-end gap-4">
              <span className="text-muted-foreground">Original Total:</span>
              <span className="font-medium">
                {formatPrice(
                  orderItems.reduce((sum, item) => sum + Number(item.original_price) * item.quantity, 0)
                )}
              </span>
            </div>
            {Number(order.discount_total) > 0 && (
              <div className="flex justify-end gap-4">
                <span className="text-red-500">Discount Given:</span>
                <span className="font-medium text-red-500">
                  -{formatPrice(Number(order.discount_total))}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-4 text-lg font-bold text-green-600">
              <span>Actual Revenue:</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Order Management */}
      {order?.has_preorder_items && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              Pre-Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Downpayment</p>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(Number(order.downpayment_total || 0))}
                  <Badge variant="outline" className="ml-2 text-xs">PAID</Badge>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance Due</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatPrice(Number(order.balance_total || 0))}
                  <Badge variant="outline" className="ml-2 text-xs border-orange-500 text-orange-600">PENDING</Badge>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pre-Order Status</label>
              <Select
                value={order.preorder_status || "awaiting_downpayment"}
                onValueChange={async (value) => {
                  const { error } = await supabase
                    .from("orders")
                    .update({ preorder_status: value })
                    .eq("id", id);

                  if (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update pre-order status",
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Success",
                      description: "Pre-order status updated",
                    });
                    loadOrderDetails();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awaiting_downpayment">⏳ Awaiting Downpayment</SelectItem>
                  <SelectItem value="processing">🔄 Processing (Sourcing Item)</SelectItem>
                  <SelectItem value="ready_for_delivery">📦 Ready for Delivery</SelectItem>
                  <SelectItem value="completed">✓ Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Delivery Timeline:</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Estimated delivery: 10-14 days from order date. Balance payment will be collected upon delivery.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <StatusBadge status={order.order_status} type="order" />
              <Select
                value={order.order_status}
                onValueChange={updateOrderStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <StatusBadge status={order.payment_status} type="payment" />
              <Select
                value={order.payment_status}
                onValueChange={updatePaymentStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">{order.payment_method}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {paymentConfirmations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Confirmations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {paymentConfirmations.map((confirmation) => (
                <div key={confirmation.id} className="border rounded-lg p-4">
                  <img
                    src={confirmation.image_url}
                    alt="Payment proof"
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(confirmation.created_at).toLocaleDateString()}
                  </p>
                  {confirmation.notes && (
                    <p className="text-sm mt-2">{confirmation.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
