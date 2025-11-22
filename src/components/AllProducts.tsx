import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { ProductFilters } from "./ProductFilters";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { useDebounce } from "@/hooks/use-debounce";

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
  created_at?: string;
}

const categories = ["Running", "Basketball", "Lifestyle", "Training", "Skateboarding"];

export const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showLimitedOnly, setShowLimitedOnly] = useState(false);

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('products-all-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          fetchProducts(); // Refresh products when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      
      // Calculate dynamic max price from products
      if (data && data.length > 0) {
        const calculatedMaxPrice = Math.ceil(Math.max(...data.map(p => p.price)) / 1000) * 1000;
        setMaxPrice(calculatedMaxPrice);
        
        // Update price range if still at default
        setPriceRange(prev => prev[1] === 3000 ? [0, calculatedMaxPrice] : prev);
      }
      
      // Extract unique brands from products
      const uniqueBrands = [...new Set(data?.map(p => p.brand) || [])].sort();
      setAvailableBrands(uniqueBrands);
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

  useEffect(() => {
    let filtered = [...products];
    console.log('Starting filter - Total products:', products.length);
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
      console.log('After category filter:', filtered.length);
    }

    // Search filter - checks name, description, and brand
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      );
      console.log('After search filter:', filtered.length);
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    console.log('After price filter:', filtered.length, 'Price range:', priceRange);

    if (selectedBrands.length > 0) {
      console.log('Filtering by brands:', selectedBrands);
      console.log('Available product brands:', [...new Set(products.map(p => p.brand))]);
      filtered = filtered.filter(p => {
        const matches = selectedBrands.includes(p.brand);
        if (!matches) {
          console.log('Product brand mismatch:', p.brand, 'not in', selectedBrands);
        }
        return matches;
      });
      console.log('After brand filter:', filtered.length);
    }

    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock_total && p.stock_total > 0);
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(p => p.is_featured);
    }

    if (showLimitedOnly) {
      filtered = filtered.filter(p => p.is_limited_edition);
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case "featured":
      default:
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, products, priceRange, selectedBrands, sortBy, inStockOnly, showFeaturedOnly, showLimitedOnly, debouncedSearchQuery]);

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => {
      const newBrands = prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand];
      console.log('Selected brands:', newBrands);
      return newBrands;
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, maxPrice]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setShowFeaturedOnly(false);
    setShowLimitedOnly(false);
    setSortBy("featured");
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
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-background" id="all-products">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">Our Complete Collection</h2>
          <p className="text-sm md:text-lg text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
            {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-primary/20 transition-colors"
            onClick={() => handleCategoryChange("all")}
          >
            All ({products.length})
          </Badge>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-primary/20 transition-colors"
                onClick={() => handleCategoryChange(cat)}
              >
                {cat} ({count})
              </Badge>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-4 md:gap-8">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <ProductFilters
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedBrands={selectedBrands}
              onBrandToggle={handleBrandToggle}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
              inStockOnly={inStockOnly}
              onInStockToggle={() => setInStockOnly(!inStockOnly)}
              showFeaturedOnly={showFeaturedOnly}
              onFeaturedToggle={() => setShowFeaturedOnly(!showFeaturedOnly)}
              showLimitedOnly={showLimitedOnly}
              onLimitedToggle={() => setShowLimitedOnly(!showLimitedOnly)}
              availableBrands={availableBrands}
              maxPrice={maxPrice}
            />
          </aside>

          <div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-2">
                  {debouncedSearchQuery 
                    ? `No products found for "${debouncedSearchQuery}"`
                    : "No products match your filters."}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
