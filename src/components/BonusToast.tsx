import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { BonusEvent } from "@/lib/badges";
import { useAuth } from "@/contexts/AuthContext";

interface ActiveBonus extends BonusEvent {
  id: number;
}

export function BonusToast() {
  const { user } = useAuth();
  const [stack, setStack] = useState<ActiveBonus[]>([]);

  useEffect(() => {
    // Only listen for bonus events while the user is signed in — guests
    // should never see "+pts earned" notifications.
    if (!user) {
      setStack([]);
      return;
    }
    let nextId = 1;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<BonusEvent>).detail;
      if (!detail) return;
      const id = nextId++;
      setStack((s) => [...s, { ...detail, id }]);
      window.setTimeout(() => {
        setStack((s) => s.filter((b) => b.id !== id));
      }, 3800);
    };
    window.addEventListener("bmkicks:bonus-awarded", handler);
    return () => window.removeEventListener("bmkicks:bonus-awarded", handler);
  }, [user]);


  if (stack.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {stack.map((b) => (
        <div
          key={b.id}
          className="pointer-events-auto animate-scale-in"
          style={{ animation: "scale-in 0.25s ease-out, fade-out 0.4s ease-in 3.4s forwards" }}
        >
          <div className="relative overflow-hidden rounded-xl p-[2px] bg-[linear-gradient(135deg,#ec4899,#4ade80)] shadow-[0_0_40px_-5px_rgba(236,72,153,0.6)]">
            <div className="rounded-[10px] bg-card px-4 py-3 flex items-center gap-3 min-w-[240px]">
              <div className="relative">
                <div className="text-3xl animate-bounce">{b.emoji ?? "✨"}</div>
                <Sparkles className="absolute -top-1 -right-2 w-3 h-3 text-amber-300 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider font-bold text-[#4ade80]">
                  +{b.amount} pts earned
                </p>
                <p className="text-sm font-bold text-foreground truncate">{b.label}</p>
              </div>
            </div>
            {/* shimmer */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.15),transparent)] animate-[shimmer_1.5s_ease-in-out]" />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
