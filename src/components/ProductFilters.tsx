import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedBrands: string[];
  onBrandToggle: (brand: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  inStockOnly: boolean;
  onInStockToggle: () => void;
  showFeaturedOnly: boolean;
  onFeaturedToggle: () => void;
  showLimitedOnly: boolean;
  onLimitedToggle: () => void;
  availableBrands?: string[]; // Optional: defaults to predefined list
}

const brands = [
  "Nike",
  "Adidas",
  "Jordan",
  "New Balance",
  "Puma",
  "Under Armour",
  "Brooks",
  "ASICS",
  "Reebok",
  "Vans",
  "Converse",
  "On",
  "Li Ning",
  "Hoka",
  "Salomon",
  "Mizuno",
  "Saucony",
  "Fila",
  "Sketchers",
];

export const ProductFilters = ({
  searchQuery,
  onSearchQueryChange,
  priceRange,
  onPriceRangeChange,
  selectedBrands,
  onBrandToggle,
  sortBy,
  onSortChange,
  onClearFilters,
  inStockOnly,
  onInStockToggle,
  showFeaturedOnly,
  onFeaturedToggle,
  showLimitedOnly,
  onLimitedToggle,
  availableBrands,
}: ProductFiltersProps) => {
  // Use passed brands or fall back to default list
  const brandsToShow = availableBrands && availableBrands.length > 0 ? availableBrands : brands;
  
  const hasActiveFilters =
    searchQuery.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 300 ||
    selectedBrands.length > 0 ||
    inStockOnly ||
    showFeaturedOnly ||
    showLimitedOnly;

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Products</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchQueryChange("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label>
          Price Range: QAR {priceRange[0]} - QAR {priceRange[1]}
        </Label>
        <Slider
          min={0}
          max={300}
          step={10}
          value={priceRange}
          onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          className="w-full"
        />
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <Label>Brands</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brandsToShow.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => onBrandToggle(brand)}
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm cursor-pointer hover:text-primary transition-colors"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Special Filters */}
      <div className="space-y-3">
        <Label>Special</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={onInStockToggle}
            />
            <label
              htmlFor="in-stock"
              className="text-sm cursor-pointer hover:text-primary transition-colors"
            >
              In Stock Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={showFeaturedOnly}
              onCheckedChange={onFeaturedToggle}
            />
            <label
              htmlFor="featured"
              className="text-sm cursor-pointer hover:text-primary transition-colors"
            >
              Featured Products
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="limited"
              checked={showLimitedOnly}
              onCheckedChange={onLimitedToggle}
            />
            <label
              htmlFor="limited"
              className="text-sm cursor-pointer hover:text-primary transition-colors"
            >
              Limited Edition
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
