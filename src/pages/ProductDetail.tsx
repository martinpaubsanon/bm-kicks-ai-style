import { useEffect, useMemo, useState } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { resolveProductImage } from "@/lib/productImageOverrides";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { fetchColorways, type Colorway, pickDefaultColorway } from "@/lib/colorwayUtils";

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
  is_preorder?: boolean;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState<Product | null>(null);
  const [colorways, setColorways] = useState<Colorway[]>([]);
  const [activeColorwayId, setActiveColorwayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCartAction, setPendingCartAction] = useState<{
    productId: string;
    colorwayId: string | null;
    size: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const [{ data, error }, cws] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        fetchColorways(id),
      ]);

      if (error || !data) {
        toast({ title: "Error", description: "Failed to load product details", variant: "destructive" });
        navigate("/");
        return;
      }

      setProduct(data);
      setColorways(cws);

      const urlCw = searchParams.get("cw");
      let initial: Colorway | null = null;
      if (urlCw) initial = cws.find((c) => c.slug === urlCw) || null;
      if (!initial) initial = pickDefaultColorway(cws);
      setActiveColorwayId(initial?.id || null);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const activeColorway = useMemo(
    () => colorways.find((c) => c.id === activeColorwayId) || null,
    [colorways, activeColorwayId]
  );

  // Effective images/sizes/price/flags (colorway overrides product)
  const effectiveImages =
    activeColorway?.images.length
      ? activeColorway.images
      : product?.images && product.images.length > 0
        ? product.images
        : [];
  const effectiveSizes: Record<string, number> =
    activeColorway?.sizes && Object.keys(activeColorway.sizes).length > 0
      ? activeColorway.sizes
      : ((product?.sizes as Record<string, number>) || {});
  const effectivePrice =
    activeColorway?.price_override != null ? activeColorway.price_override : product?.price || 0;
  const effectiveIsPreorder = activeColorway?.is_preorder ?? product?.is_preorder ?? false;
  const effectiveIsLimited = activeColorway?.is_limited_edition ?? product?.is_limited_edition ?? false;

  const handleSelectColorway = (cw: Colorway) => {
    setActiveColorwayId(cw.id);
    setSelectedSize("");
    setCurrentImageIndex(0);
    const next = new URLSearchParams(searchParams);
    next.set("cw", cw.slug);
    setSearchParams(next, { replace: true });
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({ title: "Select a size", description: "Please select a size before adding to cart", variant: "destructive" });
      return;
    }
    if (!product) return;
    const availableStock = effectiveSizes[selectedSize] || 0;
    if (availableStock === 0) {
      toast({ title: "Out of stock", description: `Size ${selectedSize} is currently out of stock`, variant: "destructive" });
      return;
    }
    if (!user) {
      setPendingCartAction({ productId: product.id, colorwayId: activeColorwayId, size: selectedSize });
      setShowAuthModal(true);
      return;
    }
    await performAddToCart(product.id, activeColorwayId, selectedSize);
  };

  const performAddToCart = async (productId: string, colorwayId: string | null, size: string) => {
    setAddingToCart(true);
    try {
      await addToCart(productId, size, 1, colorwayId);
      toast({
        title: "Added to cart!",
        description: `${product?.brand} ${product?.name}${activeColorway ? ` - ${activeColorway.name}` : ""} - Size ${size}`,
      });
      setPendingCartAction(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add to cart", variant: "destructive" });
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    if (user && pendingCartAction) {
      performAddToCart(pendingCartAction.productId, pendingCartAction.colorwayId, pendingCartAction.size);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingCartAction]);

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

  const images = effectiveImages.length > 0
    ? [resolveProductImage(product.id, effectiveImages[0]), ...effectiveImages.slice(1)]
    : [resolveProductImage(product.id)];
  const availableSizes = Object.entries(effectiveSizes).filter(([_, stock]) => stock > 0);

  const seoTitle = `${product.name} | BM Kicks`.slice(0, 60);
  const seoDescRaw = product.description?.replace(/\s+/g, " ").trim() ||
    `Shop the ${product.brand} ${product.name} at BM Kicks. Authentic sneakers with fast delivery in Qatar.`;
  const seoDesc = seoDescRaw.length > 155 ? seoDescRaw.slice(0, 152) + "..." : seoDescRaw;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageSEO title={seoTitle} description={seoDesc} path={`/product/${product.id}`} />
      <Header />


      <div className="container mx-auto px-4 py-8 flex-1">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
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
                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
              />
              {effectiveIsLimited && (
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
                      idx === currentImageIndex ? "border-primary" : "border-border hover:border-primary/50"
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
              <div className="text-3xl font-bold text-primary">{formatPrice(effectivePrice)}</div>
            </div>

            {/* Colorway selector */}
            {colorways.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">Color</p>
                    <p className="font-medium">
                      {activeColorway?.name || "Select a colorway"}
                      {activeColorway?.sku && (
                        <span className="text-muted-foreground text-sm ml-2">{activeColorway.sku}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {colorways.length} Color{colorways.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorways.map((cw) => {
                    const soldOut = cw.stock_total === 0;
                    const isActive = cw.id === activeColorwayId;
                    return (
                      <button
                        key={cw.id}
                        type="button"
                        onClick={() => handleSelectColorway(cw)}
                        title={cw.name}
                        className={`relative h-12 w-12 rounded-full border-2 transition-all overflow-hidden ${
                          isActive
                            ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{
                          background: cw.swatch_image
                            ? `url(${cw.swatch_image}) center/cover`
                            : cw.swatch_hex || "#999",
                        }}
                      >
                        {soldOut && (
                          <span className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <span className="block w-full h-0.5 bg-destructive rotate-45" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pre-Order Info Box */}
            {effectiveIsPreorder && (
              <div className="bg-orange-50 dark:bg-orange-950 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-semibold">
                  <span className="text-xl">🔔</span>
                  <span>PRE-ORDER ITEM</span>
                </div>
                <ul className="text-sm space-y-1 ml-7 text-orange-800 dark:text-orange-200">
                  <li>• 50% Downpayment: <strong>{formatPrice(effectivePrice * 0.5)}</strong></li>
                  <li>• Balance on Delivery: <strong>{formatPrice(effectivePrice * 0.5)}</strong></li>
                  <li>• Estimated Delivery: <strong>10-14 days</strong></li>
                </ul>
                <p className="text-xs text-orange-700 dark:text-orange-300 ml-7 pt-1">
                  ✓ Full payment collected upon delivery
                </p>
              </div>
            )}

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
                {product.colors && product.colors.length > 0 && colorways.length === 0 && (
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
              disabled={availableSizes.length === 0 || addingToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {effectiveIsPreorder ? "Pre-Order Now (50% Down)" : "Add to Cart"}
            </Button>

            {/* WhatsApp Help */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">Questions about this product?</p>
                  <p className="text-xs text-muted-foreground">Chat with us on WhatsApp</p>
                </div>
                <WhatsAppButton
                  message={`Hi! I'm interested in the ${product.brand} ${product.name}${activeColorway ? ` (${activeColorway.name})` : ""}. Can you help me?`}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <AuthRequiredModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onGuestCheckout={() => {
          setShowAuthModal(false);
          setPendingCartAction(null);
        }}
        hideGuestOption={true}
      />
    </div>
  );
};

export default ProductDetail;
