import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveProductImage } from "@/lib/productImageOverrides";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchFeaturedProducts();

    // Subscribe to real-time updates for featured products
    const channel = supabase
      .channel('products-featured-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Featured product change detected:', payload);
          fetchFeaturedProducts(); // Refresh when any product changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, images, category, is_featured, is_limited_edition, stock_total")
        .eq("is_featured", true)
        .limit(15);

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
    <section className="py-8 md:py-20 bg-secondary/30" id="new-arrivals">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-xl md:text-4xl lg:text-5xl font-bold mb-1.5 md:mb-4">Featured Collection</h2>
          <p className="text-xs md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked premium sneakers
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <Card 
                  className="group overflow-hidden cursor-pointer border-border hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img 
                      src={resolveProductImage(product.id, product.images?.[0])} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
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
                      <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                      <span className="text-sm text-muted-foreground">{product.category}</span>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6" />
        </Carousel>

        <div className="text-center mt-8 md:mt-12">
          <Button 
            size="sm"
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
