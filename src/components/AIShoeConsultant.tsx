import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

type Message = { role: "user" | "assistant"; content: string };

interface AIShoeConsultantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIShoeConsultant = ({ isOpen, onOpenChange }: AIShoeConsultantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! 👟 I'm your AI sneaker consultant at BM Kicks. Tell me what you're looking for - style, size, occasion, budget - and I'll help you find your perfect pair!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-shoe-consultant`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Too many requests",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Service temporarily unavailable",
            description: "Please try again in a few moments.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone && reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("AI consultant error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full animate-pulse-glow" />
              <div className="relative bg-gradient-to-br from-accent to-accent/80 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">AI Sneaker Consultant</h2>
              <p className="text-sm text-muted-foreground">Powered by AI • 50+ Shoes in Stock</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="hover:bg-accent/10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6">
            <div ref={scrollRef} className="space-y-6 pb-4">
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  <Card className={`max-w-[80%] ${message.role === "user" ? "bg-accent text-accent-foreground" : "bg-card border-border/50"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {message.role === "assistant" && (
                          <div className="bg-accent/10 p-2 rounded-full shrink-0">
                            <Sparkles className="h-4 w-4 text-accent" />
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-accent/10 p-2 rounded-full">
                          <Sparkles className="h-4 w-4 text-accent" />
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin text-accent" />
                        <span className="text-sm text-muted-foreground">Finding your perfect kicks...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-6 border-t border-border/50 bg-muted/30">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Describe what you're looking for... (style, size, brand, occasion, budget)"
              className="min-h-[60px] resize-none bg-background border-border/50 focus:border-accent"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send • Shift + Enter for new line</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};