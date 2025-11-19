import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-sneakers.jpg";

interface HeroSectionProps {
  onAIClick: () => void;
}

export const HeroSection = ({ onAIClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[60vh] md:min-h-[80vh] lg:min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Premium Sneakers" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 md:px-4 relative z-10 pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-accent/20 border border-accent/30 mb-4 md:mb-6 animate-fade-in">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-accent" />
            <span className="text-xs md:text-sm font-medium text-white">AI-Powered Shoe Recommendations</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight animate-slide-up">
            The World Under
            <br />
            <span className="text-accent">Your Kicks</span>
          </h1>
          
          <p className="text-sm md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Discover your perfect sneakers with our AI consultant. From streetwear to sports, find kicks that match your style.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              onClick={onAIClick}
              size="lg" 
              className="ai-hero-button animate-gradient-shift animate-float text-accent-foreground font-semibold text-base md:text-lg h-12 md:h-14 lg:h-16 px-6 md:px-10 shadow-accent animate-pulse-glow hover:scale-105 transition-transform duration-300 group"
            >
              <MessageSquare className="mr-2 h-5 w-5 md:h-6 md:w-6 group-hover:rotate-12 transition-transform" />
              Find Your Perfect Kicks
              <Sparkles className="ml-2 h-4 w-4 md:h-5 md:w-5 animate-sparkle" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => {
                const element = document.getElementById("all-products");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold text-base md:text-lg h-12 md:h-14 px-6 md:px-8"
            >
              Shop Collection
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-4 md:gap-8 mt-8 md:mt-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="flex flex-col">
              <div className="text-2xl md:text-3xl font-bold text-white">1000+</div>
              <div className="text-xs md:text-sm text-white/70">Sneaker Styles</div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
              <div className="text-xs md:text-sm text-white/70">WhatsApp Support</div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl md:text-3xl font-bold text-white">Fast</div>
              <div className="text-xs md:text-sm text-white/70">Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/30 flex justify-center p-1.5 md:p-2">
          <div className="w-1 h-2 md:h-3 rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
};
