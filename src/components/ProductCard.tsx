import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images?: string[];
  is_featured?: boolean;
  is_limited_edition?: boolean;
  stock_total?: number;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const imageSrc = product.images?.[0] || "/placeholder.svg";
  const isLowStock = (product.stock_total || 0) < 10 && (product.stock_total || 0) > 0;

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/20"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageSrc}
          alt={`${product.brand} ${product.name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.is_limited_edition && (
            <Badge variant="destructive" className="animate-pulse">
              🔥 LIMITED
            </Badge>
          )}
          {product.is_featured && (
            <Badge variant="default">⭐ FEATURED</Badge>
          )}
          {isLowStock && (
            <Badge variant="secondary">⚠️ LOW STOCK</Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm text-muted-foreground font-medium">{product.brand}</div>
        <h3 className="font-semibold text-foreground line-clamp-1 mt-1">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">QAR {product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </Card>
  );
};
