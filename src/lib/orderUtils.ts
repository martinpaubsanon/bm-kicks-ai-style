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
  const identifier = userId || shippingInfo.email;

  const { data: rateLimitOk, error: rateLimitError } = await supabase
    .rpc('check_order_rate_limit', { user_identifier: identifier });

  if (rateLimitError) {
    throw new Error("Failed to verify rate limit. Please try again.");
  }
  if (!rateLimitOk) {
    throw new Error("Too many orders. Please wait before placing another order (max 5 orders per hour).");
  }

  const allowedMethods = ["cod", "bank_transfer"] as const;
  if (!allowedMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method. Only 'cod' or 'bank_transfer' are allowed.");
  }

  // Validate stock + prices. Use colorway if present, else product.
  const itemMeta: Record<string, { price: number; sizes: Record<string, number>; is_preorder: boolean; colorway_name: string | null }> = {};

  for (const item of items) {
    const key = `${item.product_id}:${item.colorway_id || "default"}:${item.size}`;
    let price = 0;
    let sizes: Record<string, number> = {};
    let isPreorder = false;
    let colorwayName: string | null = item.colorway_name || null;

    if (item.colorway_id) {
      const { data: cw, error } = await supabase
        .from("product_colorways")
        .select("name, sizes, price_override, is_preorder, product_id")
        .eq("id", item.colorway_id)
        .single();
      if (error || !cw) throw new Error("Invalid colorway");

      const { data: product, error: pErr } = await supabase
        .from("products")
        .select("price, is_preorder")
        .eq("id", item.product_id)
        .single();
      if (pErr || !product) throw new Error("Invalid product");

      price = cw.price_override != null ? Number(cw.price_override) : Number(product.price);
      sizes = (cw.sizes as Record<string, number>) || {};
      isPreorder = cw.is_preorder ?? product.is_preorder ?? false;
      colorwayName = cw.name;
    } else {
      const { data: product, error } = await supabase
        .from("products")
        .select("sizes, price, is_preorder")
        .eq("id", item.product_id)
        .single();
      if (error || !product) throw new Error("Invalid product");
      price = Number(product.price);
      sizes = (product.sizes as Record<string, number>) || {};
      isPreorder = product.is_preorder || false;
    }

    if (item.product_price !== price) {
      throw new Error(`Price mismatch detected for ${item.product_name}`);
    }
    const availableStock = sizes[item.size] || 0;
    if (availableStock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.product_name} (Size ${item.size})`);
    }

    itemMeta[key] = { price, sizes, is_preorder: isPreorder, colorway_name: colorwayName };
  }

  const metaFor = (item: OrderItem) =>
    itemMeta[`${item.product_id}:${item.colorway_id || "default"}:${item.size}`];

  const subtotal = items.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const hasPreorderItems = items.some(item => metaFor(item).is_preorder);
  const downpaymentTotal = items.reduce((sum, item) => {
    return sum + (metaFor(item).is_preorder ? item.product_price * item.quantity * 0.5 : 0);
  }, 0);
  const balanceTotal = items.reduce((sum, item) => {
    return sum + (metaFor(item).is_preorder ? item.product_price * item.quantity * 0.5 : 0);
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId || null,
      customer_name: shippingInfo.fullName,
      customer_email: shippingInfo.email,
      customer_phone: shippingInfo.phone,
      shipping_address: {
        address: shippingInfo.address,
        city: shippingInfo.city,
        province: shippingInfo.province,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
      },
      payment_method: paymentMethod,
      subtotal,
      total: subtotal,
      order_status: "pending",
      payment_status: "pending",
      order_number: "",
      has_preorder_items: hasPreorderItems,
      downpayment_total: downpaymentTotal,
      balance_total: balanceTotal,
      preorder_status: hasPreorderItems ? "awaiting_downpayment" : null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  for (const item of items) {
    const meta = metaFor(item);
    const isPreorder = meta.is_preorder;
    const itemSubtotal = item.product_price * item.quantity;

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      colorway_id: item.colorway_id || null,
      colorway_name: meta.colorway_name,
      size: item.size,
      quantity: item.quantity,
      price: item.product_price,
      original_price: item.product_price,
      actual_price: item.product_price,
      subtotal: itemSubtotal,
      is_preorder: isPreorder,
      downpayment_amount: isPreorder ? itemSubtotal * 0.5 : 0,
      balance_due: isPreorder ? itemSubtotal * 0.5 : 0,
    });

    if (itemError) throw itemError;

    // Decrement stock from the right source
    if (item.colorway_id) {
      const { data: cw } = await supabase
        .from("product_colorways")
        .select("sizes, stock_total")
        .eq("id", item.colorway_id)
        .single();
      if (cw) {
        const sizes = (cw.sizes as Record<string, number>) || {};
        sizes[item.size] = (sizes[item.size] || 0) - item.quantity;
        const stock_total = Object.values(sizes).reduce((s, n) => s + (typeof n === "number" ? n : 0), 0);
        await supabase
          .from("product_colorways")
          .update({ sizes, stock_total })
          .eq("id", item.colorway_id);
      }
    } else {
      const { data: product } = await supabase
        .from("products")
        .select("sizes")
        .eq("id", item.product_id)
        .single();
      if (product) {
        const sizes = (product.sizes as Record<string, number>) || {};
        sizes[item.size] = (sizes[item.size] || 0) - item.quantity;
        await supabase
          .from("products")
          .update({ sizes })
          .eq("id", item.product_id);
      }
    }
  }

  return order.id;
}
