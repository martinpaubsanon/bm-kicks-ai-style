import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "confirmed" | "failed";
type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | StockStatus | string;
  type?: "order" | "payment" | "stock";
}

const statusConfig = {
  order: {
    pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    processing: { label: "Processing", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
    shipped: { label: "Shipped", className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20" },
    delivered: { label: "Delivered", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  },
  payment: {
    pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    failed: { label: "Failed", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  },
  stock: {
    in_stock: { label: "In Stock", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    low_stock: { label: "Low Stock", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    out_of_stock: { label: "Out of Stock", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  },
};

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const config = statusConfig[type]?.[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
