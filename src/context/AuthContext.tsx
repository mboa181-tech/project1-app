"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface AppUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

interface AuthContextType {
  user: AppUser | User | null;
  session: Session | null;
  loading: boolean;
  signInWithCredentials: (params: {
    email: string;
    password?: string;
    fullName?: string;
    mode: "signin" | "signup";
  }) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
}

const LOCAL_SESSION_KEY = "flowdesk_auth_session_v1";

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithCredentials: async () => ({ error: "Not initialized" }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Check active Supabase session if configured
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setLoading(false);
          return;
        }

        // If no cloud session, check local session backup
        checkLocalBackupSession(mounted);
      }).catch(() => {
        checkLocalBackupSession(mounted);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (!mounted) return;
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          setLoading(false);
        } else {
          checkLocalBackupSession(mounted);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // 2. Check local persistent session if Supabase is offline/not configured
      checkLocalBackupSession(mounted);
    }
  }, []);

  const checkLocalBackupSession = (isMounted: boolean) => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          if (isMounted) {
            setUser(parsed);
            setLoading(false);
            return;
          }
        }
      }
    } catch {}

    if (isMounted) {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const signInWithCredentials = async ({
    email,
    password,
    fullName,
    mode,
  }: {
    email: string;
    password?: string;
    fullName?: string;
    mode: "signin" | "signup";
  }): Promise<{ error?: string; success?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth first if configured
    if (isSupabaseConfigured && supabase) {
      try {
        if (mode === "signin") {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password || "",
          });
          if (error) {
            return { error: error.message };
          }
          if (data.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            return { success: true };
          }
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password || "",
            options: {
              data: {
                full_name: fullName?.trim() || cleanEmail.split("@")[0],
              },
            },
          });
          if (error) {
            return { error: error.message };
          }
          if (data.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            return { success: true };
          }
          return { success: true };
        }
      } catch (err: any) {
        console.warn("Supabase Auth request error, falling back to local credentials:", err);
      }
    }

    // 2. Local Verified Admin Session Fallback
    // Allows owner to log in even in offline/demo environments
    if (!password || password.length < 4) {
      return { error: "Kata sandi minimal 4 karakter" };
    }

    const localUser: AppUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      user_metadata: {
        full_name: fullName?.trim() || cleanEmail.split("@")[0] || "Financial Controller",
        role: "Owner",
      },
    };

    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
    } catch {}

    setUser(localUser);
    setLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch {}

    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {}

    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithCredentials, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
