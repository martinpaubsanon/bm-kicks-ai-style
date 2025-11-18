import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface SizeStockManagerProps {
  sizes: Record<string, number>;
  onChange: (sizes: Record<string, number>) => void;
}

const COMMON_SIZES = [
  "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", 
  "10", "10.5", "11", "11.5", "12", "12.5", "13"
];

export default function SizeStockManager({ sizes, onChange }: SizeStockManagerProps) {
  const [customSize, setCustomSize] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const totalStock = Object.values(sizes).reduce((sum, stock) => sum + (stock || 0), 0);

  const handleStockChange = (size: string, value: string) => {
    const stock = parseInt(value) || 0;
    const newSizes = { ...sizes };
    
    if (stock === 0) {
      delete newSizes[size];
    } else {
      newSizes[size] = stock;
    }
    
    onChange(newSizes);
  };

  const handleAddCustomSize = () => {
    if (!customSize.trim()) return;
    
    if (sizes[customSize]) {
      return; // Size already exists
    }

    onChange({ ...sizes, [customSize]: 0 });
    setCustomSize("");
  };

  const handleRemoveSize = (size: string) => {
    const newSizes = { ...sizes };
    delete newSizes[size];
    onChange(newSizes);
  };

  const handleSetAll = () => {
    const stock = parseInt(bulkStock) || 0;
    if (stock < 0) return;

    const newSizes: Record<string, number> = {};
    COMMON_SIZES.forEach(size => {
      newSizes[size] = stock;
    });
    
    // Keep custom sizes
    Object.keys(sizes).forEach(size => {
      if (!COMMON_SIZES.includes(size)) {
        newSizes[size] = stock;
      }
    });

    onChange(newSizes);
    setBulkStock("");
  };

  const handleClearAll = () => {
    onChange({});
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "destructive";
    if (stock < 10) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Total Stock Display */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <span className="text-sm font-medium">Total Stock</span>
        <Badge variant="outline" className="text-lg font-bold">
          {totalStock}
        </Badge>
      </div>

      {/* Common Sizes Grid */}
      <div>
        <Label className="mb-3 block">Common Sizes (US)</Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {COMMON_SIZES.map((size) => (
            <div key={size} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`size-${size}`} className="text-xs font-medium">
                  {size}
                </Label>
                {sizes[size] !== undefined && (
                  <Badge variant={getStockStatus(sizes[size] || 0)} className="text-xs h-5">
                    {sizes[size] > 0 ? "✓" : "✗"}
                  </Badge>
                )}
              </div>
              <Input
                id={`size-${size}`}
                type="number"
                min="0"
                value={sizes[size] || ""}
                onChange={(e) => handleStockChange(size, e.target.value)}
                placeholder="0"
                className="h-9 text-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Sizes */}
      {Object.keys(sizes).some(size => !COMMON_SIZES.includes(size)) && (
        <div>
          <Label className="mb-3 block">Custom Sizes</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.keys(sizes)
              .filter(size => !COMMON_SIZES.includes(size))
              .map((size) => (
                <div key={size} className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <Label htmlFor={`custom-${size}`} className="text-xs font-medium truncate">
                      {size}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleRemoveSize(size)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    id={`custom-${size}`}
                    type="number"
                    min="0"
                    value={sizes[size] || ""}
                    onChange={(e) => handleStockChange(size, e.target.value)}
                    placeholder="0"
                    className="h-9 text-center"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Custom Size */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter custom size (e.g., 14, 15)"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCustomSize();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddCustomSize}
          disabled={!customSize.trim()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Size
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <Label className="mb-3 block text-xs text-muted-foreground">Quick Actions</Label>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min="0"
              placeholder="Stock amount"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              className="w-32 h-9"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSetAll}
              disabled={!bulkStock}
            >
              Set All
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
