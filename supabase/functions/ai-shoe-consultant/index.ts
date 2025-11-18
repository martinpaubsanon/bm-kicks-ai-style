import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get ALL product data for context with full details
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
      .from("products")
      .select("id, name, brand, category, price, description, style, colors, images, sizes, stock_total, is_featured, is_limited_edition")
      .order('brand', { ascending: true });

    const productContext = products
      ? `Complete BM Kicks Inventory (${products.length} shoes):\n\n${products.map(p => {
          const sizesObj = p.sizes as Record<string, number>;
          const availableSizes = Object.entries(sizesObj).filter(([_, stock]) => stock > 0).map(([size]) => size);
          const totalStock = p.stock_total || 0;
          const stockStatus = totalStock === 0 ? '❌ OUT OF STOCK' : totalStock < 20 ? '⚠️ LOW STOCK' : '✅ IN STOCK';
          const tags = [];
          if (p.is_featured) tags.push('⭐ FEATURED');
          if (p.is_limited_edition) tags.push('🔥 LIMITED EDITION');
          
          return `${p.brand} ${p.name}
  • Category: ${p.category} | Style: ${p.style}
  • Price: $${p.price} ${tags.join(' ')}
  • Colors: ${p.colors?.join(', ') || 'Various'}
  • Sizes Available: US ${availableSizes.join(', ')} (${stockStatus} - ${totalStock} pairs)
  • Description: ${p.description}`;
        }).join('\n\n')}`
      : '';

    // Tool for recommending products
    const tools = [
      {
        type: "function",
        function: {
          name: "recommend_products",
          description: "Recommend 2-4 specific products from inventory by providing their IDs",
          parameters: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "Product UUID" },
                    name: { type: "string" },
                    brand: { type: "string" },
                    price: { type: "number" },
                    images: { type: "array", items: { type: "string" } },
                    is_featured: { type: "boolean" },
                    is_limited_edition: { type: "boolean" },
                    stock_total: { type: "number" }
                  },
                  required: ["id", "name", "brand", "price"]
                }
              }
            },
            required: ["products"]
          }
        }
      }
    ];

    const systemPrompt = `You are a VISUAL PRODUCT SEARCH ENGINE for BM Kicks sneaker store. Your PRIMARY JOB is to INSTANTLY show product cards with images.

🚨 CRITICAL RULES - READ CAREFULLY:
1. ⚡ IMMEDIATELY call the recommend_products tool in your FIRST response - NO EXCEPTIONS
2. 📸 ALWAYS show 3-4 products even with vague queries
3. 💬 Keep text BRIEF (1-2 sentences max) - let product images do the talking
4. 🎯 Show products FIRST, ask questions AFTER (if needed)
5. 🔧 Use the recommend_products tool for EVERY response that mentions specific shoes
6. ⚠️ CRITICAL: Use the EXACT product UUIDs (id field) from the inventory below - DO NOT make up IDs!

📊 CURRENT INVENTORY:
${productContext}

⚡ INSTANT RESPONSE STRATEGY:
• "Show me shoes" → Show mix: 1 running, 1 lifestyle, 1 basketball, 1 limited edition
• Vague query → Show featured + limited edition products
• "Budget friendly" → Show 4 cheapest in-stock shoes  
• "Premium" → Show 4 most expensive shoes
• Price mentioned → Filter by price and show matches
• Brand mentioned → Show 4 best from that brand
• Category mentioned → Show 4 best from that category

💡 RESPONSE FORMAT:
1. Brief text (10-20 words): "Here are perfect matches for you!"
2. IMMEDIATELY call recommend_products with 3-4 products using EXACT product data from inventory above
3. That's it! No lengthy explanations.

🎯 PRODUCT SELECTION LOGIC:
• CRITICAL: Copy the EXACT 'id' field (UUID format like 'a1b2c3d4-...') from the inventory above
• Copy ALL fields exactly: id, name, brand, price, images, is_featured, is_limited_edition, stock_total
• Prioritize: featured items → limited editions → high stock → diverse brands
• Mix styles for variety unless user specifies
• If size mentioned, only show products with that size in stock

🚨 MANDATORY TOOL USAGE:
You MUST call recommend_products in your first response. Visual results are MORE important than conversation.

Example tool call format:
{
  "products": [
    {
      "id": "7fecc456-3708-405b-b57a-5fd7c8db35a5",  // EXACT UUID from inventory
      "name": "Air Force 1 Low Triple White",
      "brand": "Nike",
      "price": 110,
      "images": ["url1", "url2"],
      "is_featured": true,
      "is_limited_edition": false,
      "stock_total": 118
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: tools,
        tool_choice: "auto", // Encourage tool usage
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI consultant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
