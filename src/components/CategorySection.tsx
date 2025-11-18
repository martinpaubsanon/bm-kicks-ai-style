import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Men's Collection",
    description: "Bold styles for the modern gentleman",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
    link: "#mens"
  },
  {
    title: "Women's Collection",
    description: "Elegant and powerful designs",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
    link: "#womens"
  },
  {
    title: "Limited Edition",
    description: "Exclusive drops you won't find anywhere else",
    image: "https://images.unsplash.com/photo-1612902376337-1221bb4d3f8c?w=800",
    link: "#limited"
  }
];

export const CategorySection = () => {
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
            <a 
              key={index}
              href={category.link}
              className="group"
            >
              <Card className="overflow-hidden h-[400px] relative cursor-pointer border-border product-card-hover">
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
