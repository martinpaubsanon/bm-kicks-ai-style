import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import cosmeticsImage from "@/assets/category-cosmetics.jpg";
import watchesTeaserImage from "@/assets/category-watches-teaser.jpg";
import cosmeticsTeaserImage from "@/assets/category-cosmetics-teaser.jpg";

const categories = [
  {
    title: "Running",
    description: "Performance shoes built for speed",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    category: "Running",
    comingSoon: false,
  },
  {
    title: "Basketball",
    description: "Court-ready with superior support",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
    category: "Basketball",
    comingSoon: false,
  },
  {
    title: "Lifestyle",
    description: "Street style meets everyday comfort",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    category: "Lifestyle",
    comingSoon: false,
  },
  {
    title: "Bags",
    description: "Statement carry for every drop",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    category: "Bags",
    comingSoon: false,
  },
  {
    title: "Watches",
    description: "Timepieces that define your wrist game",
    image: watchesTeaserImage,
    category: "Watches",
    comingSoon: true,
  },
  {
    title: "Cosmetics",
    description: "Glow up, head to toe",
    image: cosmeticsTeaserImage,
    category: "Cosmetics",
    comingSoon: true,
  },
];

export const CategorySection = () => {
  const scrollToCategory = (category: string) => {
    const element = document.getElementById("all-products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
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
          {categories.map((category, index) => {
            if (category.comingSoon) {
              return (
                <div key={index} className="group text-left cursor-default">
                  <Card className="overflow-hidden h-[400px] relative border-border">
                    {/* Background image */}
                    <div className="absolute inset-0">
                      <img
                        src={category.image}
                        alt={category.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
                    </div>

                    {/* Animated scanline overlay */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute w-full h-[2px] bg-primary/40 animate-[scan_3s_ease-in-out_infinite] shadow-[0_0_10px_hsl(var(--primary))]" />
                    </div>

                    {/* Glowing border on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 border-2 border-primary/30 rounded-lg" />
                      <div className="absolute inset-[2px] rounded-lg shadow-[inset_0_0_30px_hsl(var(--primary)/0.15)]" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                      {/* Coming Soon Badge */}
                      <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm">
                          <Clock className="h-3 w-3" />
                          Dropping Soon
                        </span>
                      </div>

                      <h3 className="text-3xl font-bold mb-2">{category.title}</h3>
                      <p className="text-white/70 mb-4">{category.description}</p>

                      {/* Teaser text */}
                      <div className="flex items-center gap-2 text-primary/80 font-semibold text-sm">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        <span className="relative">
                          Something big is brewing
                          <span className="absolute -right-4 bottom-0 flex gap-0.5">
                            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: "200ms" }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: "400ms" }}>.</span>
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Corner lock icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  </Card>
                </div>
              );
            }

            return (
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
                      loading="lazy"
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
            );
          })}
        </div>
      </div>
    </section>
  );
};
