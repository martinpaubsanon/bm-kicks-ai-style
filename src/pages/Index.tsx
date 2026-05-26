import { useState } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { CategorySection } from "@/components/CategorySection";
import { AllProducts } from "@/components/AllProducts";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { AIShoeConsultant } from "@/components/AIShoeConsultant";
import { CustomRequestCTA } from "@/components/CustomRequestCTA";

const Index = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <PageSEO title="BM Kicks | Premium Sneakers in Qatar" description="Shop authentic Nike, Adidas & Jordan sneakers in Qatar with AI styling and loyalty rewards." path="/" />
      <Header />
      <main>
        <HeroSection onAIClick={() => setIsAIOpen(true)} />
        <CustomRequestCTA />
        <FeaturedProducts />
        <CategorySection />
        <AllProducts />
      </main>
      <Footer />
      <FloatingButtons />
      <AIShoeConsultant isOpen={isAIOpen} onOpenChange={setIsAIOpen} />
    </div>
  );
};

export default Index;
