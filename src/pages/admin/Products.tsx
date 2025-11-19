import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (stock: number): "in_stock" | "low_stock" | "out_of_stock" => {
    if (stock === 0) return "out_of_stock";
    if (stock < 20) return "low_stock";
    return "in_stock";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Products</h1>
          <p className="text-xs md:text-base text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/products/new">
            <Plus className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Add Product</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 md:pl-9 text-xs md:text-sm"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto -mx-3 md:mx-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4">Image</TableHead>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4">Name</TableHead>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4 hidden sm:table-cell">Brand</TableHead>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4 hidden md:table-cell">Category</TableHead>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4">Price</TableHead>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4 hidden lg:table-cell">Stock</TableHead>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4 hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-[10px] md:text-sm px-2 md:px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="px-2 md:px-4 py-2 md:py-3">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 md:w-12 md:h-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell className="px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm">
                  <div className="max-w-[120px] md:max-w-none truncate">{product.name}</div>
                </TableCell>
                <TableCell className="px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm hidden sm:table-cell">{product.brand}</TableCell>
                <TableCell className="px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm hidden md:table-cell">{product.category}</TableCell>
                <TableCell className="px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-semibold">QAR {product.price}</TableCell>
                <TableCell className="px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm hidden lg:table-cell">{product.stock_total || 0}</TableCell>
                <TableCell className="px-2 md:px-4 py-2 md:py-3 hidden sm:table-cell">
                  <StatusBadge status={getStockStatus(product.stock_total || 0)} />
                </TableCell>
                <TableCell className="px-2 md:px-4 py-2 md:py-3">
                  <div className="flex gap-1 md:gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="xs"
                      className="h-6 w-6 md:h-8 md:w-8 p-0"
                    >
                      <Link to={`/admin/products/${product.id}`}>
                        <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="h-6 w-6 md:h-8 md:w-8 p-0 text-destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
}
