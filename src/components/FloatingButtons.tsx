import { MessageCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FloatingButtons = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/1234567890", "_blank");
  };

  const handleAIChat = () => {
    // Will be connected to AI chat functionality
    console.log("Open AI Chat");
  };

  return (
    <>
      {/* WhatsApp Button */}
      <Button
        onClick={handleWhatsApp}
        size="icon"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-110 transition-transform"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* AI Chat Button */}
      <Button
        onClick={handleAIChat}
        size="icon"
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 shadow-accent hover:scale-110 transition-transform"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </>
  );
};
