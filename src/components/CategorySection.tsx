import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Running",
    description: "Performance shoes built for speed",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    category: "Running"
  },
  {
    title: "Basketball",
    description: "Court-ready with superior support",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
    category: "Basketball"
  },
  {
    title: "Lifestyle",
    description: "Street style meets everyday comfort",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    category: "Lifestyle"
  },
  {
    title: "Bags",
    description: "Statement carry for every drop",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    category: "Bags"
  },
  {
    title: "Watches",
    description: "Rolex-grade wrist game",
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800",
    category: "Watches"
  },

  {
    title: "Cosmetics",
    description: "Glow up, head to toe",
    image: "https://images.unsplash.com/photo-1522335789203-aaa18e7b5777?w=800",
    category: "Cosmetics"
  }
];


export const CategorySection = () => {
  const scrollToCategory = (category: string) => {
    const element = document.getElementById("all-products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Add a small delay to ensure scroll completes before updating URL
      setTimeout(() => {
        window.history.pushState({}, "", `?category=${category}`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, 500);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect kicks for your style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <button 
              key={index}
              onClick={() => scrollToCategory(category.category)}
              className="group text-left"
            >
              <Card className="overflow-hidden h-[400px] relative cursor-pointer border-border hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <h3 className="text-3xl font-bold mb-2">{category.title}</h3>
                  <p className="text-white/90 mb-4">{category.description}</p>
                  <div className="flex items-center gap-2 text-accent font-semibold group-hover:gap-4 transition-all">
                    Shop Now
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
