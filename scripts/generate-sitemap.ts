import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://bmkicks.shop";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/auth", changefreq: "monthly", priority: "0.3" },
  { path: "/checkout", changefreq: "monthly", priority: "0.5" },
  { path: "/customer/order-success", changefreq: "monthly", priority: "0.3" },
  { path: "/privacy-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/terms-of-service", changefreq: "monthly", priority: "0.3" },
  { path: "/return-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/shipping-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/cookie-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/authenticity-guarantee", changefreq: "monthly", priority: "0.3" },
  { path: "/brand-disclaimer", changefreq: "monthly", priority: "0.3" },
];

async function fetchProducts(): Promise<SitemapEntry[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://optuhyfoqurwgadcdqnb.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdHVoeWZvcXVyd2dhZGNkcW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDg3NTMsImV4cCI6MjA3OTAyNDc1M30.HiPiJavmiFB93SFxshRK0vQJF_QxmOxh14_a4LNhl3w";

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, updated_at");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (products || []).map((p) => ({
    path: `/product/${p.id}`,
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
    changefreq: "weekly",
    priority: "0.8",
  }));
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const productEntries = await fetchProducts();
  const allEntries = [...staticEntries, ...productEntries];
  const sitemap = generateSitemap(allEntries);

  writeFileSync(resolve("public/sitemap.xml"), sitemap);
  console.log(`sitemap.xml written (${allEntries.length} entries)`);
}

main();
