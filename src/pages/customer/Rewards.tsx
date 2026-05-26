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
  { name: "Rookie",   min: 0,     icon: Star,   color: "#cbd5e1" },
  { name: "Bronze",   min: 500,   icon: Medal,  color: "#d97706" },
  { name: "Silver",   min: 2000,  icon: Award,  color: "#d4d4d8" },
  { name: "Gold",     min: 5000,  icon: Trophy, color: "#facc15" },
  { name: "Platinum", min: 10000, icon: Crown,  color: "#67e8f9" },
  { name: "Diamond",  min: 25000, icon: Gem,    color: "#e879f9" },
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

const STORAGE_KEY = "bmkicks-gamified-v1";
const todayStr = () => new Date().toISOString().slice(0, 10);

interface LocalGameState {
  productViews: number;
  lastVisit: string | null;
  streak: number;
  lastSpin: string | null;
  badges: string[];
  bonusPoints: number; // local-only (visual)
}

const defaultState: LocalGameState = {
  productViews: 0,
  lastVisit: null,
  streak: 0,
  lastSpin: null,
  badges: [],
  bonusPoints: 0,
};

function loadState(): LocalGameState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveState(s: LocalGameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export default function Rewards() {
  const { user } = useAuth();
  const { account, settings, loading, reload } = useLoyalty();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  const [game, setGame] = useState<LocalGameState>(loadState);
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);

  // record visit + streak on mount
  useEffect(() => {
    setGame((prev) => {
      const today = todayStr();
      if (prev.lastVisit === today) return prev;
      let streak = prev.streak;
      if (prev.lastVisit) {
        const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        streak = prev.lastVisit === yest ? streak + 1 : 1;
      } else {
        streak = 1;
      }
      const badges = [...prev.badges];
      if (!badges.includes("first_steps")) badges.push("first_steps");
      if (streak >= 3 && !badges.includes("streaker")) badges.push("streaker");
      const next = { ...prev, lastVisit: today, streak, badges };
      saveState(next);
      return next;
    });
  }, []);

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

  const canSpin = game.lastSpin !== todayStr();

  const handleSpin = useCallback(() => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    const rewards = [1, 5, 10, 15, 20, 25, 35, 50];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const turns = 5 + Math.random() * 3;
    setSpinAngle((a) => a + turns * 360);
    setTimeout(() => {
      setSpinning(false);
      setGame((prev) => {
        const badges = [...prev.badges];
        if (!badges.includes("spinner")) badges.push("spinner");
        const next = {
          ...prev,
          lastSpin: todayStr(),
          badges,
          bonusPoints: prev.bonusPoints + reward,
        };
        saveState(next);
        return next;
      });
      toast({ title: `🎉 +${reward} bonus points!`, description: "Daily spin reward" });
    }, 3000);
  }, [canSpin, spinning]);

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const filtered = (kind: string) => rewards.filter((r) => r.kind === kind);

  // Spend-based tier calculation (matches dashboard)
  const currentLevelIndex = SPEND_TIERS.reduce(
    (acc, t, i) => (totalSpent >= t.min ? i : acc),
    0,
  );
  const currentSpendTier = SPEND_TIERS[currentLevelIndex];
  const nextSpendTier = SPEND_TIERS[currentLevelIndex + 1] ?? null;
  const spendProgress = nextSpendTier
    ? Math.min(
        100,
        ((totalSpent - currentSpendTier.min) /
          (nextSpendTier.min - currentSpendTier.min)) *
          100,
      )
    : 100;
  const remainingToNext = nextSpendTier ? Math.max(0, nextSpendTier.min - totalSpent) : 0;

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
                  {nextSpendTier.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(remainingToNext)} away
                </p>
              </div>
            ) : (
              <p className="text-[#4ade80] font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Max tier — Legend
              </p>
            )}
          </div>

          {/* Separate + combined stat tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <StatTile
              label="Points balance"
              value={(account.points_balance ?? 0).toLocaleString()}
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
              value={(
                (account.points_balance ?? 0) + Math.round(totalSpent)
              ).toLocaleString()}
              suffix="XP"
              gradient
              icon={<Flame className="w-4 h-4" />}
            />
          </div>

          {/* Full multi-tier journey progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">
                Crew Journey
              </span>
              <span className="font-mono">
                {formatCurrency(totalSpent)} /{" "}
                {formatCurrency(SPEND_TIERS[SPEND_TIERS.length - 1].min)}
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#ec4899,#4ade80)] transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (totalSpent / SPEND_TIERS[SPEND_TIERS.length - 1].min) * 100,
                  )}%`,
                }}
              />
              {/* tier ticks */}
              {SPEND_TIERS.map((t, i) => {
                const pct = (t.min / SPEND_TIERS[SPEND_TIERS.length - 1].min) * 100;
                const reached = totalSpent >= t.min;
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
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              {SPEND_TIERS.map((t, i) => (
                <div
                  key={t.name}
                  className={cn(
                    "flex flex-col items-center gap-0.5",
                    totalSpent >= t.min ? "text-foreground" : "",
                    i === currentLevelIndex && "text-[#4ade80] font-bold",
                  )}
                >
                  <span className="uppercase tracking-wider">{t.name}</span>
                  <span className="font-mono">{formatCurrency(t.min)}</span>
                </div>
              ))}
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
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {unlocked ? (
                        <TierIcon className="w-5 h-5" style={{ color: tier.color }} />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: unlocked ? tier.color : undefined }}
                        >
                          {tier.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(tier.min)}+ spent
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
              ["Complete checkout", "+1 pt per QAR spent"],
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
              { key: "store", kind: "store_discount" },
              { key: "gift", kind: "physical_gift" },
              { key: "partner", kind: "partner_voucher" },
            ].map(({ key, kind }) => (
              <TabsContent key={key} value={key} className="mt-6">
                {filtered(kind).length === 0 ? (
                  <p className="text-center text-muted-foreground py-12 text-sm">
                    No rewards in this category yet. Check back soon.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered(kind).map((r) => {
                      const canAfford = account.points_balance >= r.points_cost;
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
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
          ) : (
            <div className="divide-y divide-border/40">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{t.description || t.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
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
          )}
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
