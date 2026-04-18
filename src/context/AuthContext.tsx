import { User } from "@prisma/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import supabase from "../utils/supabase";

interface AuthState {
  user: User;
  authUser: SupabaseUser | null;
  loading: boolean;
  error: Error | null;
}

interface AuthReturnType {
  data: any;
  error: any;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<any>;
  signInWithGoogle: (redirect?: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const initUser: User = {
  id: "",
  email: "",
  password: "",
  createdAt: new Date(),
  lastPaymentDate: null,
  plan: "",
  lastPaymentValue: null,
  freeTrialStartDate: new Date(),
  freeTrialShownAt: null,
  lastOrderId: null,
  subExpirationDate: null,
};
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: initUser,
    authUser: null,
    loading: true,
    error: null,
  });

  // Helper to get the correct base URL for redirects
  const getBaseURL = () => {
    // Priority: Environment Variable -> Window Origin
    let url =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    // Clean up: Remove trailing slash
    return url.endsWith("/") ? url.slice(0, -1) : url;
  };

  useEffect(() => {
    // 1. Initial session check
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    };

    getSession();

    // 2. Listen for auth state changes (login, logout, session refresh, OAuth completion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        
        if (session?.user) {
          await fetchUserData(session.user);
        } else if (event === "SIGNED_OUT") {
          setAuthState({
            user: initUser,
            authUser: null,
            loading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({ ...prev, loading: false }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("id", authUser.id)
        .single();
      
      if (error && error.code === "PGRST116") {
        // User record not found, create it (likely first-time social login)
        const { data: newData, error: insertError } = await supabase
          .from("User")
          .upsert({
            id: authUser.id,
            email: authUser.email!,
            password: "", // No password for OAuth users
            plan: "free-trial",
            createdAt: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        setAuthState({
          user: newData,
          authUser,
          loading: false,
          error: null,
        });
        return;
      }

      if (error) throw error;

      setAuthState({
        user: data,
        authUser,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("fetchUserData error:", error);
      setAuthState({
        user: initUser,
        authUser: null,
        loading: false,
        error: error as Error,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({ ...prev, loading: false, error }));
        return { data: null, error };
      }

      if (authData.user) {
        await fetchUserData(authData.user);
      }

      return { data: authData, error: null };
    } catch (error) {
      const err = error as Error;
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async (redirect?: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const callbackUrl = redirect ? `${getBaseURL()}${redirect}` : getBaseURL();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const err = error as Error;
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
      return { data: null, error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getBaseURL(),
        },
      });

      if (authError) {
        setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
        return { data: null, error: authError };
      }

      if (authData.user) {
        // Create user in public schema
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error: dbError } = await supabase.from("User").upsert({
          id: authData.user.id,
          email: authData.user.email!,
          password: hashedPassword,
          ...userData,
        });

        if (dbError) {
          setAuthState((prev) => ({ ...prev, loading: false, error: dbError }));
          return { data: null, error: dbError };
        }

        await fetchUserData(authData.user);
      }

      return { data: authData, error: null };
    } catch (error) {
      const err = error as Error;
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
      return { data: null, error: err };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getBaseURL()}/reset-password`,
      });
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("signOut error:", error);
      setAuthState((prev) => ({ ...prev, error: error as Error }));
    } else {
      setAuthState({
        user: initUser,
        authUser: null,
        loading: false,
        error: null,
      });
    }
  };

  const isAuthenticated = !!authState.authUser;

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
