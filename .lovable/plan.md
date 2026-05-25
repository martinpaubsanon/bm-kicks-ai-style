# Colorway System — Comprehensive Plan

Today, "colors" on a product is just a list of strings (e.g. "Black", "White"). All sizes/images/stock are shared. That doesn't match how real shoe e-commerce works.

## Best practice (Nike, Adidas, Foot Locker, END., SNKRS)

A shoe model (e.g. "Air Max 90") has multiple **colorways**. Each colorway is essentially its own purchasable variant with:
- A colorway **name** ("Triple Black", "University Red") and a **style code / SKU** (e.g. `CD0113-100`)
- Its own **image gallery** (you see different photos when you click each swatch)
- Its own **size run + stock** (a size 9 might be in stock in Black but sold out in Red)
- A **swatch** (color chip or thumbnail) shown under the main image
- Optionally its own **price** (collabs / special editions cost more)
- A flag for **default / featured colorway** shown first
- Independent **pre-order / limited edition / featured** flags per colorway

Selecting a swatch on the PDP swaps images, updates the size grid's availability, and updates the URL (`?cw=triple-black`) so the colorway is shareable.

## Proposed data model

New table `product_colorways`:

| field | type | purpose |
|---|---|---|
| id | uuid | PK |
| product_id | uuid | FK → products.id (cascade delete) |
| name | text | "Triple Black" |
| slug | text | URL-friendly, unique per product |
| sku | text | "CD0113-100" |
| swatch_hex | text | "#0a0a0a" — for color chip |
| swatch_image | text | optional thumbnail (overrides hex) |
| images | text[] | gallery for this colorway |
| sizes | jsonb | `{ "8": 3, "9": 5, "10": 0 }` |
| stock_total | int | auto-summed |
| price_override | numeric | null = use product.price |
| is_default | bool | one default per product |
| is_preorder | bool | per-colorway flag |
| is_limited_edition | bool | per-colorway flag |
| sort_order | int | display order of swatches |
| created_at / updated_at | | |

RLS: public SELECT; admin INSERT/UPDATE/DELETE (mirrors `products`).

`order_items` gets two new columns: `colorway_id uuid` (nullable FK) and `colorway_name text` (snapshot for history).

`cart_items` gets `colorway_id uuid` so the same product in two colorways are separate cart lines (and the `(user, product, size)` mental model becomes `(user, product, colorway, size)`).

### Backward compatibility
- Existing `products.colors[]`, `products.sizes`, `products.images` stay. They act as the fallback "default colorway" when a product has no rows in `product_colorways`.
- A migration step (manual, optional) lets admin "Convert to multi-colorway" — creates one default colorway row from the existing data.

## Admin UX (ProductForm)

Replace the current `ColorManager` block with a **Colorways** section:

```text
┌─ Colorways ────────────────────────────────────────┐
│  [+ Add colorway]                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ [swatch] Triple Black   SKU CD0113-001  ★def │  │
│  │   Images (3) · Sizes (6) · Stock 24          │  │
│  │   [Edit] [Duplicate] [Delete]                │  │
│  ├──────────────────────────────────────────────┤  │
│  │ [swatch] University Red SKU CD0113-600       │  │
│  │   Images (4) · Sizes (5) · Stock 11          │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

Editing a colorway opens a drawer/dialog with:
- Name, SKU, swatch (hex color picker **or** small swatch image upload)
- Image gallery (reuses existing `ImageUploader`, up to 5)
- Size & stock grid (reuses `SizeStockManager`)
- Price override (optional)
- Toggles: Default, Pre-order, Limited edition
- Sort order

Validation: at least 1 colorway per product, exactly 1 default, each colorway needs ≥1 image and ≥1 size with stock.

## Customer UX (ProductDetail)

Above the size selector, add a **Color** row (Nike pattern):

```text
Color: Triple Black         3 Colors
[●] [●] [●]    ← circular swatches, selected one has ring
```

Behavior:
- Default colorway loads first (or `?cw=slug` from URL)
- Clicking a swatch:
  - Swaps `images[]`, resets thumbnail index to 0
  - Updates size grid (availability + low-stock dots)
  - Updates price if `price_override` set
  - Updates URL via `navigate(..., { replace: true })` so it's shareable
  - Updates the pre-order info box if that colorway is pre-order
- Sold-out colorways still show but with a diagonal strikethrough on the swatch
- Selected size resets when colorway changes (sizes differ between colorways)

On `ProductCard` (listing grid):
- Show small swatch dots under the price (max 4, "+2" overflow)
- Hovering a dot swaps the card image to that colorway's first image (desktop only)
- Card click goes to `/product/:id?cw=<default-or-hovered>`

## Cart, Checkout, Orders

- `CartContext.addToCart(productId, size, qty)` → `addToCart(productId, colorwayId, size, qty)`. Cart line uniqueness key becomes `product+colorway+size`.
- `CartDrawer` shows colorway name + swatch next to product name, and uses the colorway's image.
- `Checkout` passes `colorway_id` + `colorway_name` snapshot into `order_items`.
- Admin `OrderDetail` displays colorway name/swatch per line.
- Stock decrement (if/when implemented) targets `product_colorways.sizes[size]` instead of `products.sizes[size]`.

## Search, filters, analytics

- `ProductFilters` "Color" facet now reads from all `product_colorways.swatch_hex`/`name` instead of `products.colors[]`. Filtering by a color filters products that have at least one matching colorway, and on the product card highlights that swatch.
- Analytics: track `colorway_view` and `colorway_add_to_cart` events later (out of scope for v1).

## Rollout / migration steps

1. **Migration**: create `product_colorways` table + RLS + indexes (`product_id`, unique `(product_id, slug)`); add `colorway_id`, `colorway_name` to `order_items`; add `colorway_id` to `cart_items`. Add trigger to keep one `is_default` per product.
2. **Backfill** (optional, admin-triggered button "Generate default colorway from product"): for each product with no colorway row, create one default colorway using existing `images`, `sizes`, first color name.
3. **Admin form**: replace ColorManager with new Colorways manager + drawer editor.
4. **Customer PDP**: add swatch row, colorway-aware images/sizes/price, URL sync.
5. **ProductCard**: swatch dots + hover swap.
6. **Cart/Checkout/Orders**: thread `colorway_id` end-to-end with snapshot fields.
7. **Filters**: switch color facet to colorway-based.
8. **QA pass**: products with 0 colorways still work (fallback), products with 1 colorway hide the swatch row, pre-order + limited edition badges respect the active colorway.

## Out of scope for v1
- Per-colorway reviews/ratings
- Colorway-level discounts/sales
- Cross-colorway recommendations ("Also available in…")
- Image zoom / 360° per colorway
- Stock auto-decrement (still manual in admin)

## Technical notes

- Types file regenerates automatically after migration; no manual edit.
- `useCart` will need a small refactor — colorway is optional during transition so old cart rows keep working.
- Add `slugify()` util in `src/lib/utils.ts` for colorway slugs.
- Cart line key util: `${product_id}:${colorway_id ?? 'default'}:${size}`.

Ready to implement on approval.
