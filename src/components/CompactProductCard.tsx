import { Product } from "@/components/AIShoeConsultant";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame } from "lucide-react";

interface CompactProductCardProps {
  product: Product;
  onClick: () => void;
}

export const CompactProductCard = ({ product, onClick }: CompactProductCardProps) => {
  const imageUrl = product.images?.[0] || "/placeholder.svg";
  
  return (
    <div
      onClick={onClick}
      className="flex gap-3 items-center p-3 border border-border rounded-lg hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group animate-fade-in"
    >
      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.is_limited_edition && (
          <Badge 
            variant="destructive" 
            className="absolute top-1 left-1 text-[10px] px-1 py-0 h-4"
          >
            <Flame className="w-2.5 h-2.5 mr-0.5" />
            LIMITED
          </Badge>
        )}
        {product.is_featured && !product.is_limited_edition && (
          <Badge 
            variant="secondary" 
            className="absolute top-1 left-1 text-[10px] px-1 py-0 h-4"
          >
            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
            FEATURED
          </Badge>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {product.brand}
        </p>
        <p className="font-bold text-sm mt-1 text-primary">
          ${product.price.toFixed(2)}
        </p>
      </div>
      
      {product.stock_total !== undefined && product.stock_total <= 5 && product.stock_total > 0 && (
        <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
          Only {product.stock_total} left
        </Badge>
      )}
    </div>
  );
};
