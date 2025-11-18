import { ShoppingCart, Menu, Search, User, LogOut, Package, UserCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/bm-kicks-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user, customerProfile, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="BM Kicks" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex"
            onClick={() => {
              const productsSection = document.getElementById('all-products');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                  const searchInput = document.getElementById('search');
                  searchInput?.focus();
                }, 500);
              }
            }}
          >
            <Search className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={user ? "bg-accent/20" : ""}
              >
                {user && customerProfile ? (
                  <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-sm">
                    {customerProfile.full_name?.charAt(0) || "U"}
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user && customerProfile ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{customerProfile.full_name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/customer')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/customer/orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/customer/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate('/auth')}>
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/auth?tab=signup')}>
                    Sign Up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
};
