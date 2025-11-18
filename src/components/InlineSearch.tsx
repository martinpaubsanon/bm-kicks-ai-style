import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images?: string[];
}

interface InlineSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InlineSearch = ({ isOpen, onClose }: InlineSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("id, name, brand, price, images")
          .or(`name.ilike.%${debouncedQuery}%,brand.ilike.%${debouncedQuery}%`)
          .limit(6);

        setResults(data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  const handleSelectProduct = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div ref={containerRef} className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {query && (
          <div className="mt-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.brand}</div>
                      <div className="text-sm font-semibold text-primary">QAR {product.price.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
