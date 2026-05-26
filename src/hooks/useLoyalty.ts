import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
      const { data } = await supabase
        .from("loyalty_accounts" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setAccount(data as any);
    } else {
      setAccount(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const nextTier = (() => {
    if (!account) return null;
    return (
      tiers.find((t) => t.min_points > account.lifetime_points) || null
    );
  })();

  const currentTier = tiers.find((t) => t.name === account?.current_tier) || tiers[0] || null;

  const progressToNext = (() => {
    if (!account || !nextTier || !currentTier) return 100;
    const span = nextTier.min_points - currentTier.min_points;
    if (span <= 0) return 100;
    const done = account.lifetime_points - currentTier.min_points;
    return Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  })();

  return {
    account,
    tiers,
    settings,
    currentTier,
    nextTier,
    progressToNext,
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
