export const STORAGE_KEY = "bmkicks-gamified-v1";

export interface LocalGameState {
  productViews: number;
  lastVisit: string | null;
  streak: number;
  lastSpin: string | null;
  badges: string[];
  bonusPoints: number;
}

export const defaultGameState: LocalGameState = {
  productViews: 0,
  lastVisit: null,
  streak: 0,
  lastSpin: null,
  badges: [],
  bonusPoints: 0,
};

export function loadGameState(): LocalGameState {
  if (typeof window === "undefined") return defaultGameState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGameState;
    return { ...defaultGameState, ...JSON.parse(raw) };
  } catch {
    return defaultGameState;
  }
}

export function saveGameState(s: LocalGameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export const todayStr = () => new Date().toISOString().slice(0, 10);

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface BadgeDef {
  id: string;
  label: string;
  description: string;
  emoji: string;
  rarity: BadgeRarity;
  category: "journey" | "spend" | "engagement" | "social" | "elite";
  /** Auto-evaluator. Returns true if this should be earned given current data. */
  check?: (ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  totalSpent: number;
  orderCount: number;
  pointsBalance: number;
  lifetimePoints: number;
  tierIndex: number;
  game: LocalGameState;
  referralsCompleted: number;
}

export const BADGES: BadgeDef[] = [
  // Journey
  {
    id: "first_steps",
    label: "First Steps",
    description: "Joined the BmKicks crew",
    emoji: "👟",
    rarity: "common",
    category: "journey",
    check: () => true,
  },
  {
    id: "browser",
    label: "Window Shopper",
    description: "View 10 products",
    emoji: "👀",
    rarity: "common",
    category: "engagement",
    check: (c) => c.game.productViews >= 10,
  },
  {
    id: "explorer",
    label: "Explorer",
    description: "View 50 products",
    emoji: "🧭",
    rarity: "rare",
    category: "engagement",
    check: (c) => c.game.productViews >= 50,
  },
  {
    id: "cart_starter",
    label: "Cart Starter",
    description: "Place your first order",
    emoji: "🛒",
    rarity: "common",
    category: "journey",
    check: (c) => c.orderCount >= 1,
  },
  {
    id: "repeat_buyer",
    label: "Repeat Buyer",
    description: "Place 3 orders",
    emoji: "📦",
    rarity: "rare",
    category: "journey",
    check: (c) => c.orderCount >= 3,
  },
  {
    id: "loyal_customer",
    label: "Loyal Customer",
    description: "Place 10 orders",
    emoji: "💎",
    rarity: "epic",
    category: "journey",
    check: (c) => c.orderCount >= 10,
  },

  // Spend tiers
  {
    id: "bronze_spender",
    label: "Bronze Spender",
    description: "Spend QAR 500",
    emoji: "🥉",
    rarity: "common",
    category: "spend",
    check: (c) => c.totalSpent >= 500,
  },
  {
    id: "silver_spender",
    label: "Silver Spender",
    description: "Spend QAR 2,000",
    emoji: "🥈",
    rarity: "rare",
    category: "spend",
    check: (c) => c.totalSpent >= 2000,
  },
  {
    id: "gold_spender",
    label: "Gold Spender",
    description: "Spend QAR 5,000",
    emoji: "🥇",
    rarity: "epic",
    category: "spend",
    check: (c) => c.totalSpent >= 5000,
  },
  {
    id: "platinum_elite",
    label: "Platinum Elite",
    description: "Spend QAR 10,000",
    emoji: "👑",
    rarity: "legendary",
    category: "elite",
    check: (c) => c.totalSpent >= 10000,
  },
  {
    id: "diamond_legend",
    label: "Diamond Legend",
    description: "Spend QAR 25,000",
    emoji: "💠",
    rarity: "legendary",
    category: "elite",
    check: (c) => c.totalSpent >= 25000,
  },

  // Engagement
  {
    id: "spinner",
    label: "Lucky Spinner",
    description: "Spin the daily wheel",
    emoji: "🎰",
    rarity: "common",
    category: "engagement",
  },
  {
    id: "streaker",
    label: "On a Streak",
    description: "Visit 3 days in a row",
    emoji: "⚡",
    rarity: "rare",
    category: "engagement",
    check: (c) => c.game.streak >= 3,
  },
  {
    id: "marathon",
    label: "Marathon",
    description: "Visit 7 days in a row",
    emoji: "🔥",
    rarity: "epic",
    category: "engagement",
    check: (c) => c.game.streak >= 7,
  },
  {
    id: "hypebeast",
    label: "Hypebeast",
    description: "Earn 5,000 lifetime points",
    emoji: "🚀",
    rarity: "epic",
    category: "engagement",
    check: (c) => c.lifetimePoints >= 5000,
  },

  // Social
  {
    id: "ambassador",
    label: "Ambassador",
    description: "Refer your first friend",
    emoji: "🤝",
    rarity: "rare",
    category: "social",
    check: (c) => c.referralsCompleted >= 1,
  },
  {
    id: "influencer",
    label: "Influencer",
    description: "Refer 5 friends",
    emoji: "📣",
    rarity: "legendary",
    category: "social",
    check: (c) => c.referralsCompleted >= 5,
  },
];

export const RARITY_STYLE: Record<
  BadgeRarity,
  { ring: string; glow: string; label: string; chip: string }
> = {
  common: {
    ring: "border-zinc-500",
    glow: "shadow-[0_0_20px_-10px_rgba(161,161,170,0.6)]",
    label: "text-zinc-400",
    chip: "bg-zinc-500/15 text-zinc-300",
  },
  rare: {
    ring: "border-sky-400",
    glow: "shadow-[0_0_25px_-8px_rgba(56,189,248,0.7)]",
    label: "text-sky-300",
    chip: "bg-sky-500/15 text-sky-300",
  },
  epic: {
    ring: "border-fuchsia-400",
    glow: "shadow-[0_0_30px_-6px_rgba(232,121,249,0.8)]",
    label: "text-fuchsia-300",
    chip: "bg-fuchsia-500/15 text-fuchsia-300",
  },
  legendary: {
    ring: "border-amber-400",
    glow: "shadow-[0_0_35px_-4px_rgba(251,191,36,0.9)]",
    label: "text-amber-300",
    chip: "bg-amber-500/15 text-amber-300",
  },
};

/** Merge auto-checked + locally-stored badge IDs into a Set of earned IDs. */
export function computeEarnedBadges(ctx: BadgeContext): Set<string> {
  const earned = new Set<string>(ctx.game.badges);
  for (const b of BADGES) {
    if (b.check && b.check(ctx)) earned.add(b.id);
  }
  return earned;
}
