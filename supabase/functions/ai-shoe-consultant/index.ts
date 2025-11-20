import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().trim().min(1).max(500)
    })
  ).min(1).max(20)
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await req.json();
    const validationResult = messageSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Input validation failed:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input format",
          text: "Sorry, your message format is invalid. Please try again with a shorter message.",
          products: []
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { messages } = validationResult.data;
    console.log("🔍 Processing AI shoe consultation with", messages.length, "messages");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Lovable AI key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Fetch all available products for AI context
    const { data: allProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, brand, price, category, is_featured, is_limited_edition, stock_total, description")
      .gt("stock_total", 0);

    if (productsError) {
      console.error("Error fetching products - Status:", productsError.code);
      throw productsError;
    }

    console.log("📦 Loaded", allProducts?.length || 0, "products for AI context");

    // Create intelligent system prompt with product context
    const systemPrompt = `You are an expert sneaker consultant for BM Kicks. Your job is to recommend the perfect shoes based on customer needs.

AVAILABLE PRODUCTS:
${JSON.stringify(allProducts, null, 2)}

INSTRUCTIONS:
- Understand the customer's needs (activity, style, budget, brand preference)
- Recommend 2-4 products that best match their needs
- Explain WHY each shoe is a good match in a friendly, conversational way
- Be helpful and enthusiastic about sneakers
- If they ask about specific brands/categories, focus on those
- If budget is mentioned, respect it strictly
- Highlight limited edition or featured items when relevant
- Keep explanations concise but informative (2-3 sentences max)

RESPONSE FORMAT:
Use the recommend_shoes tool to return your recommendations with a friendly explanation.`;

    // Call Lovable AI with tool calling
    console.log("🤖 Calling Lovable AI...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_shoes",
            description: "Recommend shoes to the customer with explanations",
            parameters: {
              type: "object",
              properties: {
                explanation: {
                  type: "string",
                  description: "Friendly explanation of why these shoes match their needs (2-3 sentences)"
                },
                product_ids: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of product IDs to recommend (2-4 products)"
                }
              },
              required: ["explanation", "product_ids"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "recommend_shoes" } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error - Status:", aiResponse.status);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded",
          text: "I'm getting too many requests right now. Please try again in a moment! 😊",
          products: []
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (aiResponse.status === 402) {
        // Fallback to featured products
        const { data: fallbackProducts } = await supabase
          .from("products")
          .select("id, name, brand, price, images, is_featured, is_limited_edition, stock_total, category")
          .gt("stock_total", 0)
          .eq("is_featured", true)
          .limit(4);
        
        return new Response(JSON.stringify({ 
          error: "Payment required",
          text: "AI service temporarily unavailable. Here are our featured products instead! 😊",
          products: fallbackProducts || []
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("🎯 AI response received");
    
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in AI response");
      throw new Error("No tool call in AI response");
    }

    const recommendation = JSON.parse(toolCall.function.arguments);
    const productIds = recommendation.product_ids || [];
    const explanation = recommendation.explanation || "Here are some great options for you!";

    console.log("✅ AI recommended:", productIds.length, "products");

    // Fetch the recommended products
    const { data: recommendedProducts, error: fetchError } = await supabase
      .from("products")
      .select("id, name, brand, price, images, is_featured, is_limited_edition, stock_total, category")
      .in("id", productIds);

    if (fetchError) {
      console.error("Error fetching recommended products - Status:", fetchError.code);
      throw fetchError;
    }

    return new Response(
      JSON.stringify({
        text: explanation,
        products: recommendedProducts || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("AI consultant error - Type:", error instanceof Error ? error.message : "Unknown");
    
    // Fallback to featured products on any error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: fallbackProducts } = await supabase
        .from("products")
        .select("id, name, brand, price, images, is_featured, is_limited_edition, stock_total, category")
        .gt("stock_total", 0)
        .eq("is_featured", true)
        .limit(4);
      
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error",
          text: "I'm having trouble right now, but here are some of our top picks! 😊",
          products: fallbackProducts || []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (fallbackError) {
      console.error("Fallback error occurred");
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error",
          text: "Sorry, I encountered an error. Please try again.",
          products: []
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
});
