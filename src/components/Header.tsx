import { ShoppingCart, Menu, Search, User, LogOut, Package, UserCircle, LayoutDashboard, Gift, Home, ShoppingBag, Shield, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/bm-kicks-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLoyalty } from "@/hooks/useLoyalty";
import CartDrawer from "@/components/CartDrawer";
import { InlineSearch } from "@/components/InlineSearch";
import { CurrencySelector } from "@/components/CurrencySelector";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, customerProfile, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const { account, currentTier, combinedScore } = useLoyalty();
  const navigate = useNavigate();

  const displayName = customerProfile?.full_name || user?.email?.split("@")[0] || "Account";
  const initial = (customerProfile?.full_name || user?.email || "U").charAt(0).toUpperCase();

  const go = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-3 md:px-6 transition-all duration-300">
      <div className="container mx-auto glass-strong rounded-full px-4 md:px-6 h-14 flex items-center justify-between shadow-card">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="BM Kicks" width={144} height={36} className="h-8 md:h-9 w-auto" />
            <span className="hidden sm:inline font-display text-lg tracking-tight uppercase">BM Kicks</span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-2 relative">
          <CurrencySelector />
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex rounded-full"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search products"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <InlineSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${user ? "ring-1 ring-gold/40" : ""}`}
                aria-label="User menu"
              >
                {user ? (
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-accent text-primary-foreground flex items-center justify-center font-semibold text-xs md:text-sm shadow-glow">
                    {initial}
                  </div>
                ) : (
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-strong border-border/60">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{displayName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      {account && (
                        <div className="mt-2 flex items-center justify-between px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            {(currentTier?.name ?? account.current_tier)}
                            {currentTier && currentTier.multiplier > 1 && (
                              <span className="text-gold ml-1">{currentTier.multiplier}x</span>
                            )}
                          </span>
                          <span className="font-display text-sm text-gold">
                            {combinedScore.toLocaleString()} xp
                          </span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4 text-gold" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/customer')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/customer/rewards')}>
                    <Gift className="mr-2 h-4 w-4 text-gold" />
                    Rewards
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
            className="relative rounded-full"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-glow">
                {cartCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[85vw] sm:w-96 glass-strong border-border/60 p-0">
          <SheetHeader className="px-5 pt-6 pb-4 border-b border-border/40">
            <SheetTitle className="font-display text-lg uppercase tracking-wider">
              {user ? displayName : "Menu"}
            </SheetTitle>
            {user && (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            )}
          </SheetHeader>

          <div className="flex flex-col p-2">
            <Button variant="ghost" className="justify-start h-12" onClick={() => go("/")}>
              <Home className="mr-3 h-4 w-4" /> Home
            </Button>
            <Button variant="ghost" className="justify-start h-12" onClick={() => go("/#products")}>
              <ShoppingBag className="mr-3 h-4 w-4" /> Shop
            </Button>
            <Button
              variant="ghost"
              className="justify-start h-12"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search className="mr-3 h-4 w-4" /> Search
            </Button>

            <div className="my-2 border-t border-border/40" />

            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" className="justify-start h-12" onClick={() => go("/admin")}>
                    <Shield className="mr-3 h-4 w-4 text-gold" /> Admin Dashboard
                  </Button>
                )}
                <Button variant="ghost" className="justify-start h-12" onClick={() => go("/customer")}>
                  <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
                </Button>
                <Button variant="ghost" className="justify-start h-12" onClick={() => go("/customer/rewards")}>
                  <Gift className="mr-3 h-4 w-4 text-gold" /> Rewards
                </Button>
                <Button variant="ghost" className="justify-start h-12" onClick={() => go("/customer/badges")}>
                  <Trophy className="mr-3 h-4 w-4 text-gold" /> Badges
                </Button>
                <Button variant="ghost" className="justify-start h-12" onClick={() => go("/customer/orders")}>
                  <Package className="mr-3 h-4 w-4" /> My Orders
                </Button>
                <Button variant="ghost" className="justify-start h-12" onClick={() => go("/customer/profile")}>
                  <UserCircle className="mr-3 h-4 w-4" /> Profile
                </Button>
                <div className="my-2 border-t border-border/40" />
                <Button
                  variant="ghost"
                  className="justify-start h-12 text-destructive"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="justify-start h-12" onClick={() => go("/auth")}>
                  <User className="mr-3 h-4 w-4" /> Login
                </Button>
                <Button variant="default" className="justify-start h-12 mt-1" onClick={() => go("/auth?tab=signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
};
