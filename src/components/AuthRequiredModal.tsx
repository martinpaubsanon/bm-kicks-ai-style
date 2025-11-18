import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestCheckout: () => void;
}

export function AuthRequiredModal({ open, onOpenChange, onGuestCheckout }: AuthRequiredModalProps) {
  const navigate = useNavigate();
  const { signUpCustomer, signInCustomer } = useAuth();
  const [mode, setMode] = useState<"choice" | "signin" | "signup">("choice");
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInCustomer(email, password);
      toast({
        title: "Signed in successfully",
        description: "You can now continue with your checkout",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpCustomer(email, password, fullName, phone);
      toast({
        title: "Account created successfully",
        description: "You can now continue with your checkout",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    onGuestCheckout();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "choice" && (
          <>
            <DialogHeader>
              <DialogTitle>Sign in to continue</DialogTitle>
              <DialogDescription>
                Create an account to track your orders and save your information for faster checkout
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
              <Button onClick={() => setMode("signup")} size="lg">
                Create Account
              </Button>
              <Button onClick={() => setMode("signin")} variant="outline" size="lg">
                Sign In
              </Button>
              <Button onClick={handleGuestCheckout} variant="ghost" size="lg">
                Continue as Guest
              </Button>
            </div>
          </>
        )}

        {mode === "signin" && (
          <>
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>
                Sign in to your account to continue
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSignIn} className="space-y-4 py-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => setMode("choice")}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {mode === "signup" && (
          <>
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>
              <DialogDescription>
                Create an account to track your orders
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSignUp} className="space-y-4 py-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-phone">Phone</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => setMode("choice")}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
