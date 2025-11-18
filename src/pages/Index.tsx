import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { CategorySection } from "@/components/CategorySection";
import { AllProducts } from "@/components/AllProducts";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { AIShoeConsultant } from "@/components/AIShoeConsultant";

const Index = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection onAIClick={() => setIsAIOpen(true)} />
      <FeaturedProducts />
      <CategorySection />
      <AllProducts />
      <Footer />
      <FloatingButtons />
      <AIShoeConsultant isOpen={isAIOpen} onOpenChange={setIsAIOpen} />
    </div>
  );
};

export default Index;
