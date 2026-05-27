import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, ArrowRight, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-sneakers.jpg";
import bmKicksLogo from "@/assets/bm-kicks-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyalty } from "@/hooks/useLoyalty";

interface HeroSectionProps {
  onAIClick: () => void;
}

export const HeroSection = ({ onAIClick }: HeroSectionProps) => {
  const { user } = useAuth();
  const { account, currentTier, settings } = useLoyalty();

  return (
    <section className="relative min-h-[80vh] lg:min-h-screen flex items-center bg-gradient-hero overflow-hidden pt-20 pb-16">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/3 right-0 w-[42rem] h-[42rem] rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-surface rounded-3xl p-6 md:p-12 lg:p-16 shadow-card relative overflow-hidden">
          {/* Inner ambient */}
          <div className="pointer-events-none absolute -top-32 -right-20 w-96 h-96 rounded-full bg-primary/15 blur-[100px]" />

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative">
            {/* Left column */}
            <div className="space-y-7 animate-fade-in">
              {/* Loyalty hook chip */}
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/25 px-4 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase text-primary">
                  Inner Circle Rewards · Now Live
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] uppercase tracking-tight text-foreground">
                Premium Sneakers
                <br />
                <span className="text-foreground/40">& Lifestyle Shop</span>
                <br />
                <span className="text-primary drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
                  Beyond Measure. Beyond Limits.
                </span>
              </h1>

              {/* Loyalty status card / CTA */}
              {user && account ? (
                <div className="flex items-stretch gap-3 glass-surface rounded-2xl p-3 w-fit">
                  <div className="flex flex-col px-2">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
                      Your points
                    </span>
                    <span className="font-display text-2xl text-gold">
                      {account.points_balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="flex flex-col px-2">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
                      Tier
                    </span>
                    <span className="font-display text-2xl">
                      {account.current_tier}
                      {currentTier && currentTier.multiplier > 1 && (
                        <span className="ml-1 text-xs text-gold">{currentTier.multiplier}x</span>
                      )}
                    </span>
                  </div>
                  <Link
                    to="/customer/rewards"
                    className="self-center ml-1 px-3 py-2 rounded-lg bg-primary/15 hover:bg-primary/25 transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Gift className="w-3.5 h-3.5" /> Rewards
                  </Link>
                </div>
              ) : (
                <Link
                  to="/auth?tab=signup"
                  className="inline-flex items-center gap-3 glass-surface rounded-2xl px-5 py-3 w-fit hover:border-primary/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-gold-foreground">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Join the Inner Circle
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      Earn points, unlock partner perks across Qatar
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-60 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                Sneakers, bags, watches & cosmetics — curated drops with AI-powered picks and member-only rewards.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onAIClick}
                  size="lg"
                  className="ai-hero-button text-primary-foreground font-bold text-base h-14 px-8 shadow-glow hover:scale-[1.02] transition-transform group"
                >
                  <MessageSquare className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Find Your Perfect Kicks
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById("all-products");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="glass-surface text-foreground hover:bg-card/80 font-bold text-base h-14 px-8"
                >
                  Explore Collection
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60 max-w-lg">
                <div>
                  <div className="font-display text-2xl md:text-3xl">1000+</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                    Styles
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl md:text-3xl">24/7</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                    Concierge
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl md:text-3xl">QAR</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                    Local Delivery
                  </div>
                </div>
              </div>
            </div>

            {/* Right column visual */}
            <div className="relative flex justify-center items-center min-h-[320px] lg:min-h-[480px]">
              <div className="absolute w-full h-full bg-primary/10 rounded-full blur-[80px]" />
              <div className="relative z-10 group">
                <div className="absolute -inset-2 rounded-3xl bg-primary/20 blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
                <img
                  src={heroImage}
                  alt="Premium sneakers from BM Kicks"
                  width={1024}
                  height={1024}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="relative rounded-3xl shadow-card w-full max-w-2xl aspect-square object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Logo overlay */}
                <img
                  src={bmKicksLogo}
                  alt=""
                  aria-hidden="true"
                  width={96}
                  height={96}
                  className="absolute -top-6 -left-6 w-20 h-20 md:w-24 md:h-24 rounded-2xl glass-strong p-2 shadow-glow"
                />
              </div>

              {/* Loyalty earn badge */}
              {settings && (settings.points_per_qar > 0 || settings.points_per_order > 0) && (
                <div className="absolute -bottom-4 -right-2 md:bottom-4 md:-right-4 z-20 glass-strong p-4 rounded-2xl flex flex-col items-center gap-1 transform rotate-3 shadow-card max-w-[200px]">
                  <div className="w-14 h-14 bg-gradient-gold rounded-full flex flex-col items-center justify-center text-gold-foreground font-display shadow-glow leading-none">
                    <span className="text-lg">+{settings.points_per_qar}</span>
                    <span className="text-[8px] uppercase tracking-wider mt-0.5">pt/QAR</span>
                  </div>
                  <div className="text-[10px] font-bold text-center">
                    <p className="text-muted-foreground uppercase tracking-widest">Earn Points</p>
                    <p className="text-gold mt-0.5">
                      {settings.points_per_order > 0
                        ? `+${settings.points_per_order} bonus / order`
                        : "On every order"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty marquee */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-border/40 py-3 backdrop-blur">
        <div className="flex whitespace-nowrap gap-10 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-10">
              <span>Join the BM Inner Circle</span>
              <span className="text-primary">/</span>
              <span>Physical Gifts</span>
              <span className="text-primary">/</span>
              <span>Qatar Partner Vouchers</span>
              <span className="text-primary">/</span>
              <span>Early Drop Access</span>
              <span className="text-primary">/</span>
              <span>Birthday Rewards</span>
              <span className="text-primary">/</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
