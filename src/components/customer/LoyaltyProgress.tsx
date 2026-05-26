import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  { name: "Diamond",  min: 25000, icon: Gem,     color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", glow: "shadow-fuchsia-500/50" },
];

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: typeof ShoppingBag;
  unlocked: boolean;
  color: string;
}

interface LoyaltyProgressProps {
  totalSpent: number;
  totalOrders: number;
  deliveredOrders: number;
}

export function LoyaltyProgress({ totalSpent, totalOrders, deliveredOrders }: LoyaltyProgressProps) {
  const currentTierIndex = TIERS.reduce(
    (acc, tier, i) => (totalSpent >= tier.min ? i : acc),
    0,
  );
  const currentTier = TIERS[currentTierIndex];
  const nextTier = TIERS[currentTierIndex + 1];

  const progressToNext = nextTier
    ? Math.min(
        100,
        ((totalSpent - currentTier.min) / (nextTier.min - currentTier.min)) * 100,
      )
    : 100;

  const remainingToNext = nextTier ? Math.max(0, nextTier.min - totalSpent) : 0;
  const points = Math.floor(totalSpent);

  const TierIcon = currentTier.icon;

  const achievements: Achievement[] = [
    {
      id: "first",
      name: "First Step",
      description: "Place your first order",
      icon: ShoppingBag,
      unlocked: totalOrders >= 1,
      color: "text-green-400",
    },
    {
      id: "repeat",
      name: "Coming Back",
      description: "Complete 3 orders",
      icon: Repeat,
      unlocked: totalOrders >= 3,
      color: "text-blue-400",
    },
    {
      id: "loyal",
      name: "Loyal Fan",
      description: "Complete 10 orders",
      icon: Heart,
      unlocked: totalOrders >= 10,
      color: "text-rose-400",
    },
    {
      id: "bigspender",
      name: "Big Spender",
      description: `Spend ${formatCurrency(5000)}`,
      icon: Flame,
      unlocked: totalSpent >= 5000,
      color: "text-orange-400",
    },
    {
      id: "delivered5",
      name: "Verified Sneakerhead",
      description: "5 delivered orders",
      icon: Zap,
      unlocked: deliveredOrders >= 5,
      color: "text-yellow-400",
    },
    {
      id: "elite",
      name: "Elite Collector",
      description: `Spend ${formatCurrency(10000)}`,
      icon: Sparkles,
      unlocked: totalSpent >= 10000,
      color: "text-fuchsia-400",
    },
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
            {points.toLocaleString()} pts
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
                Spend {formatCurrency(remainingToNext)} more to reach{" "}
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

        {/* Progress Bar */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between items-end text-xs">
              <span className="text-muted-foreground">{currentTier.name}</span>
              <span className="text-foreground font-semibold">
                You've spent {formatCurrency(totalSpent)} ({Math.round(progressToNext)}%)
              </span>
              <span className="text-muted-foreground">{nextTier.name}</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Starts at {formatCurrency(currentTier.min)}</span>
              <span>Unlocks at {formatCurrency(nextTier.min)}</span>
            </div>
          </div>
        )}


        {/* Tier ladder */}
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

        {/* Achievements */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Achievements</p>
            <Badge variant="secondary" className="text-xs">
              {unlockedCount} / {achievements.length}
            </Badge>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {achievements.map((a) => {
              const Icon = a.unlocked ? a.icon : Lock;
              return (
                <div
                  key={a.id}
                  title={`${a.name} — ${a.description}`}
                  className={cn(
                    "group relative aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all",
                    a.unlocked
                      ? "border-border bg-card hover:scale-105 hover:shadow-lg"
                      : "border-dashed border-border/50 bg-muted/20 opacity-60",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      a.unlocked ? a.color : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[9px] md:text-[10px] font-medium text-center leading-tight line-clamp-2",
                      a.unlocked ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {a.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
