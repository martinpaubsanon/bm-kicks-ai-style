import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompactProductCard } from "@/components/CompactProductCard";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { convertPrice } from "@/lib/currency";
import { Send, Sparkles, Loader2 } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images?: string[];
  is_featured?: boolean;
  is_limited_edition?: boolean;
  stock_total?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

interface AIShoeConsultantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIShoeConsultant = ({ isOpen, onOpenChange }: AIShoeConsultantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👟 Find your perfect kicks instantly! Click a category or describe what you're looking for:",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const budgetDisplay = formatPrice(150, 'USD').replace(/\.00$/, '');

  const quickReplies = [
    { label: "🏃 Running", query: "Show me running shoes" },
    { label: "🔥 Limited", query: "Show me limited edition sneakers" },
    { label: "💎 Premium", query: "Show me premium sneakers" },
    { label: `💰 Under ${budgetDisplay}`, query: `Show me shoes under ${budgetDisplay}` },
    { label: "⭐ Featured", query: "Show me featured sneakers" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setShowQuickReplies(false);
    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-shoe-consultant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Service unavailable",
            description: "AI service temporarily unavailable. Please try again later.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        throw new Error("Failed to get response");
      }

      const data = await response.json() as {
        text: string;
        products?: Product[];
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        products: data.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (query: string) => {
    sendMessage(query);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] md:h-[600px] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl">
        {/* Redesigned Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold tracking-tight">AI Shoe Consultant</h2>
              <p className="text-[10px] md:text-xs text-muted-foreground">Powered by AI • Instant Recommendations</p>
            </div>
          </div>
        </div>

        {/* Welcome State (only shown on initial message) */}
        {messages.length === 1 && messages[0].role === "assistant" && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl animate-bounce">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Find Your Perfect Kicks!</h3>
                <p className="text-muted-foreground">
                  Tell me what you're looking for, and I'll recommend the best shoes for you.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Quick suggestions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleQuickReply(reply.query)}
                      className="h-auto py-3 text-sm hover:scale-105 transition-transform"
                    >
                      {reply.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area (hidden during welcome state) */}
        {!(messages.length === 1 && messages[0].role === "assistant") && (
          <ScrollArea className="flex-1 px-4 py-3 bg-gradient-to-b from-muted/20 to-background" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 shadow-md ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {message.products && message.products.length > 0 && (
                      <div className="grid gap-2 mt-3 border-t border-border/20 pt-3">
                        {message.products.map((product) => (
                          <div
                            key={product.id}
                            className="hover:scale-[1.02] transition-transform"
                          >
                            <CompactProductCard
                              product={product}
                              onClick={() => {
                                navigate(`/product/${product.id}`);
                                onOpenChange(false);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted shadow-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">AI is thinking</span>
                      <span className="flex gap-1">
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showQuickReplies && messages.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply.query)}
                      disabled={isLoading}
                      className="text-xs hover:scale-105 transition-transform"
                    >
                      {reply.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Modernized Input Area */}
        <div className="p-4 border-t bg-background shadow-lg">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your perfect shoe..."
              className="min-h-[56px] max-h-[120px] resize-none text-sm border-2 focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-[56px] w-[56px] flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 hover:scale-105 transition-transform shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
            Press Enter to send • <Sparkles className="w-3 h-3" /> AI-powered recommendations
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
