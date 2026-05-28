import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setActiveGameUserId } from "@/lib/badges";

type AppRole = "admin" | "moderator" | "user";

interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  default_shipping_address?: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  customerProfile: CustomerProfile | null;
  signOut: () => Promise<void>;
  signUpCustomer: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signInCustomer: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setActiveGameUserId(session?.user?.id ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const { data: roleData } = await supabase.rpc("get_current_user_role");

            const { data: profileData } = await supabase
              .from("customer_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileData) {
              setCustomerProfile({
                ...profileData,
                default_shipping_address: profileData.default_shipping_address as CustomerProfile['default_shipping_address']
              });
            }

            if (!roleData) {
              // Race with handle_new_user trigger — retry once
              setTimeout(async () => {
                const { data: retryRole } = await supabase.rpc("get_current_user_role");
                setRole((retryRole as AppRole) || "user");
                setIsLoading(false);
              }, 1000);
            } else {
              setRole((roleData as AppRole) || "user");
              setIsLoading(false);
            }
          }, 0);
        } else {
          setActiveGameUserId(null);
          setRole(null);
          setCustomerProfile(null);
          setIsLoading(false);
        }

      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setActiveGameUserId(session?.user?.id ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
          
          // Fetch customer profile
          const { data: profileData } = await supabase
            .from("customer_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (profileData) {
            setCustomerProfile({
              ...profileData,
              default_shipping_address: profileData.default_shipping_address as CustomerProfile['default_shipping_address']
            });
          }
          
          // Handle case where user role not assigned yet
          if (error && error.code === 'PGRST116') {
            setTimeout(async () => {
              const { data: retryData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id)
                .single();
              
              setRole(retryData?.role as AppRole || "user");
              setIsLoading(false);
            }, 1000);
          } else {
            setRole(data?.role as AppRole || "user");
            setIsLoading(false);
          }
        }, 0);
      } else {
        setActiveGameUserId(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setActiveGameUserId(null);
    setRole(null);
    setCustomerProfile(null);
  };

  const signUpCustomer = async (email: string, password: string, fullName: string, phone: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    });

    if (error) throw error;
  };

  const signInCustomer = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin: role === "admin",
        isLoading,
        customerProfile,
        signOut,
        signUpCustomer,
        signInCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
