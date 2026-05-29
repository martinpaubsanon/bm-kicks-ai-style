export const STORAGE_KEY = "bmkicks-gamified-v1";

let activeGameUserId: string | null = null;

export function setActiveGameUserId(userId: string | null) {
  const previousUserId = activeGameUserId;
  activeGameUserId = userId;
  if (typeof window !== "undefined") {
    if (userId && !previousUserId) {
      const userKey = gameStorageKey(userId);
      const legacy = localStorage.getItem(STORAGE_KEY);
      if (userKey && legacy && !localStorage.getItem(userKey)) {
        localStorage.setItem(userKey, legacy);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    window.dispatchEvent(
      new CustomEvent("bmkicks:game-user-changed", { detail: { userId } })
    );
  }
}

function gameStorageKey(userId: string | null | undefined = activeGameUserId) {
  return userId ? `${STORAGE_KEY}:${userId}` : null;
}

export interface BonusHistoryEntry {
  amount: number;
  label: string;
  emoji?: string;
  ts: number;
}

export interface LocalGameState {
  productViews: number;
  lastVisit: string | null;
  lastVisitTs: number | null;
  streak: number;
  lastSpin: string | null;
  badges: string[];
  bonusPoints: number;
  viewedProductIds: string[];
  cartProductIds: string[];
  bonusHistory: BonusHistoryEntry[];
}

export const defaultGameState: LocalGameState = {
  productViews: 0,
  lastVisit: null,
  lastVisitTs: null,
  streak: 0,
  lastSpin: null,
  badges: [],
  bonusPoints: 0,
  viewedProductIds: [],
  cartProductIds: [],
  bonusHistory: [],
};

export function loadGameState(userId?: string | null): LocalGameState {
  if (typeof window === "undefined") return defaultGameState;
  try {
    const key = gameStorageKey(userId);
    if (!key) return defaultGameState;
    const raw = localStorage.getItem(key);
    if (!raw) return defaultGameState;
    return { ...defaultGameState, ...JSON.parse(raw) };
  } catch {
    return defaultGameState;
  }
}

export function saveGameState(s: LocalGameState, userId?: string | null) {
  try {
    const key = gameStorageKey(userId);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("bmkicks:game-updated", { detail: s }));
  } catch {}
}

export const todayStr = () => new Date().toISOString().slice(0, 10);

/* ---------------- Bonus events (animated toast) ---------------- */

export interface BonusEvent {
  amount: number;
  label: string;
  emoji?: string;
}

export function awardBonus(amount: number, label: string, emoji = "✨", userId?: string | null) {
  if (typeof window === "undefined" || amount <= 0) return;
  if (!gameStorageKey(userId)) return;
  const s = loadGameState(userId);
  const entry: BonusHistoryEntry = { amount, label, emoji, ts: Date.now() };
  const history = [entry, ...(s.bonusHistory ?? [])].slice(0, 100);
  s.bonusPoints = (s.bonusPoints ?? 0) + amount;
  s.bonusHistory = history;
  saveGameState(s, userId);
  window.dispatchEvent(
    new CustomEvent<BonusEvent>("bmkicks:bonus-awarded", {
      detail: { amount, label, emoji },
    })
  );
}

/* ---------------- Anti-exploit task helpers ---------------- */

/** Daily visit: +15 every 24h. Also updates streak. */
export function tryDailyVisit(points = 15, userId?: string | null) {
  if (typeof window === "undefined") return false;
  if (!gameStorageKey(userId)) return false;
  const s = loadGameState(userId);
  const now = Date.now();
  const last = s.lastVisitTs ?? 0;
  if (now - last < 24 * 60 * 60 * 1000) return false;

  const today = todayStr();
  let streak = s.streak;
  if (s.lastVisit) {
    const yest = new Date(now - 86400000).toISOString().slice(0, 10);
    streak = s.lastVisit === yest ? streak + 1 : 1;
  } else {
    streak = 1;
  }
  const badges = [...s.badges];
  if (!badges.includes("first_steps")) badges.push("first_steps");

  saveGameState({ ...s, lastVisit: today, lastVisitTs: now, streak, badges }, userId);
  awardBonus(points, "Daily visit", "🗓️", userId);
  return true;
}

/** View a unique product: +2, once per product id ever. */
export function tryViewProduct(productId: string, points = 2, userId?: string | null) {
  if (typeof window === "undefined" || !productId) return false;
  if (!gameStorageKey(userId)) return false;
  const s = loadGameState(userId);
  if (s.viewedProductIds.includes(productId)) return false;
  const viewedProductIds = [...s.viewedProductIds, productId];
  saveGameState({
    ...s,
    viewedProductIds,
    productViews: viewedProductIds.length,
  }, userId);
  awardBonus(points, "Viewed a product", "👀", userId);
  return true;
}

/** Add unique product to cart: +10, once per product id ever (can't exploit by re-adding). */
export function tryAddToCart(productId: string, points = 10, userId?: string | null) {
  if (typeof window === "undefined" || !productId) return false;
  if (!gameStorageKey(userId)) return false;
  const s = loadGameState(userId);
  if (s.cartProductIds.includes(productId)) return false;
  const cartProductIds = [...s.cartProductIds, productId];
  const badges = [...s.badges];
  if (!badges.includes("cart_starter")) badges.push("cart_starter");
  saveGameState({ ...s, cartProductIds, badges }, userId);
  awardBonus(points, "Added to bag", "🛒", userId);
  return true;
}

/** Compare earned-badge IDs vs persisted ones; award +50 for each newly earned. */
export function syncBadgeUnlocks(earnedIds: Iterable<string>, perBadge = 50, userId?: string | null) {
  if (typeof window === "undefined") return;
  if (!gameStorageKey(userId)) return;
  const s = loadGameState(userId);
  const known = new Set(s.badges);
  const newly: string[] = [];
  for (const id of earnedIds) if (!known.has(id)) newly.push(id);
  if (newly.length === 0) return;
  const badges = [...s.badges, ...newly];
  saveGameState({ ...s, badges }, userId);
  newly.forEach((id) => {
    const def = BADGES.find((b) => b.id === id);
    awardBonus(perBadge, `Badge unlocked: ${def?.label ?? id}`, def?.emoji ?? "🏆", userId);
  });
}

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
  /** Hidden until the user reaches Diamond tier (tierIndex >= 5). */
  secret?: boolean;
}

export const SECRET_BADGE_IDS = new Set(["mythic_ascended", "arcana_awakened"]);

export interface BadgeContext {
  totalSpent: number;
  orderCount: number;
  pointsBalance: number;
  lifetimePoints: number;
  /** Combined score = QAR spent + lifetime/bonus points. Drives tier and spend badges. */
  combinedScore: number;
  tierIndex: number;
  game: LocalGameState;
  referralsCompleted: number;
  /** Number of order items per product category (e.g. Basketball, Running, Lifestyle, Bags) */
  categoryCounts?: Record<string, number>;
  /** Number of order items per brand (e.g. Nike, Adidas, Jordan, Li Ning) */
  brandCounts?: Record<string, number>;
  /** Highest single-item price ever ordered (QAR) */
  maxItemPrice?: number;
  /** Highest single-order total (QAR) */
  maxOrderTotal?: number;
}

const cat = (c: BadgeContext, key: string) => c.categoryCounts?.[key] ?? 0;
const brnd = (c: BadgeContext, key: string) => c.brandCounts?.[key] ?? 0;

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
    check: (c) => c.orderCount >= 1 || c.game.cartProductIds.length >= 1,
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

  // Spend tiers (based on combined score in points)
  {
    id: "bronze_spender",
    label: "Bronze Spender",
    description: "Earn 500 points",
    emoji: "🥉",
    rarity: "common",
    category: "spend",
    check: (c) => c.combinedScore >= 500,
  },
  {
    id: "silver_spender",
    label: "Silver Spender",
    description: "Earn 2,000 points",
    emoji: "🥈",
    rarity: "rare",
    category: "spend",
    check: (c) => c.combinedScore >= 2000,
  },
  {
    id: "gold_spender",
    label: "Gold Spender",
    description: "Earn 5,000 points",
    emoji: "🥇",
    rarity: "epic",
    category: "spend",
    check: (c) => c.combinedScore >= 5000,
  },
  {
    id: "platinum_elite",
    label: "Platinum Elite",
    description: "Earn 10,000 points",
    emoji: "👑",
    rarity: "legendary",
    category: "elite",
    check: (c) => c.combinedScore >= 10000,
  },
  {
    id: "diamond_legend",
    label: "Diamond Legend",
    description: "Earn 20,000 points",
    emoji: "💠",
    rarity: "legendary",
    category: "elite",
    check: (c) => c.combinedScore >= 20000,
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

  // Category mastery
  {
    id: "hardwood_hero",
    label: "Hardwood Hero",
    description: "Order 3 Basketball pairs",
    emoji: "🏀",
    rarity: "rare",
    category: "engagement",
    check: (c) => cat(c, "Basketball") >= 3,
  },
  {
    id: "pavement_pounder",
    label: "Pavement Pounder",
    description: "Order 3 Running pairs",
    emoji: "🏃‍♂️",
    rarity: "rare",
    category: "engagement",
    check: (c) => cat(c, "Running") >= 3,
  },
  {
    id: "lifestyle_icon",
    label: "Lifestyle Icon",
    description: "Order 5 Lifestyle pairs",
    emoji: "🕶️",
    rarity: "epic",
    category: "engagement",
    check: (c) => cat(c, "Lifestyle") >= 5,
  },
  {
    id: "bag_boss",
    label: "Bag Boss",
    description: "Order 3 bags",
    emoji: "🎒",
    rarity: "rare",
    category: "engagement",
    check: (c) => cat(c, "Bags") >= 3,
  },
  {
    id: "category_curator",
    label: "Category Curator",
    description: "Order from every category",
    emoji: "🗂️",
    rarity: "epic",
    category: "engagement",
    check: (c) =>
      ["Basketball", "Running", "Lifestyle", "Bags"].every((k) => cat(c, k) >= 1),
  },

  // Brand loyalty
  {
    id: "swoosh_crew",
    label: "Swoosh Crew",
    description: "Order 5 Nike items",
    emoji: "✔️",
    rarity: "rare",
    category: "engagement",
    check: (c) => brnd(c, "Nike") >= 5,
  },
  {
    id: "three_stripes",
    label: "Three Stripes",
    description: "Order 3 Adidas items",
    emoji: "🟰",
    rarity: "rare",
    category: "engagement",
    check: (c) => brnd(c, "Adidas") >= 3,
  },
  {
    id: "jumpman",
    label: "Jumpman",
    description: "Order 3 Jordan items",
    emoji: "🪂",
    rarity: "epic",
    category: "engagement",
    check: (c) => brnd(c, "Jordan") >= 3,
  },
  {
    id: "li_ning_loyalist",
    label: "Li-Ning Loyalist",
    description: "Order 3 Li-Ning items",
    emoji: "🐉",
    rarity: "rare",
    category: "engagement",
    check: (c) => brnd(c, "Li Ning") >= 3,
  },
  {
    id: "brand_collector",
    label: "Brand Collector",
    description: "Own items from 4 different brands",
    emoji: "🏷️",
    rarity: "epic",
    category: "engagement",
    check: (c) =>
      ["Nike", "Adidas", "Jordan", "Li Ning"].filter((k) => brnd(c, k) >= 1).length >= 4,
  },

  // High roller / premium
  {
    id: "high_roller",
    label: "High Roller",
    description: "Order a premium item worth QAR 2,500+",
    emoji: "💸",
    rarity: "epic",
    category: "elite",
    check: (c) => (c.maxItemPrice ?? 0) >= 2500,
  },
  {
    id: "whale",
    label: "Whale",
    description: "Place a single order worth QAR 5,000+",
    emoji: "🐋",
    rarity: "legendary",
    category: "elite",
    check: (c) => (c.maxOrderTotal ?? 0) >= 5000,
  },
  {
    id: "grail_hunter",
    label: "Grail Hunter",
    description: "Score a single item worth QAR 5,000+",
    emoji: "🏆",
    rarity: "legendary",
    category: "elite",
    check: (c) => (c.maxItemPrice ?? 0) >= 5000,
  },

  // Secret tiers — only revealed once Diamond (tierIndex >= 5) is reached.
  // The UI masks label/description until then.
  {
    id: "mythic_ascended",
    label: "Mythic Ascended",
    description: "Earn 30,000 points",
    emoji: "🔮",
    rarity: "legendary",
    category: "elite",
    secret: true,
    check: (c) => c.combinedScore >= 30000,
  },
  {
    id: "arcana_awakened",
    label: "Arcana Awakened",
    description: "Earn 50,000 points",
    emoji: "🜲",
    rarity: "legendary",
    category: "elite",
    secret: true,
    check: (c) => c.combinedScore >= 50000,
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
