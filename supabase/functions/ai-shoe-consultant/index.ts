import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Get the last user message
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m: any) => m.role === "user")?.content ?? "";
    
    const text = lastUserMessage.toLowerCase().trim();
    console.log("🔍 Processing query:", text);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse user intent with enhanced brand and category detection
    let brandFilter: string | undefined;
    if (text.includes("nike")) brandFilter = "Nike";
    if (text.includes("adidas")) brandFilter = "Adidas";
    if (text.includes("new balance")) brandFilter = "New Balance";
    if (text.includes("jordan")) brandFilter = "Jordan";
    if (text.includes("puma")) brandFilter = "Puma";
    if (text.includes("under armour")) brandFilter = "Under Armour";
    if (text.includes("brooks")) brandFilter = "Brooks";
    if (text.includes("asics")) brandFilter = "ASICS";
    if (text.includes("reebok")) brandFilter = "Reebok";
    if (text.includes("vans")) brandFilter = "Vans";
    if (text.includes("converse")) brandFilter = "Converse";
    if (text.includes("on running") || text.includes(" on ")) brandFilter = "On";

    let maxPrice: number | undefined;
    const underMatch = text.match(/under\s*\$?(\d+)/);
    if (underMatch) maxPrice = Number(underMatch[1]);

    let categoryFilter: string | undefined;
    if (text.includes("running") || text.includes("run") || text.includes("marathon") || text.includes("jogging")) 
      categoryFilter = "Running";
    if (text.includes("basketball") || text.includes("ball") || text.includes("court") || text.includes("hoops")) 
      categoryFilter = "Basketball";
    if (text.includes("lifestyle") || text.includes("casual") || text.includes("daily") || text.includes("street")) 
      categoryFilter = "Lifestyle";
    if (text.includes("training") || text.includes("gym") || text.includes("workout") || text.includes("crossfit")) 
      categoryFilter = "Training";
    if (text.includes("skateboard") || text.includes("skate") || text.includes(" sb ")) 
      categoryFilter = "Skateboarding";
    
    let limitedEdition = false;
    if (text.includes("limited")) limitedEdition = true;
    
    let featured = false;
    if (text.includes("featured") || text.includes("premium") || text.includes("top") || text.includes("popular")) featured = true;

    console.log("📊 Filters:", { brandFilter, maxPrice, categoryFilter, limitedEdition, featured });

    // Build query
    let query = supabase
      .from("products")
      .select("id, name, brand, price, images, is_featured, is_limited_edition, stock_total, category")
      .gt("stock_total", 0)
      .order("stock_total", { ascending: false })
      .limit(4);

    if (brandFilter) query = query.eq("brand", brandFilter);
    if (categoryFilter) query = query.eq("category", categoryFilter);
    if (maxPrice) query = query.lte("price", maxPrice);
    if (limitedEdition) query = query.eq("is_limited_edition", true);
    if (featured) query = query.eq("is_featured", true);

    const { data: products, error } = await query;

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("✅ Found products:", products?.length || 0);

    // Fallback if no products found
    let finalProducts = products || [];
    if (finalProducts.length === 0) {
      console.log("⚠️ No products found with filters, falling back to featured");
      const { data: fallbackProducts } = await supabase
        .from("products")
        .select("id, name, brand, price, images, is_featured, is_limited_edition, stock_total, category")
        .gt("stock_total", 0)
        .eq("is_featured", true)
        .order("stock_total", { ascending: false })
        .limit(4);
      finalProducts = fallbackProducts || [];
    }

    // Generate helper text
    let helperText = "Here are some great options for you!";

    if (brandFilter && maxPrice) {
      helperText = `Here are ${brandFilter} sneakers under $${maxPrice}:`;
    } else if (brandFilter && categoryFilter) {
      helperText = `Here are ${brandFilter} ${categoryFilter.toLowerCase()} shoes:`;
    } else if (brandFilter) {
      helperText = `Here are some popular ${brandFilter} sneakers:`;
    } else if (maxPrice) {
      helperText = `Here are some options under $${maxPrice}:`;
    } else if (categoryFilter) {
      helperText = `Here are top ${categoryFilter.toLowerCase()} shoes:`;
    } else if (limitedEdition) {
      helperText = `Here are our limited edition sneakers:`;
    } else if (featured) {
      helperText = `Here are our featured premium picks:`;
    }

    console.log("💬 Response text:", helperText);

    return new Response(
      JSON.stringify({
        text: helperText,
        products: finalProducts,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("AI consultant error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        text: "Sorry, I encountered an error. Please try again.",
        products: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
