import { Search, Sparkles, Tag } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";

export const CustomRequestCTA = () => {
  const message =
    "Hi BM Kicks! I'd like to request a custom pre-order. I'm looking for a specific item (sneakers / bag / watch) and would love to hear your best price compared to mall stores. Here are the details:\n\n- Brand / Model:\n- Size / Variant:\n- Reference link or photo:\n\nThanks!";

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-10 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Custom Pre-Order Service
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Can't find what you're looking for?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Tell us the exact sneakers, bags, or watches you want and we'll source them for you —
              often at <span className="text-foreground font-semibold">better pricing than mall stores</span>.
              Chat with our team and we'll quote you a custom pre-order.
            </p>
            <div className="flex flex-wrap gap-4 text-xs md:text-sm text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1.5">
                <Search className="w-4 h-4 text-primary" /> Any brand or model
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-primary" /> Better-than-mall pricing
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> 50% downpayment to reserve
              </span>
            </div>
          </div>
          <div className="flex md:flex-col gap-3 md:items-end">
            <WhatsAppButton
              message={message}
              size="lg"
              className="w-full md:w-auto whitespace-nowrap"
            />
            <p className="text-[10px] md:text-xs text-muted-foreground text-center md:text-right">
              Reply within minutes during business hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
