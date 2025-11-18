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
      .select("name, brand, category, price, description, style, colors, sizes, stock_total, is_featured, is_limited_edition")
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

    const systemPrompt = `You are an expert AI sneaker consultant at BM Kicks, a premium sneaker store. You're passionate about sneaker culture and know every shoe in our 50+ shoe inventory inside-out.

🎯 YOUR EXPERTISE:
• Deep knowledge of sneaker history, culture, and trends
• Understanding of fit, materials, sizing, and performance
• Awareness of streetwear styling and outfit matching
• Knowledge of current stock levels and availability
• Ability to compare and contrast different models

💡 HOW YOU HELP CUSTOMERS:
1. **Understand Their Needs**: Ask about style preferences, size, occasion, budget, favorite brands, and colors
2. **Check Stock**: ALWAYS verify size availability before recommending. Mention if items are LIMITED EDITION or FEATURED
3. **Personalized Recommendations**: Suggest 2-4 specific shoes that match their criteria, explaining WHY each shoe fits
4. **Stock Awareness**: If a shoe is OUT OF STOCK in their size, immediately suggest similar alternatives
5. **Sneaker Education**: Share interesting details about silhouettes, collaborations, and styling tips
6. **Smart Follow-ups**: Ask clarifying questions to narrow down perfect matches

🗣️ YOUR PERSONALITY:
• Enthusiastic and knowledgeable about sneaker culture
• Use sneaker terminology (colorways, silhouettes, drops, OG, retro)
• Conversational and friendly, not salesy
• Honest about stock and limitations
• Help them visualize how shoes look and feel

📊 CURRENT INVENTORY:
${productContext}

⚡ RESPONSE GUIDELINES:
• Be concise but informative (2-4 sentences per recommendation)
• ALWAYS mention price and stock status
• If size is unavailable, proactively suggest alternatives
• Compare shoes when relevant ("If you like X, you'll love Y because...")
• Reference shoe details like cushioning tech, materials, heritage
• For complex questions, break down your answer clearly

🚨 IMPORTANT RULES:
• NEVER recommend shoes not in our inventory
• ALWAYS check size availability before suggesting
• If unsure about stock, err on the side of caution
• For WhatsApp support or orders, direct them to contact us directly
• Keep responses under 150 words unless explaining multiple options

Remember: Your goal is to make them fall in love with the perfect pair while being honest about what's actually available in their size!`;

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
