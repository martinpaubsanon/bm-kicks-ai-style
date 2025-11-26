import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { resolveProductImage } from "@/lib/productImageOverrides";
import { useCurrency } from "@/contexts/CurrencyContext";
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images?: string[];
  is_featured?: boolean;
  is_limited_edition?: boolean;
  stock_total?: number;
  is_preorder?: boolean;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const { formatPrice } = useCurrency();
  const imageSrc = resolveProductImage(product.id, product.images?.[0]);
  const isLowStock = (product.stock_total || 0) < 10 && (product.stock_total || 0) > 0;

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] md:hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/20"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageSrc}
          alt={`${product.brand} ${product.name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-1 md:top-2 right-1 md:right-2 flex flex-col gap-0.5 md:gap-1">
          {product.is_preorder && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] md:text-xs px-1 md:px-2 py-0 h-4 md:h-5">
              🔔 PRE-ORDER
            </Badge>
          )}
          {product.is_limited_edition && (
            <Badge variant="destructive" className="animate-pulse text-[9px] md:text-xs px-1 md:px-2 py-0 h-4 md:h-5">
              🔥 LIMITED
            </Badge>
          )}
          {product.is_featured && (
            <Badge variant="default" className="text-[9px] md:text-xs px-1 md:px-2 py-0 h-4 md:h-5">⭐ FEATURED</Badge>
          )}
          {isLowStock && (
            <Badge variant="secondary" className="text-[9px] md:text-xs px-1 md:px-2 py-0 h-4 md:h-5">⚠️ LOW</Badge>
          )}
        </div>
      </div>
      <div className="p-1.5 md:p-4">
        <div className="text-[10px] md:text-sm text-muted-foreground font-medium">{product.brand}</div>
        <h3 className="font-semibold text-xs md:text-base text-foreground line-clamp-1 mt-0.5 md:mt-1">{product.name}</h3>
        <div className="mt-1 md:mt-2 flex items-center justify-between">
          <div>
            <span className="text-sm md:text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.is_preorder && (
              <p className="text-[9px] md:text-xs text-muted-foreground">50% downpayment</p>
            )}
          </div>
          <span className="text-[10px] md:text-sm text-muted-foreground group-hover:text-primary transition-colors">
            Details →
          </span>
        </div>
      </div>
    </Card>
  );
};
