import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyalty } from "@/hooks/useLoyalty";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Trophy, Lock, Sparkles, Flame, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  BADGES,
  RARITY_STYLE,
  computeEarnedBadges,
  loadGameState,
  syncBadgeUnlocks,
  type BadgeContext,
  type BadgeRarity,
} from "@/lib/badges";

const SPEND_TIERS_MIN = [0, 500, 2000, 5000, 10000, 15000, 25000];

const CATEGORIES: { key: BadgeContext extends never ? never : string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "journey", label: "Journey" },
  { key: "spend", label: "Spend" },
  { key: "engagement", label: "Engagement" },
  { key: "social", label: "Social" },
  { key: "elite", label: "Elite" },
];

export default function Badges() {
  const { user } = useAuth();
  const { account } = useLoyalty();
  const [totalSpent, setTotalSpent] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [referralsCompleted, setReferralsCompleted] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [maxItemPrice, setMaxItemPrice] = useState(0);
  const [maxOrderTotal, setMaxOrderTotal] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const game = loadGameState();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [ordersRes, refRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("id, total").eq("user_id", user.id),
        supabase
          .from("loyalty_referrals" as any)
          .select("id", { count: "exact", head: true })
          .eq("referrer_user_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("order_items")
          .select("quantity, actual_price, product_id, orders!inner(user_id)")
          .eq("orders.user_id", user.id),
      ]);
      if (ordersRes.data) {
        setOrderCount(ordersRes.data.length);
        const orderTotals = ordersRes.data.map((o: any) => Number(o.total ?? 0));
        setTotalSpent(orderTotals.reduce((s, n) => s + n, 0));
        setMaxOrderTotal(orderTotals.length ? Math.max(...orderTotals) : 0);
      }
      if (typeof refRes.count === "number") setReferralsCompleted(refRes.count);

      // Build category/brand counts + max single-item price from order items
      const items = (itemsRes.data ?? []) as any[];
      const productIds = Array.from(
        new Set(items.map((i) => i.product_id).filter(Boolean)),
      );
      let maxPrice = 0;
      for (const it of items) {
        const p = Number(it.actual_price ?? 0);
        if (p > maxPrice) maxPrice = p;
      }
      setMaxItemPrice(maxPrice);

      if (productIds.length) {
        const { data: prods } = await supabase
          .from("products")
          .select("id, category, brand")
          .in("id", productIds);
        const byId: Record<string, { category?: string; brand?: string }> = {};
        (prods ?? []).forEach((p: any) => {
          byId[p.id] = { category: p.category, brand: p.brand };
        });
        const cc: Record<string, number> = {};
        const bc: Record<string, number> = {};
        for (const it of items) {
          const meta = byId[it.product_id];
          if (!meta) continue;
          const qty = Number(it.quantity ?? 1);
          if (meta.category) cc[meta.category] = (cc[meta.category] ?? 0) + qty;
          if (meta.brand) bc[meta.brand] = (bc[meta.brand] ?? 0) + qty;
        }
        setCategoryCounts(cc);
        setBrandCounts(bc);
      }
    })();
  }, [user]);

  const combinedScore = totalSpent + (account?.points_balance ?? 0) + (game.bonusPoints ?? 0);
  const tierIndex = SPEND_TIERS_MIN.reduce(
    (acc, min, i) => (combinedScore >= min ? i : acc),
    0,
  );

  const ctx: BadgeContext = {
    totalSpent,
    orderCount,
    pointsBalance: account?.points_balance ?? 0,
    lifetimePoints: account?.lifetime_points ?? 0,
    combinedScore,
    tierIndex,
    game,
    referralsCompleted,
    categoryCounts,
    brandCounts,
    maxItemPrice,
    maxOrderTotal,
  };

  // Diamond is tier index 5. Secret badges stay masked until then.
  const hasDiamond = tierIndex >= 5;

  const earned = useMemo(() => computeEarnedBadges(ctx), [ctx]);

  // Award +50 bonus once for any newly-unlocked badge
  useEffect(() => {
    if (earned.size > 0) syncBadgeUnlocks(earned, 50);
  }, [earned]);

  const visible =
    filter === "all" ? BADGES : BADGES.filter((b) => b.category === filter);

  const earnedCount = BADGES.filter((b) => earned.has(b.id)).length;
  const progressPct = (earnedCount / BADGES.length) * 100;

  const byRarity = (r: BadgeRarity) =>
    BADGES.filter((b) => b.rarity === r && earned.has(b.id)).length;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/customer" },
          { label: "Badges" },
        ]}
      />

      {/* Hero summary */}
      <div className="rounded-2xl p-[2px] bg-[linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)] shadow-[0_0_60px_-15px_rgba(236,72,153,0.6)]">
        <div className="rounded-2xl bg-card p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-amber-300 mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Achievements
              </p>
              <h1 className="text-4xl md:text-5xl font-black bg-[linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)] bg-clip-text text-transparent">
                Your Trophy Case
              </h1>
              <p className="text-muted-foreground mt-1">
                Collect them all and climb the BmKicks legend ladder.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                Earned
              </p>
              <p className="text-4xl md:text-5xl font-black font-mono">
                {earnedCount}
                <span className="text-muted-foreground text-2xl">
                  /{BADGES.length}
                </span>
              </p>
            </div>
          </div>

          <Progress
            value={progressPct}
            className="h-3 bg-secondary [&>div]:bg-[linear-gradient(90deg,#f59e0b,#ec4899,#8b5cf6)]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(progressPct)}% complete · {combinedScore.toLocaleString()} pts ·{" "}
            {orderCount} orders · {game.streak}d streak
          </p>

          <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
            <RarityStat rarity="common" count={byRarity("common")} />
            <RarityStat rarity="rare" count={byRarity("rare")} />
            <RarityStat rarity="epic" count={byRarity("epic")} />
            <RarityStat rarity="legendary" count={byRarity("legendary")} />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
              filter === c.key
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((b) => {
          const isEarned = earned.has(b.id);
          const isMasked = !!b.secret && !hasDiamond && !isEarned;
          const r = RARITY_STYLE[b.rarity];
          return (
            <Card
              key={b.id}
              className={cn(
                "relative overflow-hidden border-2 transition-all hover:-translate-y-1",
                isEarned ? r.ring : "border-border opacity-60",
                isEarned && r.glow,
                isMasked && "border-dashed",
              )}
            >
              <CardContent className="p-5 flex flex-col items-center text-center">
                <span
                  className={cn(
                    "absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                    isMasked ? "bg-muted/40 text-muted-foreground" : r.chip,
                  )}
                >
                  {isMasked ? "SECRET" : b.rarity}
                </span>
                <div
                  className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-3 transition-transform",
                    isEarned
                      ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] scale-100"
                      : "bg-secondary/40 grayscale scale-90",
                  )}
                >
                  {isEarned ? (
                    b.emoji
                  ) : isMasked ? (
                    <span className="text-3xl text-muted-foreground">❓</span>
                  ) : (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p
                  className={cn(
                    "font-black text-sm",
                    isEarned ? r.label : "text-muted-foreground",
                  )}
                >
                  {isMasked ? "???" : b.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  {isMasked ? "Reach Diamond tier to reveal" : b.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tips */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" /> How to earn more
          </h2>
          <ul className="grid md:grid-cols-2 gap-3 text-sm">
            {[
              ["Browse the catalog", "Unlocks Explorer badges"],
              ["Place orders", "Unlocks Journey badges"],
              ["Spin the daily wheel", "Unlocks Engagement badges"],
              ["Refer friends", "Unlocks Social badges"],
              ["Visit daily", "Builds streak badges"],
              ["Spend more", "Climbs the Elite tier"],
            ].map(([label, hint]) => (
              <li
                key={label}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/40"
              >
                <Flame className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <p className="font-bold">{label}</p>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function RarityStat({ rarity, count }: { rarity: BadgeRarity; count: number }) {
  const r = RARITY_STYLE[rarity];
  const total = BADGES.filter((b) => b.rarity === rarity).length;
  return (
    <div className="text-center">
      <div
        className={cn(
          "text-[10px] uppercase tracking-widest font-bold mb-1",
          r.label,
        )}
      >
        <Medal className="w-3 h-3 inline mr-1" />
        {rarity}
      </div>
      <p className="text-2xl font-black font-mono">
        {count}
        <span className="text-muted-foreground text-sm">/{total}</span>
      </p>
    </div>
  );
}
