import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface ColorManagerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

const SUGGESTED_COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Grey",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Navy",
];

export default function ColorManager({ colors, onChange }: ColorManagerProps) {
  const [newColor, setNewColor] = useState("");

  const handleAddColor = (color: string) => {
    const trimmedColor = color.trim();
    if (!trimmedColor) return;
    
    if (colors.includes(trimmedColor)) {
      return; // Color already exists
    }

    onChange([...colors, trimmedColor]);
    setNewColor("");
  };

  const handleRemoveColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  const handleAddCustomColor = () => {
    if (newColor.trim()) {
      handleAddColor(newColor);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Colors */}
      {colors.length > 0 && (
        <div>
          <Label className="mb-3 block">Selected Colors</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 text-sm"
              >
                {color}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="ml-2 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Color */}
      <div>
        <Label className="mb-3 block">Add Color</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter color name (e.g., Black/White)"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomColor();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCustomColor}
            disabled={!newColor.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Suggested Colors */}
      <div>
        <Label className="mb-3 block text-xs text-muted-foreground">
          Quick Add (click to add)
        </Label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_COLORS.filter(color => !colors.includes(color)).map((color) => (
            <Button
              key={color}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddColor(color)}
              className="h-8"
            >
              {color}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
