import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Air Max Velocity",
    brand: "Nike",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    category: "Men's"
  },
  {
    id: 2,
    name: "Classic Suede",
    brand: "Puma",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500",
    category: "Men's"
  },
  {
    id: 3,
    name: "Court Vision",
    brand: "Adidas",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
    category: "Women's"
  },
  {
    id: 4,
    name: "Street Runner",
    brand: "Reebok",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500",
    category: "Limited"
  }
];

export const FeaturedProducts = () => {
  return (
    <section className="py-20 bg-secondary/30" id="new-arrivals">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">New Arrivals</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Check out our latest collection of premium sneakers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden product-card-hover cursor-pointer border-border"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 h-9 w-9 bg-white/90 hover:bg-white shadow-md"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                  {product.brand}
                </div>
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${product.price}</span>
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="font-semibold">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};
