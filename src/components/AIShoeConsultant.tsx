import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompactProductCard } from "@/components/CompactProductCard";
import { useToast } from "@/hooks/use-toast";
import { Send, X, Sparkles, Loader2 } from "lucide-react";

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

  const quickReplies = [
    { label: "🏃 Running", query: "Show me running shoes" },
    { label: "🔥 Limited", query: "Show me limited edition sneakers" },
    { label: "💎 Premium", query: "Show me premium sneakers" },
    { label: "💰 Under $150", query: "Show me shoes under $150" },
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
      <DialogContent className="max-w-2xl h-[600px] p-0 gap-0 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">AI Shoe Consultant</h2>
              <p className="text-xs text-muted-foreground">Powered by AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
          <div className="space-y-3 pb-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground max-w-[75%]"
                      : message.products && message.products.length > 0
                      ? "bg-muted/50 max-w-full"
                      : "bg-muted max-w-[75%]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.products && message.products.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {message.products.slice(0, 4).map((product) => (
                        <CompactProductCard
                          key={product.id}
                          product={product}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            onOpenChange(false);
                          }}
                        />
                      ))}
                      {message.products.length > 4 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{message.products.length - 4} more products available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {showQuickReplies && (
          <div className="px-4 pb-2 border-t bg-background/95">
            <p className="text-xs text-muted-foreground mb-2 mt-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickReply(reply.query)}
                  className="text-xs h-7 rounded-full"
                  disabled={isLoading}
                >
                  {reply.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your perfect shoe..."
              className="min-h-[52px] max-h-[120px] resize-none text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-[52px] w-[52px] flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Press Enter to send • AI-powered recommendations
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
