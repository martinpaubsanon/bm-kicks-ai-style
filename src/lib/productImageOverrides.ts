import airMax90 from "@/assets/products/nike-air-max-90.jpg";
import ghost16 from "@/assets/products/brooks-ghost-16.jpg";
import ultraboost23 from "@/assets/products/adidas-ultraboost-23.jpg";
import freshFoam1080v13 from "@/assets/products/newbalance-freshfoam.jpg";

// Map stable local assets to known product IDs from the database
// so we don't rely on external or fragile URLs.
export const productImageOverrides: Record<string, string> = {
  "3f449179-2905-47d5-b41f-e6d42136097f": airMax90,
  "e2a49696-8ffb-46c2-988b-d5db0e1e79f7": ghost16,
  "f0945158-e1bd-41ee-a32f-f6eb9cfce09d": ultraboost23,
  "a6b34d3b-43d0-432a-8031-a9ff15192215": freshFoam1080v13,
};

export const resolveProductImage = (id: string | undefined, fallbackFromDb?: string): string => {
  if (id && productImageOverrides[id]) {
    return productImageOverrides[id];
  }
  return fallbackFromDb || "/placeholder.svg";
};
