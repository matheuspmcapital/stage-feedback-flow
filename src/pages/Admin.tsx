
import React, { useState, useEffect } from "react";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // When signed in, verify if user is an admin
          setTimeout(async () => {
            const { data, error } = await supabase
              .from('admin_users')
              .select('*')
              .eq('email', session.user.email)
              .maybeSingle();
              
            if (error || !data) {
              // Not an admin user, sign out
              await supabase.auth.signOut();
              setIsLoggedIn(false);
              setSession(null);
              toast({
                variant: "destructive",
                title: "Access Denied",
                description: "You don't have admin access."
              });
            } else {
              // Is an admin user
              setIsLoggedIn(true);
              setSession(session);
            }
            
            setIsLoading(false);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setSession(null);
          setIsLoading(false);
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Verify if this user is an admin
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();
            
          if (error || !data) {
            // Not an admin user, sign out
            await supabase.auth.signOut();
            setIsLoggedIn(false);
            setSession(null);
          } else {
            // Is an admin user
            setIsLoggedIn(true);
            setSession(session);
          }
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return isLoggedIn && session ? (
    <AdminDashboard session={session} />
  ) : (
    <AdminLogin />
  );
};

export default Admin;
