import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

interface LoyaltySettings {
  id?: string;
  points_per_qar: number;
  points_per_order: number;
  signup_bonus: number;
  referral_bonus: number;
  welcome_bonus_points: number;
  birthday_bonus_points: number;
  redemption_enabled: boolean;
}

const DEFAULTS: LoyaltySettings = {
  points_per_qar: 1,
  points_per_order: 50,
  signup_bonus: 250,
  referral_bonus: 500,
  welcome_bonus_points: 0,
  birthday_bonus_points: 0,
  redemption_enabled: false,
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState<LoyaltySettings>(DEFAULTS);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("loyalty_settings" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (data) setS({ ...DEFAULTS, ...(data as any) });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload: any = {
      points_per_qar: Number(s.points_per_qar) || 0,
      points_per_order: Number(s.points_per_order) || 0,
      signup_bonus: Number(s.signup_bonus) || 0,
      referral_bonus: Number(s.referral_bonus) || 0,
      welcome_bonus_points: Number(s.welcome_bonus_points) || 0,
      birthday_bonus_points: Number(s.birthday_bonus_points) || 0,
      redemption_enabled: !!s.redemption_enabled,
    };
    const query = s.id
      ? supabase.from("loyalty_settings" as any).update(payload).eq("id", s.id)
      : supabase.from("loyalty_settings" as any).insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Loyalty settings updated" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store and loyalty program</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Loyalty Program
          </CardTitle>
          <CardDescription>
            Earn rates, signup/referral bonuses, and special-occasion rewards. Set a value to 0 to disable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Points per QAR"
                  hint="Base earn rate. 1 = 1 point per QAR spent."
                  value={s.points_per_qar}
                  onChange={(v) => setS({ ...s, points_per_qar: v })}
                  step="0.1"
                />
                <Field
                  label="Points per order"
                  hint="Flat bonus added to every paid order."
                  value={s.points_per_order}
                  onChange={(v) => setS({ ...s, points_per_order: v })}
                />
                <Field
                  label="Signup bonus"
                  hint="Awarded once on account creation."
                  value={s.signup_bonus}
                  onChange={(v) => setS({ ...s, signup_bonus: v })}
                />
                <Field
                  label="Referral bonus"
                  hint="Awarded to referrer when invited friend's first order is paid."
                  value={s.referral_bonus}
                  onChange={(v) => setS({ ...s, referral_bonus: v })}
                />
                <Field
                  label="Welcome bonus 🎁"
                  hint="Extra points the first time a customer's order is marked paid."
                  value={s.welcome_bonus_points}
                  onChange={(v) => setS({ ...s, welcome_bonus_points: v })}
                />
                <Field
                  label="Birthday bonus 🎂"
                  hint="Auto-awarded every year on the customer's birthday (06:00 Doha)."
                  value={s.birthday_bonus_points}
                  onChange={(v) => setS({ ...s, birthday_bonus_points: v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="redemption">Reward redemptions open</Label>
                  <p className="text-sm text-muted-foreground">
                    When off, customers see the catalog but can't redeem.
                  </p>
                </div>
                <Switch
                  id="redemption"
                  checked={s.redemption_enabled}
                  onCheckedChange={(v) => setS({ ...s, redemption_enabled: v })}
                />
              </div>

              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save loyalty settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Admin roles are managed directly in the backend. Contact your database administrator to add or remove admins.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  step,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        step={step ?? "1"}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
