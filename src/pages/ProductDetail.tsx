import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description?: string;
  images?: string[];
  sizes?: any;
  colors?: string[];
  category: string;
  style?: string;
  is_featured?: boolean;
  is_limited_edition?: boolean;
  stock_total?: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Select a size",
        description: "Please select a size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    const sizes = product.sizes as Record<string, number> || {};
    const availableStock = sizes[selectedSize] || 0;

    if (availableStock === 0) {
      toast({
        title: "Out of stock",
        description: `Size ${selectedSize} is currently out of stock`,
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedSize, 1);
      toast({
        title: "Added to cart!",
        description: `${product.brand} ${product.name} - Size ${selectedSize}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || ["/placeholder.svg"];
  const sizes = product.sizes as Record<string, number> || {};
  const availableSizes = Object.entries(sizes).filter(([_, stock]) => stock > 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
              <img
                src={images[currentImageIndex]}
                alt={`${product.brand} ${product.name}`}
                className="h-full w-full object-cover transition-transform hover:scale-110 duration-500"
              />
              {product.is_limited_edition && (
                <Badge variant="destructive" className="absolute top-4 right-4 animate-pulse">
                  🔥 LIMITED EDITION
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square overflow-hidden rounded border-2 transition-all ${
                      idx === currentImageIndex
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground uppercase">{product.brand}</span>
                {product.is_featured && <Badge>⭐ Featured</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="text-3xl font-bold text-primary">${product.price}</div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>
                {product.style && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Style:</span>
                    <span className="capitalize">{product.style}</span>
                  </div>
                )}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Colors:</span>
                    <span>{product.colors.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Select Size (US)</h3>
                {product.stock_total && product.stock_total < 20 && (
                  <span className="text-sm text-destructive font-medium">
                    Only {product.stock_total} left in stock!
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableSizes.map(([size, stock]) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`relative py-3 px-2 rounded border-2 transition-all font-medium ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {size}
                    {stock < 5 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              {availableSizes.length === 0 && (
                <p className="text-destructive">Out of stock</p>
              )}
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={availableSizes.length === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
