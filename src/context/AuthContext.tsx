import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import supabase from "../utils/supabase";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

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
};
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: initUser,
    authUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
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
  }, []);

  const fetchUserData = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("id", authUser.id)
        .single();
      if (error) throw error;
      setAuthState({
        user: data,
        authUser,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        user: initUser,
        authUser: null,
        loading: false,
        error: error as Error,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null })); // Set loading state
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
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      return { data: null, error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null })); // Set loading state
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
        return { data: null, error: authError };
      }

      if (authData.user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error: dbError } = await supabase.from("User").insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            password: hashedPassword,
            ...userData,
          },
        ]);

        if (dbError) {
          setAuthState((prev) => ({ ...prev, loading: false, error: dbError }));
          return { data: null, error: dbError };
        }

        await fetchUserData(authData.user);
      }

      return { data: authData, error: null };
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    console.log(error);

    if (error) {
      setAuthState((prev) => ({ ...prev, error: error as Error }));
    }
  };

  const isAuthenticated = !!authState.authUser;

  return (
    <AuthContext.Provider
      value={{ ...authState, isAuthenticated, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
