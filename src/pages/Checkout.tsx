import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/orderUtils";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { user, customerProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Qatar",
  });

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [showAddressForm, setShowAddressForm] = useState(true);

  // Load saved address when customerProfile is available
  useEffect(() => {
    if (customerProfile) {
      setShippingInfo({
        fullName: customerProfile.full_name || "",
        email: user?.email || "",
        phone: customerProfile.phone || "",
        address: customerProfile.default_shipping_address?.address || "",
        city: customerProfile.default_shipping_address?.city || "",
        province: customerProfile.default_shipping_address?.province || "",
        postalCode: customerProfile.default_shipping_address?.postalCode || "",
        country: customerProfile.default_shipping_address?.country || "Qatar",
      });
      
      // Hide form if we have a saved address
      if (customerProfile.default_shipping_address) {
        setShowAddressForm(false);
      }
    }
  }, [customerProfile, user?.email]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderId = await createOrder({
        items,
        shippingInfo,
        paymentMethod,
        userId: user?.id,
      });

      // Save shipping address to customer profile for future use
      if (user?.id) {
        await supabase
          .from("customer_profiles")
          .update({
            default_shipping_address: {
              address: shippingInfo.address,
              city: shippingInfo.city,
              province: shippingInfo.province,
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country,
            }
          })
          .eq("id", user.id);
      }

      await clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been confirmed.`,
      });

      navigate(`/customer/order-success?orderId=${orderId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container max-w-4xl">
          <Breadcrumbs items={[{ label: "Cart", href: "/" }, { label: "Checkout" }]} />
          <h1 className="text-3xl font-bold my-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saved Address Display */}
              {!showAddressForm && customerProfile?.default_shipping_address && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-medium">✓</span>
                      <p className="font-medium text-sm">Using your saved address</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddressForm(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 ml-6">
                    <p className="font-medium">{shippingInfo.fullName}</p>
                    <p>{shippingInfo.email} • {shippingInfo.phone}</p>
                    <p>{customerProfile.default_shipping_address.address}</p>
                    <p>
                      {customerProfile.default_shipping_address.city}, {customerProfile.default_shipping_address.province} {customerProfile.default_shipping_address.postalCode}
                    </p>
                    <p>{customerProfile.default_shipping_address.country}</p>
                  </div>
                </div>
              )}

              {/* Address Form (shown when editing or no saved address) */}
              {showAddressForm && (
                <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={shippingInfo.fullName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={shippingInfo.province}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    required
                  />
                </div>
              </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer">Bank Transfer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} (Size {item.size}) x{item.quantity}
                    </span>
                    <span>QAR {(item.product_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>QAR {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-medium text-sm">Need help with your order?</p>
                  <p className="text-xs text-muted-foreground">Contact us on WhatsApp for instant support</p>
                </div>
                <WhatsAppButton 
                  message="Hi! I need help completing my order at BM Kicks."
                  size="sm"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Place Order
            </Button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}
