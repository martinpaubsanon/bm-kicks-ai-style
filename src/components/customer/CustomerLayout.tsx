import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, User, LogOut, ShoppingBag, LayoutDashboard, Gift, Trophy } from "lucide-react";
import { Header } from "@/components/Header";

export default function CustomerLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/customer", icon: LayoutDashboard },
    { name: "Rewards", href: "/customer/rewards", icon: Gift },
    { name: "Badges", href: "/customer/badges", icon: Trophy },
    { name: "My Orders", href: "/customer/orders", icon: Package },
    { name: "Profile", href: "/customer/profile", icon: User },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20 pb-20 md:pb-0">
        {/* Mobile: horizontal scroll tab bar under header */}
        <nav className="md:hidden sticky top-20 z-30 -mt-2 mb-2 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex gap-1 overflow-x-auto px-3 py-2 no-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href} className="shrink-0">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="h-9"
                  >
                    <Icon className="mr-1.5 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="container px-3 md:px-8 py-4 md:py-8">
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-64 space-y-4">
              <Link to="/">
                <Button variant="default" className="w-full justify-start mb-4">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.name} to={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </nav>
            </aside>

            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>

        {/* Mobile bottom action bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border px-3 py-2 flex gap-2">
          <Link to="/" className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            aria-label="Sign out"
            className={cn("text-destructive")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
