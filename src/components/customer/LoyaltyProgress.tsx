import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  Trophy,
  Crown,
  Gem,
  Medal,
  Award,
  Star,
  Sparkles,
  Lock,
  ShoppingBag,
  Repeat,
  Heart,
  Flame,
  Zap,
  Eye,
  Users,
  Gift,
  Calendar,
  Rocket,
  Target,
  Coins,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tier {
  name: string;
  min: number;
  icon: typeof Trophy;
  color: string;
  bg: string;
  glow: string;
}

const TIERS: Tier[] = [
  { name: "Rookie",   min: 0,     icon: Star,    color: "text-slate-300",   bg: "bg-slate-500/10",   glow: "shadow-slate-500/30" },
  { name: "Bronze",   min: 500,   icon: Medal,   color: "text-amber-600",   bg: "bg-amber-600/10",   glow: "shadow-amber-600/30" },
  { name: "Silver",   min: 2000,  icon: Award,   color: "text-zinc-300",    bg: "bg-zinc-400/10",    glow: "shadow-zinc-400/30" },
  { name: "Gold",     min: 5000,  icon: Trophy,  color: "text-yellow-400",  bg: "bg-yellow-500/10",  glow: "shadow-yellow-500/40" },
  { name: "Platinum", min: 10000, icon: Crown,   color: "text-cyan-300",    bg: "bg-cyan-400/10",    glow: "shadow-cyan-400/40" },
  { name: "Diamond",  min: 20000, icon: Gem,     color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", glow: "shadow-fuchsia-500/50" },
  // Secret tiers — only revealed once Diamond is reached
  { name: "Mythic",   min: 30000, icon: Sparkles,color: "text-purple-300",  bg: "bg-purple-500/10",  glow: "shadow-purple-500/50" },
  { name: "Arcana",   min: 50000, icon: Sparkles,color: "text-pink-300",    bg: "bg-pink-500/10",    glow: "shadow-pink-500/60" },
];

const DIAMOND_INDEX = 5;
const SECRET_TIER_NAMES = new Set(["Mythic", "Arcana"]);


interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: typeof ShoppingBag;
  emoji: string;
  unlocked: boolean;
  color: string;
}

interface LoyaltyProgressProps {
  totalSpent: number;
  totalOrders: number;
  deliveredOrders: number;
  pointsBalance?: number;
  productViews?: number;
  streak?: number;
  badgesEarned?: number;
  referralsCompleted?: number;
}

export function LoyaltyProgress({
  totalSpent,
  totalOrders,
  deliveredOrders,
  pointsBalance = 0,
  productViews = 0,
  streak = 0,
  badgesEarned = 0,
  referralsCompleted = 0,
}: LoyaltyProgressProps) {
  // Tier driven by combined score: QAR spent + bonus/loyalty points
  const combined = totalSpent + pointsBalance;
  const currentTierIndex = TIERS.reduce(
    (acc, tier, i) => (combined >= tier.min ? i : acc),
    0,
  );
  const currentTier = TIERS[currentTierIndex];
  // Secret tiers (Mythic, Arcana) stay hidden until the user reaches Diamond
  const hasDiamond = currentTierIndex >= DIAMOND_INDEX;
  const visibleTiers = hasDiamond
    ? TIERS
    : TIERS.filter((t) => !SECRET_TIER_NAMES.has(t.name));
  const nextTier = TIERS[currentTierIndex + 1];
  // Hide the next tier's name/threshold if it's still a secret
  const nextTierVisible =
    nextTier && (hasDiamond || !SECRET_TIER_NAMES.has(nextTier.name))
      ? nextTier
      : null;
  const remainingToNext = nextTier ? Math.max(0, nextTier.min - combined) : 0;
  const TierIcon = currentTier.icon;

  // Multi-segment progress that mirrors the Rewards page
  const segCount = visibleTiers.length - 1;
  const segWidth = 100 / segCount;
  const visibleIndex = visibleTiers.findIndex((t) => t.name === currentTier.name);
  const visibleNext = visibleTiers[visibleIndex + 1];
  const fillPct = !visibleNext
    ? 100
    : (visibleIndex +
        Math.min(
          1,
          Math.max(
            0,
            (combined - currentTier.min) / (visibleNext.min - currentTier.min),
          ),
        )) *
      segWidth;


  const achievements: Achievement[] = [
    { id: "first",        name: "First Step",           description: "Place your first order",         icon: ShoppingBag, emoji: "👟", unlocked: totalOrders >= 1,        color: "text-green-400" },
    { id: "repeat",       name: "Coming Back",          description: "Complete 3 orders",              icon: Repeat,      emoji: "🔁", unlocked: totalOrders >= 3,        color: "text-blue-400" },
    { id: "loyal",        name: "Loyal Fan",            description: "Complete 10 orders",             icon: Heart,       emoji: "❤️", unlocked: totalOrders >= 10,       color: "text-rose-400" },
    { id: "bigspender",   name: "Big Spender",          description: `Spend ${formatCurrency(5000)}`,  icon: Flame,       emoji: "🔥", unlocked: totalSpent >= 5000,      color: "text-orange-400" },
    { id: "delivered5",   name: "Verified Sneakerhead", description: "5 delivered orders",             icon: Zap,         emoji: "👟", unlocked: deliveredOrders >= 5,    color: "text-yellow-400" },
    { id: "elite",        name: "Elite Collector",      description: `Spend ${formatCurrency(10000)}`, icon: Sparkles,    emoji: "✨", unlocked: totalSpent >= 10000,     color: "text-fuchsia-400" },
    { id: "browser",      name: "Window Shopper",       description: "View 10 products",               icon: Eye,         emoji: "👀", unlocked: productViews >= 10,      color: "text-sky-400" },
    { id: "explorer",     name: "Explorer",             description: "View 50 products",               icon: Target,      emoji: "🧭", unlocked: productViews >= 50,      color: "text-indigo-400" },
    { id: "streaker",     name: "On a Streak",          description: "Visit 3 days in a row",          icon: Calendar,    emoji: "⚡", unlocked: streak >= 3,             color: "text-emerald-400" },
    { id: "marathon",     name: "Marathon",             description: "Visit 7 days in a row",          icon: Flame,       emoji: "🏃", unlocked: streak >= 7,             color: "text-orange-500" },
    { id: "hypebeast",    name: "Hypebeast",            description: "Earn 5,000 points",              icon: Rocket,      emoji: "🚀", unlocked: pointsBalance >= 5000,   color: "text-pink-400" },
    { id: "ambassador",   name: "Ambassador",           description: "Refer your first friend",       icon: Users,       emoji: "🤝", unlocked: referralsCompleted >= 1, color: "text-violet-400" },
    { id: "influencer",   name: "Influencer",           description: "Refer 5 friends",               icon: PartyPopper, emoji: "📣", unlocked: referralsCompleted >= 5, color: "text-amber-400" },
    { id: "collector",    name: "Badge Collector",      description: "Earn 5 badges",                  icon: Trophy,      emoji: "🏆", unlocked: badgesEarned >= 5,       color: "text-yellow-300" },
    { id: "vip",          name: "VIP Status",           description: "Reach Gold tier",                icon: Crown,       emoji: "👑", unlocked: currentTierIndex >= 3,   color: "text-yellow-400" },
    { id: "mythic",       name: "Mythic Ascended",      description: "Reach Mythic tier",              icon: Sparkles,    emoji: "🔮", unlocked: currentTierIndex >= 5,   color: "text-purple-300" },
    { id: "legend",       name: "Living Legend",        description: "Reach Diamond tier",             icon: Gem,         emoji: "💎", unlocked: currentTierIndex >= 6,   color: "text-fuchsia-300" },
    { id: "saver",        name: "Point Saver",          description: "Hold 1,000 points",              icon: Coins,       emoji: "🪙", unlocked: pointsBalance >= 1000,   color: "text-amber-300" },
    { id: "gifter",       name: "Gift Giver",           description: "Redeem a reward",                icon: Gift,        emoji: "🎁", unlocked: false,                   color: "text-rose-300" },
  ];


  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Loyalty Progress
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {combined.toLocaleString()} xp
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tier */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg ring-2 ring-border/50",
              currentTier.bg,
              currentTier.glow,
            )}
          >
            <TierIcon className={cn("h-8 w-8", currentTier.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Current Tier
            </p>
            <p className={cn("text-2xl font-bold", currentTier.color)}>
              {currentTier.name}
            </p>
            {nextTier ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(remainingToNext)} more (spend or earn) to reach{" "}
                <span className="font-semibold text-foreground">
                  {nextTier.name}
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                You've reached the highest tier — legend status!
              </p>
            )}
          </div>
        </div>

        {/* Multi-tier journey progress (matches Rewards page) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Crew Journey
            </span>
            <span className="font-mono">
              {formatCurrency(combined)} /{" "}
              {formatCurrency(TIERS[TIERS.length - 1].min)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#ec4899,#4ade80)] transition-all"
              style={{ width: `${fillPct}%` }}
            />
            {TIERS.map((t, i) => {
              const pct = i * segWidth;
              const reached = combined >= t.min;
              return (
                <div
                  key={t.name}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 transition-all",
                    reached
                      ? "bg-[#4ade80] border-[#4ade80] shadow-[0_0_8px_#4ade80]"
                      : "bg-card border-muted-foreground/40",
                    i === currentTierIndex && nextTier && "scale-150",
                  )}
                  style={{ left: `calc(${pct}% - 4px)` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            {TIERS.map((t, i) => (
              <div
                key={t.name}
                className={cn(
                  "flex flex-col items-center gap-0.5",
                  combined >= t.min ? "text-foreground" : "",
                  i === currentTierIndex && "text-[#4ade80] font-bold",
                )}
              >
                <span className="uppercase tracking-wider">{t.name}</span>
                <span className="font-mono">{formatCurrency(t.min)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier ladder with icons */}
        <div className="flex items-center justify-between gap-1 pt-2">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            const reached = i <= currentTierIndex;
            return (
              <div
                key={tier.name}
                className="flex flex-col items-center gap-1 flex-1 min-w-0"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    reached
                      ? cn(tier.bg, "ring-1 ring-border")
                      : "bg-muted/30 opacity-40",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      reached ? tier.color : "text-muted-foreground",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[9px] md:text-[10px] truncate w-full text-center",
                    reached ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {tier.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Achievements (collapsible) */}
        <Collapsible className="pt-2 border-t border-border">
          <CollapsibleTrigger className="group flex w-full items-center justify-between py-1 text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Achievements</p>
              <Badge variant="secondary" className="text-xs">
                {unlockedCount} / {achievements.length}
              </Badge>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-3">
              {achievements.map((a) => {
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-2.5 transition-all",
                      a.unlocked
                        ? "border-border bg-card hover:shadow-md"
                        : "border-dashed border-border/50 bg-muted/20",
                    )}
                  >
                    <div
                      className={cn(
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl",
                        a.unlocked
                          ? "bg-gradient-to-br from-primary/15 to-primary/5 shadow-inner"
                          : "bg-muted/40",
                      )}
                    >
                      {a.unlocked ? (
                        <span
                          className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                          aria-hidden
                        >
                          {a.emoji}
                        </span>
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-xs font-semibold leading-tight",
                          a.unlocked ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {a.name}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground break-words">
                        {a.unlocked ? `Earned: ${a.description}` : `How to earn: ${a.description}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

