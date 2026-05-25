import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star, Copy } from "lucide-react";
import ImageUploader from "./ImageUploader";
import SizeStockManager from "./SizeStockManager";
import { Colorway, slugify, totalStockFromSizes } from "@/lib/colorwayUtils";

export type DraftColorway = Omit<Colorway, "id" | "product_id"> & {
  id?: string;
  _localId: string;
  _deleted?: boolean;
};

interface Props {
  colorways: DraftColorway[];
  onChange: (cw: DraftColorway[]) => void;
  productId: string; // used for image uploads scope
}

const emptyDraft = (): DraftColorway => ({
  _localId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  slug: "",
  sku: null,
  swatch_hex: "#000000",
  swatch_image: null,
  images: [],
  sizes: {},
  stock_total: 0,
  price_override: null,
  is_default: false,
  is_preorder: false,
  is_limited_edition: false,
  sort_order: 0,
});

export default function ColorwayManager({ colorways, onChange, productId }: Props) {
  const [editing, setEditing] = useState<DraftColorway | null>(null);
  const [open, setOpen] = useState(false);

  const visible = colorways.filter((c) => !c._deleted);

  const startNew = () => {
    const draft = emptyDraft();
    draft.sort_order = visible.length;
    draft.is_default = visible.length === 0; // first one defaults to default
    setEditing(draft);
    setOpen(true);
  };

  const startEdit = (cw: DraftColorway) => {
    setEditing({ ...cw });
    setOpen(true);
  };

  const duplicate = (cw: DraftColorway) => {
    const copy: DraftColorway = {
      ...cw,
      _localId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      id: undefined,
      name: `${cw.name} (Copy)`,
      slug: "",
      is_default: false,
      sort_order: visible.length,
    };
    onChange([...colorways, copy]);
  };

  const remove = (cw: DraftColorway) => {
    if (!confirm(`Delete colorway "${cw.name}"?`)) return;
    if (cw.id) {
      onChange(
        colorways.map((c) =>
          c._localId === cw._localId ? { ...c, _deleted: true } : c
        )
      );
    } else {
      onChange(colorways.filter((c) => c._localId !== cw._localId));
    }
  };

  const saveDraft = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      alert("Name is required");
      return;
    }
    if (editing.images.length === 0) {
      alert("Add at least one image");
      return;
    }
    if (Object.keys(editing.sizes).length === 0) {
      alert("Add at least one size with stock");
      return;
    }

    const finalDraft: DraftColorway = {
      ...editing,
      slug: editing.slug?.trim() || slugify(editing.name),
      stock_total: totalStockFromSizes(editing.sizes),
    };

    // Enforce single default
    let updated = colorways.map((c) =>
      finalDraft.is_default && c._localId !== finalDraft._localId
        ? { ...c, is_default: false }
        : c
    );

    if (colorways.some((c) => c._localId === finalDraft._localId)) {
      updated = updated.map((c) => (c._localId === finalDraft._localId ? finalDraft : c));
    } else {
      updated = [...updated, finalDraft];
    }
    onChange(updated);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage the different color options for this shoe. Each colorway has its own
            images, sizes, stock, and SKU.
          </p>
        </div>
        <Button type="button" onClick={startNew} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Colorway
        </Button>
      </div>

      {visible.length === 0 && (
        <div className="text-sm text-muted-foreground border border-dashed rounded-md p-4 text-center">
          No colorways yet. The product will use its default images and sizes.
        </div>
      )}

      <div className="space-y-2">
        {visible.map((cw) => (
          <div
            key={cw._localId}
            className="flex items-center gap-3 border rounded-md p-3"
          >
            <div
              className="w-10 h-10 rounded-full border-2 border-border shrink-0"
              style={{
                background: cw.swatch_image
                  ? `url(${cw.swatch_image}) center/cover`
                  : cw.swatch_hex || "#999",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{cw.name || "Untitled"}</span>
                {cw.is_default && (
                  <Badge variant="default" className="text-[10px] h-5">
                    <Star className="w-3 h-3 mr-1" /> Default
                  </Badge>
                )}
                {cw.is_preorder && (
                  <Badge className="bg-orange-500 text-white text-[10px] h-5">
                    Pre-order
                  </Badge>
                )}
                {cw.is_limited_edition && (
                  <Badge variant="destructive" className="text-[10px] h-5">
                    Limited
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {cw.sku && <>SKU {cw.sku} · </>}
                Images {cw.images.length} · Sizes {Object.keys(cw.sizes).length} · Stock{" "}
                {totalStockFromSizes(cw.sizes)}
                {cw.price_override != null && <> · {cw.price_override} QAR</>}
              </div>
            </div>
            <Button type="button" size="icon" variant="ghost" onClick={() => startEdit(cw)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={() => duplicate(cw)}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={() => remove(cw)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Colorway" : "Add Colorway"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={editing.name}
                    placeholder="e.g. Triple Black"
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>SKU / Style Code</Label>
                  <Input
                    value={editing.sku || ""}
                    placeholder="e.g. CD0113-001"
                    onChange={(e) => setEditing({ ...editing, sku: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Swatch Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={editing.swatch_hex || "#000000"}
                      onChange={(e) =>
                        setEditing({ ...editing, swatch_hex: e.target.value })
                      }
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={editing.swatch_hex || ""}
                      onChange={(e) =>
                        setEditing({ ...editing, swatch_hex: e.target.value })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Price Override (QAR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.price_override ?? ""}
                    placeholder="Leave empty to use product price"
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        price_override: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Images *</Label>
                <ImageUploader
                  images={editing.images}
                  onChange={(images) => setEditing({ ...editing, images })}
                  maxImages={5}
                  productId={`${productId}-cw-${editing._localId}`}
                />
              </div>

              <div>
                <Label>Sizes & Stock *</Label>
                <SizeStockManager
                  sizes={editing.sizes}
                  onChange={(sizes) =>
                    setEditing({
                      ...editing,
                      sizes,
                      stock_total: totalStockFromSizes(sizes),
                    })
                  }
                />
              </div>

              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label>Default Colorway</Label>
                  <Switch
                    checked={editing.is_default}
                    onCheckedChange={(v) => setEditing({ ...editing, is_default: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Pre-Order (50% downpayment, 10-14 days)</Label>
                  <Switch
                    checked={editing.is_preorder}
                    onCheckedChange={(v) => setEditing({ ...editing, is_preorder: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Limited Edition</Label>
                  <Switch
                    checked={editing.is_limited_edition}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, is_limited_edition: v })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveDraft}>
              Save Colorway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
