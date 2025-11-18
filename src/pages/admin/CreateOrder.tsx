import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, X, Search } from "lucide-react";

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  size: string;
  quantity: number;
}

interface CustomerProfile {
  id: string;
  full_name: string;
  phone: string;
  default_shipping_address?: any;
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<any>({});
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  // New customer form
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customer_profiles")
      .select("*")
      .order("full_name");
    setCustomers(data || []);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("name");
    setProducts(data || []);
  };

  const addProductToOrder = (product: any, size: string) => {
    const sizes = product.sizes as Record<string, number>;
    if (!sizes[size] || sizes[size] === 0) {
      toast({
        title: "Out of stock",
        description: `Size ${size} is not available`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = orderItems.find(
      (item) => item.product_id === product.id && item.size === size
    );

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.product_id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_name: `${product.brand} ${product.name}`,
          product_image: product.images?.[0] || "",
          price: product.price,
          size,
          quantity: 1,
        },
      ]);
    }
  };

  const removeProductFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer && !isNewCustomer) {
      toast({
        title: "Select customer",
        description: "Please select or create a customer",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Add products",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let customerId = selectedCustomer?.id;

      // Create new customer if needed
      if (isNewCustomer) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: newCustomer.email,
          email_confirm: true,
          user_metadata: {
            full_name: newCustomer.full_name,
            phone: newCustomer.phone,
          },
        });

        if (authError) throw authError;
        customerId = authData.user.id;
      }

      const subtotal = calculateSubtotal();
      const total = subtotal; // Add shipping/tax logic if needed

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: customerId,
          customer_name: isNewCustomer ? newCustomer.full_name : selectedCustomer?.full_name || "",
          customer_email: isNewCustomer ? newCustomer.email : "",
          customer_phone: isNewCustomer ? newCustomer.phone : selectedCustomer?.phone || "",
          shipping_address: shippingAddress,
          subtotal,
          total,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          order_status: orderStatus,
          notes,
          order_number: "", // Will be auto-generated by trigger
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase.from("order_items").insert(
        orderItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        }))
      );

      if (itemsError) throw itemsError;

      toast({
        title: "Order created",
        description: `Order ${order.order_number} created successfully`,
      });

      navigate("/admin/orders");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Order</h1>
        <p className="text-muted-foreground">Manually create an order for a customer</p>
      </div>

      <div className="grid gap-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                type="button"
                variant={!isNewCustomer ? "default" : "outline"}
                onClick={() => setIsNewCustomer(false)}
              >
                Select Existing
              </Button>
              <Button
                type="button"
                variant={isNewCustomer ? "default" : "outline"}
                onClick={() => setIsNewCustomer(true)}
              >
                Create New
              </Button>
            </div>

            {!isNewCustomer ? (
              <div>
                <Label>Search Customer</Label>
                <Select
                  value={selectedCustomer?.id}
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id === value);
                    setSelectedCustomer(customer || null);
                    if (customer?.default_shipping_address) {
                      setShippingAddress(customer.default_shipping_address);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={newCustomer.full_name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, full_name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Add Product</Label>
              <Select
                onValueChange={(value) => {
                  const product = products.find((p) => p.id === value);
                  if (product) {
                    const sizes = product.sizes as Record<string, number>;
                    const firstAvailableSize = Object.entries(sizes).find(
                      ([_, stock]) => stock > 0
                    )?.[0];
                    if (firstAvailableSize) {
                      addProductToOrder(product, firstAvailableSize);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.brand} {product.name} - QAR {product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {orderItems.length > 0 && (
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg"
                  >
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size {item.size} | QAR {item.price.toFixed(2)}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...orderItems];
                        newItems[index].quantity = parseInt(e.target.value) || 1;
                        setOrderItems(newItems);
                      }}
                      className="w-20"
                    />
                    <p className="font-bold min-w-[80px] text-right">
                      QAR {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProductFromOrder(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Address Line 1</Label>
                <Input
                  value={shippingAddress.address_line1 || ""}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address_line1: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={shippingAddress.city || ""}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>State/Province</Label>
                <Input
                  value={shippingAddress.state || ""}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, state: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={shippingAddress.postal_code || ""}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postal_code: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order Status</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Internal Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes about this order..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">QAR {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>QAR {calculateSubtotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/orders")}>
            Cancel
          </Button>
          <Button onClick={handleCreateOrder} disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
