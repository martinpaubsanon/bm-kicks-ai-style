import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyalty } from "@/hooks/useLoyalty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Gift,
  Copy,
  Sparkles,
  Store,
  Package,
  Ticket,
  Trophy,
  Flame,
  Lock,
  Star,
  Medal,
  Award,
  Crown,
  Gem,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

// Spend-based tiers — MUST match src/components/customer/LoyaltyProgress.tsx
const SPEND_TIERS = [
  { name: "Rookie",   min: 0,     icon: Star,   color: "#cbd5e1", secret: false },
  { name: "Bronze",   min: 500,   icon: Medal,  color: "#d97706", secret: false },
  { name: "Silver",   min: 2000,  icon: Award,  color: "#d4d4d8", secret: false },
  { name: "Gold",     min: 5000,  icon: Trophy, color: "#facc15", secret: false },
  { name: "Platinum", min: 10000, icon: Crown,  color: "#67e8f9", secret: false },
  { name: "Diamond",  min: 20000, icon: Gem,    color: "#e879f9", secret: false },
  // Secret tiers — revealed only after Diamond
  { name: "Mythic",   min: 30000, icon: Sparkles, color: "#c084fc", secret: true },
  { name: "Arcana",   min: 50000, icon: Sparkles, color: "#f0abfc", secret: true },
];

// ---------- Gamified config ----------
const BADGES = [
  { id: "first_steps", label: "First Steps", description: "Joined the BmKicks crew", emoji: "👟" },
  { id: "browser", label: "Window Shopper", description: "Viewed 10 products", emoji: "👀" },
  { id: "cart_starter", label: "Cart Starter", description: "Added your first item", emoji: "🛒" },
  { id: "hypebeast", label: "Hypebeast", description: "Reached Level 3", emoji: "🔥" },
  { id: "spinner", label: "Lucky Spinner", description: "Spun the daily wheel", emoji: "🎰" },
  { id: "streaker", label: "On a Streak", description: "Visited 3 days in a row", emoji: "⚡" },
];

import {
  loadGameState as loadState,
  saveGameState as saveState,
  awardBonus,
  syncBadgeUnlocks,
  todayStr,
  type LocalGameState,
} from "@/lib/badges";

export default function Rewards() {
  const { user } = useAuth();
  const { account, settings, loading, reload } = useLoyalty();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  const [game, setGame] = useState<LocalGameState>(() => loadState(user?.id));
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);

  // Stay in sync with localStorage updates triggered elsewhere (toast events, etc.)
  useEffect(() => {
    const refresh = () => setGame(loadState(user?.id));
    refresh();
    window.addEventListener("bmkicks:game-updated", refresh);
    window.addEventListener("bmkicks:game-user-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bmkicks:game-updated", refresh);
      window.removeEventListener("bmkicks:game-user-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [txnRes, rewardsRes, ordersRes] = await Promise.all([
        supabase
          .from("loyalty_transactions" as any)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("rewards_catalog" as any)
          .select("*, loyalty_partners(name, logo_url, category)")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("orders")
          .select("total")
          .eq("user_id", user.id),
      ]);
      if (txnRes.data) setTransactions(txnRes.data as any[]);
      if (rewardsRes.data) setRewards(rewardsRes.data as any[]);
      if (ordersRes.data) {
        setTotalSpent(
          ordersRes.data.reduce((sum: number, o: any) => sum + Number(o.total ?? 0), 0)
        );
      }
    })();
  }, [user]);

  const copyReferral = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.referral_code);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    const { error } = await supabase.rpc("redeem_reward" as any, { p_reward_id: rewardId });
    setRedeeming(null);
    if (error) {
      toast({ title: "Cannot redeem", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Reward redeemed!", description: "Check your redemptions for details." });
    reload();
  };

  const canSpin = !!user && game.lastSpin !== todayStr();

  const handleSpin = useCallback(() => {
    if (!user || !canSpin || spinning) return;
    setSpinning(true);
    const rewards = [1, 5, 10, 15, 20, 25, 35, 50];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const turns = 5 + Math.random() * 3;
    setSpinAngle((a) => a + turns * 360);
    setTimeout(() => {
      setSpinning(false);
      // Mark the spin so it's once-a-day, then award via global bonus toast.
      const prev = loadState(user.id);
      const badges = [...prev.badges];
      if (!badges.includes("spinner")) badges.push("spinner");
      saveState({ ...prev, lastSpin: todayStr(), badges }, user.id);
      awardBonus(reward, "Daily spin reward", "🎰", user.id);
    }, 3000);
  }, [canSpin, spinning, user]);

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const filtered = (kind: string) => rewards.filter((r) => r.kind === kind);

  // Tier is based on combined score (QAR spent + bonus points earned)
  const combinedScore = totalSpent + (account.points_balance ?? 0) + (game.bonusPoints ?? 0);
  const currentLevelIndex = SPEND_TIERS.reduce(
    (acc, t, i) => (combinedScore >= t.min ? i : acc),
    0,
  );
  const currentSpendTier = SPEND_TIERS[currentLevelIndex];
  const nextSpendTier = SPEND_TIERS[currentLevelIndex + 1] ?? null;
  const spendProgress = nextSpendTier
    ? Math.min(
        100,
        ((combinedScore - currentSpendTier.min) /
          (nextSpendTier.min - currentSpendTier.min)) *
          100,
      )
    : 100;
  const remainingToNext = nextSpendTier ? Math.max(0, nextSpendTier.min - combinedScore) : 0;
  // Diamond is index 5. Secret tiers (Mythic, Arcana) are masked until Diamond is reached.
  const hasDiamond = currentLevelIndex >= 5;
  const nextTierMasked = !!nextSpendTier?.secret && !hasDiamond;
  const tierName = (t: (typeof SPEND_TIERS)[number]) =>
    t.secret && !hasDiamond ? "???" : t.name;
  const tierMinLabel = (t: (typeof SPEND_TIERS)[number]) =>
    t.secret && !hasDiamond ? "??? pts" : `${t.min.toLocaleString()} pts`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/customer" }, { label: "Rewards" }]} />

      {/* === Gamified status card === */}
      <div className="rounded-2xl p-[2px] bg-[linear-gradient(135deg,#ec4899,#4ade80)] shadow-[0_0_40px_-10px_rgba(236,72,153,0.6)]">
        <div className="rounded-2xl bg-card p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold mb-2 text-[#4ade80]">
                Your Status
              </p>
              <h1 className="text-4xl md:text-5xl font-black bg-[linear-gradient(135deg,#ec4899,#4ade80)] bg-clip-text text-transparent">
                {currentSpendTier.name}
              </h1>
              <p className="text-muted-foreground mt-1">Member of the BmKicks Crew</p>
            </div>
            {nextSpendTier ? (
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  Next rank
                </p>
                <p className="text-2xl md:text-3xl font-black text-[#4ade80]">
                  {nextTierMasked ? "???" : nextSpendTier.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextTierMasked
                    ? "Reach Diamond to unveil…"
                    : `${remainingToNext.toLocaleString()} pts away`}
                </p>
              </div>
            ) : (
              <p className="text-[#4ade80] font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Max tier — Legend
              </p>
            )}
          </div>

          {/* Separate + combined stat tiles */}
          {(() => {
            const displayPoints = (account.points_balance ?? 0) + (game.bonusPoints ?? 0);
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <StatTile
                  label="Points balance"
                  value={displayPoints.toLocaleString()}
                  suffix="pts"
                  accent="#ec4899"
                  icon={<Sparkles className="w-4 h-4" />}
                />
                <StatTile
                  label="Total spent"
                  value={formatCurrency(totalSpent)}
                  accent="#4ade80"
                  icon={<Trophy className="w-4 h-4" />}
                />
                <StatTile
                  label="Combined score"
                  value={(displayPoints + Math.round(totalSpent)).toLocaleString()}
                  suffix="XP"
                  gradient
                  icon={<Flame className="w-4 h-4" />}
                />
              </div>
            );
          })()}

          {/* Full multi-tier journey progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">
                Crew Journey
              </span>
              <span className="font-mono">
                {combinedScore.toLocaleString()} pts / {tierMinLabel(SPEND_TIERS[SPEND_TIERS.length - 1])}
              </span>
            </div>
            {(() => {
              // Equal-width tier segments so each rank takes the same visual space.
              const segCount = SPEND_TIERS.length - 1; // 5 gaps between 6 tiers
              const segWidth = 100 / segCount;
              let fillPct: number;
              if (!nextSpendTier) {
                fillPct = 100;
              } else {
                const within =
                  (combinedScore - currentSpendTier.min) /
                  (nextSpendTier.min - currentSpendTier.min);
                fillPct = (currentLevelIndex + Math.min(1, Math.max(0, within))) * segWidth;
              }
              return (
                <>
                  <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#ec4899,#4ade80)] transition-all"
                      style={{ width: `${fillPct}%` }}
                    />
                    {SPEND_TIERS.map((t, i) => {
                      const pct = i * segWidth;
                      const reached = combinedScore >= t.min;
                      return (
                        <div
                          key={t.name}
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 transition-all",
                            reached
                              ? "bg-[#4ade80] border-[#4ade80] shadow-[0_0_8px_#4ade80]"
                              : "bg-card border-muted-foreground/40",
                            i === currentLevelIndex && nextSpendTier && "scale-150",
                          )}
                          style={{ left: `calc(${pct}% - 4px)` }}
                        />
                      );
                    })}
                  </div>
                </>
              );
            })()}
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              {SPEND_TIERS.map((t, i) => {
                const masked = t.secret && !hasDiamond;
                return (
                  <div
                    key={t.name}
                    className={cn(
                      "flex flex-col items-center gap-0.5",
                      combinedScore >= t.min ? "text-foreground" : "",
                      i === currentLevelIndex && "text-[#4ade80] font-bold",
                      masked && "italic text-muted-foreground/70",
                    )}
                  >
                    <span className="uppercase tracking-wider">{tierName(t)}</span>
                    <span className="font-mono">{tierMinLabel(t)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gamified stats row */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <Stat
              label="Streak"
              value={`${game.streak}d`}
              icon={<Flame className="w-4 h-4" />}
            />
            <Stat
              label="Bonus pts"
              value={game.bonusPoints}
              icon={<Gift className="w-4 h-4" />}
            />
            <Stat
              label="Viewed"
              value={game.productViews}
              icon={<Sparkles className="w-4 h-4" />}
            />
            <Stat
              label="Badges"
              value={`${game.badges.length}/${BADGES.length}`}
              icon={<Trophy className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* === Spin + Crew Ranks === */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Daily Spin */}
        <Card className="border-border/60">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Gift className="w-6 h-6 text-[#4ade80]" /> Daily Spin
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Free points every day. No catch.
            </p>
            <div className="relative w-56 h-56 mb-6">
              <div
                className="absolute inset-0 rounded-full border-4 border-[#ec4899] transition-transform ease-out"
                style={{
                  transform: `rotate(${spinAngle}deg)`,
                  transitionDuration: "3s",
                  background:
                    "conic-gradient(#ec4899 0deg 45deg, #4ade80 45deg 90deg, #ec4899 90deg 135deg, #4ade80 135deg 180deg, #ec4899 180deg 225deg, #4ade80 225deg 270deg, #ec4899 270deg 315deg, #4ade80 315deg 360deg)",
                }}
              />
              <div className="absolute inset-8 rounded-full bg-card border-2 border-border flex items-center justify-center text-3xl font-black">
                🎰
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#4ade80]" />
            </div>
            <Button
              onClick={handleSpin}
              disabled={spinning || !canSpin}
              className="w-full font-bold text-foreground bg-[linear-gradient(90deg,#ec4899,#4ade80)] hover:opacity-90"
              size="lg"
            >
              {spinning ? "Spinning..." : canSpin ? "Spin to Win" : "Come back tomorrow"}
            </Button>
          </CardContent>
        </Card>

        {/* Crew Ranks */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h2 className="text-2xl font-black mb-4">Crew Ranks</h2>
            <div className="space-y-3">
              {SPEND_TIERS.map((tier, i) => {
                const unlocked = i <= currentLevelIndex;
                const isYou = i === currentLevelIndex;
                const masked = tier.secret && !hasDiamond;
                const TierIcon = tier.icon;
                return (
                  <div
                    key={tier.name}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isYou
                        ? "border-[#ec4899] bg-secondary/40 shadow-[0_0_20px_-8px_#ec4899]"
                        : unlocked
                          ? "border-border bg-secondary/40"
                          : "border-border opacity-50",
                      masked && "border-dashed",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {masked || !unlocked ? (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <TierIcon className="w-5 h-5" style={{ color: tier.color }} />
                      )}
                      <div>
                        <p
                          className={cn("font-bold", masked && "italic")}
                          style={{ color: unlocked && !masked ? tier.color : undefined }}
                        >
                          {tierName(tier)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {masked ? "Reach Diamond to unveil" : `${tier.min.toLocaleString()}+ pts`}
                        </p>
                      </div>
                    </div>
                    {isYou && (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[#4ade80] text-black">
                        YOU
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* === Achievements === */}
      <section>
        <h2 className="text-2xl font-black mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {BADGES.map((b) => {
            const earned = game.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all",
                  earned
                    ? "border-[#4ade80] bg-secondary/40 shadow-[0_0_20px_-10px_#4ade80]"
                    : "border-border opacity-50",
                )}
              >
                <div className="text-4xl mb-2">{earned ? b.emoji : "🔒"}</div>
                <p className="font-bold text-sm">{b.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* === How to earn === */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="text-2xl font-black mb-4">How to Earn</h2>
          <ul className="grid md:grid-cols-2 gap-3 text-sm">
            {[
              ["Daily visit", "+15 pts"],
              ["View a product", "+2 pts"],
              ["Add to bag", "+10 pts"],
              ["Daily spin", "1–50 pts"],
              ["Unlock badge", "+50 pts"],
            ].map(([label, pts]) => (
              <li
                key={label}
                className="flex justify-between p-3 rounded-lg bg-secondary/40 border border-border/40"
              >
                <span>{label}</span>
                <span className="font-bold text-[#4ade80] font-mono">{pts}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* === Referral === */}
      <Card className="border-border/60">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Your referral code
            </p>
            <p className="font-display text-3xl mt-1">{account.referral_code}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Earn {settings?.referral_bonus ?? 500} pts when a friend places their first order.
            </p>
          </div>
          <Button onClick={copyReferral} variant="outline">
            <Copy className="w-4 h-4 mr-2" /> Copy code
          </Button>
        </CardContent>
      </Card>

      {/* === Featured reward === */}
      {(() => {
        const featured = rewards.find((r) => r.is_featured);
        if (!featured) return null;
        const pct = Math.min(
          100,
          Math.round(((account.points_balance ?? 0) / featured.points_cost) * 100),
        );
        const canAfford = (account.points_balance ?? 0) >= featured.points_cost;
        return (
          <div className="rounded-2xl p-[2px] bg-[linear-gradient(135deg,#facc15,#ec4899)] shadow-[0_0_40px_-10px_rgba(250,204,21,0.6)]">
            <Card className="rounded-2xl border-0">
              <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                {featured.image_url && (
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    className="w-full md:w-48 h-40 object-cover rounded-xl"
                  />
                )}
                <div className="flex-1 w-full">
                  <p className="text-xs uppercase tracking-widest font-bold text-[#facc15] mb-1">
                    ⭐ Featured reward
                  </p>
                  <h3 className="text-2xl font-black">{featured.title}</h3>
                  {featured.description && (
                    <p className="text-sm text-muted-foreground mt-1">{featured.description}</p>
                  )}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {(account.points_balance ?? 0).toLocaleString()} / {featured.points_cost.toLocaleString()} pts
                      </span>
                      <span className="font-bold">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-[linear-gradient(90deg,#facc15,#ec4899)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="font-bold"
                  disabled={!canAfford || !settings?.redemption_enabled || redeeming === featured.id}
                  onClick={() => handleRedeem(featured.id)}
                >
                  {redeeming === featured.id
                    ? "..."
                    : canAfford
                      ? "Redeem now"
                      : `${(featured.points_cost - (account.points_balance ?? 0)).toLocaleString()} pts to go`}
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* === Reward catalog === */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-tight">
            Reward catalog
          </CardTitle>
          {!settings?.redemption_enabled && (
            <p className="text-xs text-muted-foreground">
              Redemption opens soon. Start stacking points now.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="store">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="store">
                <Store className="w-4 h-4 mr-1.5" /> BM Store
              </TabsTrigger>
              <TabsTrigger value="gift">
                <Package className="w-4 h-4 mr-1.5" /> Gifts
              </TabsTrigger>
              <TabsTrigger value="partner">
                <Ticket className="w-4 h-4 mr-1.5" /> Partners
              </TabsTrigger>
            </TabsList>

            {[
              {
                key: "store",
                kind: "store_discount",
                teasers: [
                  { icon: Store, title: "BM Store Credit", desc: "QAR 100 / 250 / 500 off your next drop" },
                  { icon: Flame, title: "Early Drop Access", desc: "Cop limited releases 24h before everyone else" },
                  { icon: Sparkles, title: "Member-Only Pricing", desc: "Exclusive discounts on premium silhouettes" },
                ],
              },
              {
                key: "gift",
                kind: "physical_gift",
                teasers: [
                  { icon: Gift, title: "Mystery Boxes", desc: "Curated surprise drops — sneakers, accessories & more" },
                  { icon: Trophy, title: "BM Merch Capsule", desc: "Tees, caps and crewnecks reserved for members" },
                  { icon: Crown, title: "Grail Sneakers", desc: "Hand-picked rare pairs available only to top tiers" },
                ],
              },
              {
                key: "partner",
                kind: "partner_voucher",
                teasers: [
                  { icon: Ticket, title: "Lifestyle Partners", desc: "Cafés, barbers, fitness studios across Doha" },
                  { icon: Star, title: "Travel & Hospitality", desc: "Hotel upgrades, lounge passes & weekend escapes" },
                  { icon: Gem, title: "Luxury Experiences", desc: "Watches, fragrances & VIP events from our brand network" },
                ],
              },
            ].map(({ key, kind, teasers }) => (
              <TabsContent key={key} value={key} className="mt-6">
                {filtered(kind).length === 0 ? (
                  <div className="space-y-6">
                    {/* Hero teaser banner */}
                    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-background to-primary/10 p-6 md:p-8">
                      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
                      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
                      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center text-gold-foreground shadow-glow">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-1">
                              Dropping Soon
                            </p>
                            <h3 className="font-display text-xl md:text-2xl uppercase tracking-tight">
                              The vault is being stocked
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                              Keep stacking points — when redemption opens, members with the highest balances cop first.
                            </p>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/97433467115?text=${encodeURIComponent(
                            `Notify me when ${key === "store" ? "BM Store" : key === "gift" ? "Gift" : "Partner"} rewards go live`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-gold-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-glow whitespace-nowrap"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Notify me on WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Coming-soon teaser cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teasers.map((t, i) => {
                        const Icon = t.icon;
                        return (
                          <div
                            key={i}
                            className="group relative overflow-hidden rounded-2xl p-5 border border-border/60 bg-card hover:border-gold/40 transition-all"
                          >
                            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/5 blur-2xl group-hover:bg-gold/15 transition" />
                            <div className="relative flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/30 to-primary/20 flex items-center justify-center text-gold shrink-0">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm">{t.title}</h4>
                                  <Lock className="w-3 h-3 text-muted-foreground/60" />
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {t.desc}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-gold/80 font-bold mt-2">
                                  Coming soon
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered(kind).map((r) => {
                      const balance = account.points_balance ?? 0;
                      const canAfford = balance >= r.points_cost;
                      const pct = Math.min(100, Math.round((balance / r.points_cost) * 100));
                      const remaining = Math.max(0, r.points_cost - balance);
                      return (
                        <div
                          key={r.id}
                          className="rounded-2xl p-4 flex flex-col gap-3 border border-border/60 bg-card"
                        >
                          {r.image_url && (
                            <img
                              src={r.image_url}
                              alt={r.title}
                              className="w-full h-32 object-cover rounded-xl"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{r.title}</h3>
                            {r.loyalty_partners?.name && (
                              <p className="text-xs text-muted-foreground">
                                by {r.loyalty_partners.name}
                              </p>
                            )}
                            {r.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {r.description}
                              </p>
                            )}
                          </div>

                          {/* Progress to this reward */}
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">
                                {canAfford ? "Ready to redeem" : `${remaining.toLocaleString()} pts to go`}
                              </span>
                              <span className="font-bold">{pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all",
                                  canAfford
                                    ? "bg-[#4ade80]"
                                    : "bg-[linear-gradient(90deg,#ec4899,#4ade80)]",
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between">
                            <span className="font-display text-lg text-[#4ade80]">
                              {r.points_cost.toLocaleString()} pts
                            </span>
                            <Button
                              size="sm"
                              disabled={
                                !canAfford || !settings?.redemption_enabled || redeeming === r.id
                              }
                              onClick={() => handleRedeem(r.id)}
                            >
                              {redeeming === r.id ? "..." : canAfford ? "Redeem" : "Not enough"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* === History === */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-xl uppercase tracking-tight">
            Points history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const bonusEntries = (game.bonusHistory ?? []).map((b, i) => ({
              id: `bonus-${b.ts}-${i}`,
              description: b.label,
              type: "earn_bonus",
              delta: b.amount,
              created_at: new Date(b.ts).toISOString(),
              emoji: b.emoji,
              _bonus: true as const,
            }));
            const merged = [
              ...transactions.map((t) => ({ ...t, _bonus: false as const })),
              ...bonusEntries,
            ].sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            if (merged.length === 0) {
              return (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No activity yet.
                </p>
              );
            }
            return (
              <div className="divide-y divide-border/40">
                {merged.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.emoji && <span className="text-base">{t.emoji}</span>}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {t.description || t.type}
                          {t._bonus && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                              Bonus
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-display text-base ${
                        t.delta > 0 ? "text-[#4ade80]" : "text-muted-foreground"
                      }`}
                    >
                      {t.delta > 0 ? "+" : ""}
                      {t.delta.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
        {icon} {label}
      </div>
      <p className="text-2xl font-black font-mono">{value}</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix,
  icon,
  accent,
  gradient,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  accent?: string;
  gradient?: boolean;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-secondary/40 p-4 relative overflow-hidden"
      style={accent ? { borderColor: `${accent}55` } : undefined}
    >
      <div
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold mb-2"
        style={{ color: accent ?? undefined }}
      >
        {icon} {label}
      </div>
      <p
        className={cn(
          "text-3xl font-black font-mono leading-none",
          gradient &&
            "bg-[linear-gradient(135deg,#ec4899,#4ade80)] bg-clip-text text-transparent",
        )}
      >
        {value}
        {suffix && (
          <span className="text-sm font-bold ml-1 text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
