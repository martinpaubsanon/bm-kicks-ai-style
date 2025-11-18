import { Facebook, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/bm-kicks-logo.png";
import { WhatsAppButton } from "./WhatsAppButton";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <img src={logo} alt="BM Kicks" className="h-12 w-auto mb-4" />
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              The world under your kicks. Premium sneakers for every style, backed by AI-powered recommendations and 24/7 support.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <a href="#" className="hover:text-accent transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-accent transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-accent transition-colors" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
              <div className="max-w-xs">
                <WhatsAppButton message="Hi BM Kicks! I'd like to know more about your products." size="sm" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><a href="#mens" className="text-primary-foreground/80 hover:text-accent transition-colors">Men's</a></li>
              <li><a href="#womens" className="text-primary-foreground/80 hover:text-accent transition-colors">Women's</a></li>
              <li><a href="#limited" className="text-primary-foreground/80 hover:text-accent transition-colors">Limited Edition</a></li>
              <li><a href="#new-arrivals" className="text-primary-foreground/80 hover:text-accent transition-colors">New Arrivals</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">Returns</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">Size Guide</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            <span onClick={() => window.location.href = '/admin/login'} className="cursor-pointer hover:text-accent transition-colors" title="Admin Access">
              ©
            </span> 2025 BM Kicks. All rights reserved. [Powered by StrategAIz - Tech Arm of Address Gateway]
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};