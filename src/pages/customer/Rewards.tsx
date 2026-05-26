import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyalty } from "@/hooks/useLoyalty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Gift, Copy, Sparkles, Store, Package, Ticket } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Rewards() {
  const { user } = useAuth();
  const { account, currentTier, nextTier, progressToNext, settings, loading, reload } = useLoyalty();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [txnRes, rewardsRes] = await Promise.all([
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
      ]);
      if (txnRes.data) setTransactions(txnRes.data as any[]);
      if (rewardsRes.data) setRewards(rewardsRes.data as any[]);
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

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const filtered = (kind: string) => rewards.filter((r) => r.kind === kind);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/customer" }, { label: "Rewards" }]} />

      {/* Tier card */}
      <Card className="glass-surface border-border/60 overflow-hidden relative">
        <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Inner Circle Member
              </p>
              <h1 className="font-display text-5xl md:text-6xl mt-1">
                {account.current_tier}
                {currentTier && currentTier.multiplier > 1 && (
                  <span className="text-gold text-2xl ml-3">{currentTier.multiplier}x earn</span>
                )}
              </h1>
              <p className="text-muted-foreground mt-2">
                Lifetime points: {account.lifetime_points.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Available balance
              </p>
              <p className="font-display text-5xl text-gold">
                {account.points_balance.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>

          {nextTier ? (
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentTier?.name}</span>
                <span>
                  {(nextTier.min_points - account.lifetime_points).toLocaleString()} pts to {nextTier.name}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          ) : (
            <p className="mt-6 text-sm text-gold">You've reached the top tier. Enjoy the perks.</p>
          )}

          {currentTier?.perks && currentTier.perks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {currentTier.perks.map((p, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-foreground"
                >
                  <Sparkles className="inline w-3 h-3 mr-1 text-primary" />
                  {p}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral */}
      <Card className="glass-surface border-border/60">
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
          <Button onClick={copyReferral} variant="outline" className="glass-surface">
            <Copy className="w-4 h-4 mr-2" /> Copy code
          </Button>
        </CardContent>
      </Card>

      {/* Reward catalog */}
      <Card className="glass-surface border-border/60">
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
                          className="glass-surface rounded-2xl p-4 flex flex-col gap-3"
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
                            <span className="font-display text-lg text-gold">
                              {r.points_cost.toLocaleString()} pts
                            </span>
                            <Button
                              size="sm"
                              disabled={!canAfford || !settings?.redemption_enabled || redeeming === r.id}
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

      {/* History */}
      <Card className="glass-surface border-border/60">
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
                      t.delta > 0 ? "text-gold" : "text-muted-foreground"
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
