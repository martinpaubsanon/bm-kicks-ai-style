import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    const { role, signOut } = useAuth();
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges to access this area.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {role === "user" 
              ? "If you need admin access, please contact an administrator."
              : "Your account is pending approval."
            }
          </p>
          <Button onClick={() => signOut()} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
