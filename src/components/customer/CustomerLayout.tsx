import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut, ShoppingBag, LayoutDashboard } from "lucide-react";
import { Header } from "@/components/Header";

export default function CustomerLayout() {
  const { customerProfile, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/customer", icon: LayoutDashboard },
    { name: "My Orders", href: "/customer/orders", icon: Package },
    { name: "Profile", href: "/customer/profile", icon: User },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="container py-8">
          <div className="flex gap-8">
            <aside className="w-64 space-y-4">
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

          <main className="flex-1">
            <Outlet />
          </main>
          </div>
        </div>
      </div>
    </>
  );
}
