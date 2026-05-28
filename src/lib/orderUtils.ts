import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  product_id: string;
  colorway_id?: string | null;
  colorway_name?: string | null;
  product_name: string;
  product_image: string;
  product_price: number;
  size: string;
  quantity: number;
}

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface CreateOrderParams {
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: "cod" | "bank_transfer";
  userId?: string;
}

export async function createOrder({
  items,
  shippingInfo,
  paymentMethod,
  userId,
}: CreateOrderParams): Promise<string> {
  if (!userId) {
    throw new Error("You must be signed in to place an order.");
  }

  const allowedMethods = ["cod", "bank_transfer"] as const;
  if (!allowedMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method. Only 'cod' or 'bank_transfer' are allowed.");
  }

  // All price/stock validation, rate limiting, order + items insertion happen
  // server-side via SECURITY DEFINER RPC. Client-supplied prices are ignored.
  const rpcItems = items.map((item) => ({
    product_id: item.product_id,
    colorway_id: item.colorway_id || null,
    size: item.size,
    quantity: item.quantity,
    product_name: item.product_name,
    product_image: item.product_image,
  }));

  const { data, error } = await supabase.rpc("place_order", {
    p_items: rpcItems as any,
    p_shipping: {
      address: shippingInfo.address,
      city: shippingInfo.city,
      province: shippingInfo.province,
      postalCode: shippingInfo.postalCode,
      country: shippingInfo.country,
    } as any,
    p_payment_method: paymentMethod,
    p_customer_name: shippingInfo.fullName,
    p_customer_email: shippingInfo.email,
    p_customer_phone: shippingInfo.phone,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Failed to create order");

  return data as unknown as string;
}
