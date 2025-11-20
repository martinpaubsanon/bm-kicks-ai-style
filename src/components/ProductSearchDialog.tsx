import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[] | null;
  category: string;
}

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductSearchDialog = ({ open, onOpenChange }: ProductSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearch.trim()) {
        setProducts([]);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, images, category")
        .or(`name.ilike.%${debouncedSearch}%,brand.ilike.%${debouncedSearch}%`)
        .limit(8);

      if (!error && data) {
        setProducts(data);
      }
      setIsSearching(false);
    };

    searchProducts();
  }, [debouncedSearch]);

  const handleSelectProduct = (productId: string) => {
    onOpenChange(false);
    navigate(`/product/${productId}`);
    setSearchQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search for products by name or brand..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {!searchQuery.trim() ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Search className="mx-auto h-8 w-8 mb-2 opacity-40" />
            Start typing to search products
          </div>
        ) : isSearching ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        ) : (
          <>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup heading="Products">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => handleSelectProduct(product.id)}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                >
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{product.brand}</span>
                      <span className="text-xs">•</span>
                      <span className="font-semibold text-foreground">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};
