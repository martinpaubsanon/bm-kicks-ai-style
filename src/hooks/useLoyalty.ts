import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { loadGameState } from "@/lib/badges";

export interface LoyaltyAccount {
  user_id: string;
  points_balance: number;
  lifetime_points: number;
  current_tier: string;
  referral_code: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  multiplier: number;
  color_hex: string | null;
  perks: string[];
  sort_order: number;
}

export interface LoyaltySettings {
  points_per_qar: number;
  points_per_order: number;
  signup_bonus: number;
  referral_bonus: number;
  redemption_enabled: boolean;
}

export function useLoyalty() {
  const { user } = useAuth();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [paidSpent, setPaidSpent] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [tiersRes, settingsRes] = await Promise.all([
      supabase.from("loyalty_tiers" as any).select("*").order("sort_order"),
      supabase.from("loyalty_settings" as any).select("*").limit(1).maybeSingle(),
    ]);
    if (tiersRes.data) {
      setTiers(
        (tiersRes.data as any[]).map((t) => ({
          ...t,
          perks: Array.isArray(t.perks) ? t.perks : [],
        }))
      );
    }
    if (settingsRes.data) setSettings(settingsRes.data as any);

    if (user) {
      const [accRes, ordersRes] = await Promise.all([
        supabase.from("loyalty_accounts" as any).select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("total").eq("user_id", user.id).eq("payment_status", "paid"),
      ]);
      if (accRes.data) setAccount(accRes.data as any);
      const spent = (ordersRes.data ?? []).reduce(
        (acc: number, o: any) => acc + Number(o.total ?? 0),
        0
      );
      setPaidSpent(spent);
    } else {
      setAccount(null);
      setPaidSpent(0);
    }
    setBonusPoints(loadGameState().bonusPoints ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-read local bonus points whenever the game state updates
  useEffect(() => {
    const onUpdate = () => setBonusPoints(loadGameState().bonusPoints ?? 0);
    window.addEventListener("bmkicks:game-updated", onUpdate);
    window.addEventListener("bmkicks:bonus-awarded", onUpdate);
    return () => {
      window.removeEventListener("bmkicks:game-updated", onUpdate);
      window.removeEventListener("bmkicks:bonus-awarded", onUpdate);
    };
  }, []);

  // Combined score drives tier: paid spend + lifetime points + local bonus points
  const combinedScore =
    Math.floor(paidSpent) + (account?.lifetime_points ?? 0) + bonusPoints;

  // Displayed points balance includes bonus points
  const displayPoints = (account?.points_balance ?? 0) + bonusPoints;

  const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points);
  const currentTier =
    [...sortedTiers].reverse().find((t) => combinedScore >= t.min_points) ||
    sortedTiers[0] ||
    null;

  const nextTier =
    sortedTiers.find((t) => t.min_points > combinedScore) || null;

  const progressToNext = (() => {
    if (!nextTier || !currentTier) return 100;
    const span = nextTier.min_points - currentTier.min_points;
    if (span <= 0) return 100;
    const done = combinedScore - currentTier.min_points;
    return Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  })();

  return {
    account,
    tiers,
    settings,
    currentTier,
    nextTier,
    progressToNext,
    combinedScore,
    displayPoints,
    bonusPoints,
    paidSpent,
    loading,
    reload: load,
  };
}

export function estimatePointsForOrder(
  totalQar: number,
  settings: LoyaltySettings | null,
  multiplier = 1
): number {
  if (!settings) return 0;
  const base =
    Math.floor(totalQar * (settings.points_per_qar ?? 1)) +
    (settings.points_per_order ?? 0);
  return Math.max(0, Math.floor(base * (multiplier ?? 1)));
}
