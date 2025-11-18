import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "running",
    description: "",
    price: "",
    images: [""],
    colors: [""],
    sizes: "{}",
    stock_total: "",
    style: "",
    is_featured: false,
    is_limited_edition: false,
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

      setFormData({
        name: data.name || "",
        brand: data.brand || "",
        category: data.category || "running",
        description: data.description || "",
        price: data.price?.toString() || "",
        images: data.images || [""],
        colors: data.colors || [""],
        sizes: JSON.stringify(data.sizes || {}, null, 2),
        stock_total: data.stock_total?.toString() || "",
        style: data.style || "",
        is_featured: data.is_featured || false,
        is_limited_edition: data.is_limited_edition || false,
      });
    } catch (error) {
      console.error("Error loading product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        images: formData.images.filter((img) => img.trim() !== ""),
        colors: formData.colors.filter((color) => color.trim() !== ""),
        sizes: JSON.parse(formData.sizes),
        stock_total: parseInt(formData.stock_total) || 0,
        style: formData.style,
        is_featured: formData.is_featured,
        is_limited_edition: formData.is_limited_edition,
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
      console.error("Error saving product:", error);
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
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
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
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Total *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_total}
                onChange={(e) => setFormData({ ...formData, stock_total: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="images">Image URLs (one per line)</Label>
            <Textarea
              id="images"
              value={formData.images.join("\n")}
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.value.split("\n") })
              }
              rows={3}
              placeholder="https://example.com/image1.jpg"
            />
          </div>

          <div>
            <Label htmlFor="colors">Colors (comma-separated)</Label>
            <Input
              id="colors"
              value={formData.colors.join(", ")}
              onChange={(e) =>
                setFormData({ ...formData, colors: e.target.value.split(",").map((c) => c.trim()) })
              }
              placeholder="Black, White, Red"
            />
          </div>

          <div>
            <Label htmlFor="sizes">Sizes (JSON format)</Label>
            <Textarea
              id="sizes"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              rows={6}
              placeholder='{"8": 10, "9": 15, "10": 20}'
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="style">Style/Model Number</Label>
            <Input
              id="style"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="DX1234-001"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked })
                }
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="limited"
                checked={formData.is_limited_edition}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_limited_edition: checked })
                }
              />
              <Label htmlFor="limited">Limited Edition</Label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : id ? "Update Product" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
