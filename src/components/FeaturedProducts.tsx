import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images?: string[];
  category: string;
  is_featured?: boolean;
  is_limited_edition?: boolean;
  stock_total?: number;
}

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, images, category, is_featured, is_limited_edition, stock_total")
        .eq("is_featured", true)
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToProducts = () => {
    document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-secondary/30" id="new-arrivals">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary/30" id="new-arrivals">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Collection</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked premium sneakers just for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden cursor-pointer border-border hover:shadow-xl transition-all duration-300"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <img 
                  src={product.images?.[0] || "/placeholder.svg"} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_limited_edition && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      LIMITED
                    </Badge>
                  )}
                  {product.stock_total && product.stock_total < 10 && (
                    <Badge variant="outline" className="bg-background/90">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                  {product.brand}
                </div>
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">QAR {product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="font-semibold"
            onClick={scrollToProducts}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};
