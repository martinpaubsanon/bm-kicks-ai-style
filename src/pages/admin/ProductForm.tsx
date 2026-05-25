import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import SizeStockManager from "@/components/admin/SizeStockManager";
import ColorManager from "@/components/admin/ColorManager";
import ColorwayManager, { type DraftColorway } from "@/components/admin/ColorwayManager";
import { fetchColorways, slugify, totalStockFromSizes } from "@/lib/colorwayUtils";
import { productSchema } from "@/lib/validationSchemas";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Running",
    description: "",
    price: "",
    images: [] as string[],
    colors: [] as string[],
    sizes: {} as Record<string, number>,
    stock_total: 0,
    style: "",
    is_featured: false,
    is_limited_edition: false,
    is_preorder: false,
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Calculate total stock from sizes
      const sizes = (data.sizes as Record<string, number>) || {};
      const stock_total = Object.values(sizes).reduce(
        (sum, stock) => sum + (typeof stock === "number" ? stock : 0),
        0
      );

      setFormData({
        name: data.name || "",
        brand: data.brand || "",
        category: data.category || "Running",
        description: data.description || "",
        price: data.price?.toString() || "",
        images: data.images || [],
        colors: data.colors || [],
        sizes: sizes,
        stock_total,
        style: data.style || "",
        is_featured: data.is_featured || false,
        is_limited_edition: data.is_limited_edition || false,
        is_preorder: data.is_preorder || false,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Image and size validation
    if (formData.images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one product image",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(formData.sizes).length === 0) {
      toast({
        title: "Sizes required",
        description: "Please add at least one size with stock",
        variant: "destructive",
      });
      return;
    }

    // Validate product data with zod schema
    const validation = productSchema.safeParse({
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description || undefined,
      style: formData.style || undefined,
    });

    if (!validation.success) {
      const errors = validation.error.errors;
      toast({
        title: "Validation Error",
        description: errors[0]?.message || "Please check your input",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        price: validation.data.price,
        images: formData.images,
        colors: formData.colors,
        sizes: formData.sizes,
        stock_total: formData.stock_total,
        style: formData.style,
        is_featured: formData.is_featured,
        is_limited_edition: formData.is_limited_edition,
        is_preorder: formData.is_preorder,
      };

      if (id) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      navigate("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {id ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-muted-foreground">
            {id ? "Update product details" : "Create a new product"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Product name, brand, and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nike Air Max 90"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      // Allow user to type custom brand
                      setFormData({ ...formData, brand: "" });
                    } else {
                      setFormData({ ...formData, brand: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nike">Nike</SelectItem>
                    <SelectItem value="Adidas">Adidas</SelectItem>
                    <SelectItem value="Jordan">Jordan</SelectItem>
                    <SelectItem value="New Balance">New Balance</SelectItem>
                    <SelectItem value="Puma">Puma</SelectItem>
                    <SelectItem value="Under Armour">Under Armour</SelectItem>
                    <SelectItem value="Brooks">Brooks</SelectItem>
                    <SelectItem value="ASICS">ASICS</SelectItem>
                    <SelectItem value="Reebok">Reebok</SelectItem>
                    <SelectItem value="Vans">Vans</SelectItem>
                    <SelectItem value="Converse">Converse</SelectItem>
                    <SelectItem value="On">On</SelectItem>
                    <SelectItem value="Li Ning">Li Ning</SelectItem>
                    <SelectItem value="Hoka">Hoka</SelectItem>
                    <SelectItem value="Salomon">Salomon</SelectItem>
                    <SelectItem value="Mizuno">Mizuno</SelectItem>
                    <SelectItem value="Saucony">Saucony</SelectItem>
                    <SelectItem value="Fila">Fila</SelectItem>
                    <SelectItem value="Sketchers">Sketchers</SelectItem>
                    <SelectItem value="custom">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
                {(!formData.brand || formData.brand === "") && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom brand name"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Skateboarding">Skateboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe the product features, materials, and benefits..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (QAR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="129.99"
                />
              </div>
              <div>
                <Label htmlFor="style">Style Code</Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  placeholder="CD0113-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload up to 5 high-quality product images</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              maxImages={5}
              productId={id || "new"}
            />
          </CardContent>
        </Card>

        {/* Product Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>Colors, sizes, and stock management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Available Colors</Label>
              <div className="mt-2">
                <ColorManager
                  colors={formData.colors}
                  onChange={(colors) => setFormData({ ...formData, colors })}
                />
              </div>
            </div>

            <div>
              <Label>Sizes & Stock</Label>
              <div className="mt-2">
                <SizeStockManager
                  sizes={formData.sizes}
                  onChange={(sizes) => {
                    // Auto-calculate total stock
                    const total = Object.values(sizes).reduce((sum, stock) => sum + stock, 0);
                    setFormData({
                      ...formData,
                      sizes,
                      stock_total: total,
                    });
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Total Stock: <strong className="text-foreground">{formData.stock_total}</strong> items
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Product Settings</CardTitle>
            <CardDescription>Feature flags and special designations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="featured">Featured Product</Label>
                <p className="text-sm text-muted-foreground">
                  Display this product on the homepage
                </p>
              </div>
              <Switch
                id="featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="limited">Limited Edition</Label>
                <p className="text-sm text-muted-foreground">
                  Mark as limited edition product
                </p>
              </div>
              <Switch
                id="limited"
                checked={formData.is_limited_edition}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_limited_edition: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="preorder">Pre-Order Item</Label>
                <p className="text-sm text-muted-foreground">
                  Requires 50% downpayment. Delivery: 10-14 days
                </p>
              </div>
              <Switch
                id="preorder"
                checked={formData.is_preorder}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_preorder: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Saving..." : id ? "Update Product" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
