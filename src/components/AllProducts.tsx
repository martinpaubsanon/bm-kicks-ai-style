import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

export const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedCategory = searchParams.get("category") || "all";

  const categories = [
    { id: "all", label: "All Products" },
    { id: "Running", label: "Running" },
    { id: "Basketball", label: "Basketball" },
    { id: "Lifestyle", label: "Lifestyle" },
    { id: "Training", label: "Training" },
    { id: "Skateboarding", label: "Skateboarding" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory)
      );
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, images, category, is_featured, is_limited_edition, stock_total")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error loading products",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background" id="all-products">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our Complete Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our entire inventory of {products.length}+ premium sneakers
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => handleCategoryChange(category.id)}
              className="font-semibold"
            >
              {category.label}
              {category.id === "all" && ` (${products.length})`}
              {category.id !== "all" && 
                ` (${products.filter(p => p.category === category.id).length})`
              }
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_limited_edition && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      LIMITED
                    </Badge>
                  )}
                  {product.is_featured && (
                    <Badge className="bg-accent text-accent-foreground">
                      FEATURED
                    </Badge>
                  )}
                  {product.stock_total && product.stock_total < 10 && (
                    <Badge variant="outline" className="bg-background/90">
                      Low Stock
                    </Badge>
                  )}
                  {product.stock_total === 0 && (
                    <Badge variant="destructive">
                      Out of Stock
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
                  <span className="text-2xl font-bold">${product.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {product.category}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No products found in this category
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
