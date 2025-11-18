import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: "floating" | "inline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const WhatsAppButton = ({ 
  phoneNumber = "97450000000", // Default Qatar number format
  message = "Hi, I'm interested in your products!",
  variant = "inline",
  size = "default",
  className = ""
}: WhatsAppButtonProps) => {
  const handleWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (variant === "floating") {
    return (
      <Button
        onClick={handleWhatsApp}
        size="icon"
        className={`fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-110 transition-transform ${className}`}
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleWhatsApp}
      size={size}
      className={`bg-green-500 hover:bg-green-600 text-white gap-2 ${className}`}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-4 w-4" />
      Contact on WhatsApp
    </Button>
  );
};