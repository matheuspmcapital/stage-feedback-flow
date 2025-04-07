
import React, { useState, useEffect } from "react";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  
  // Check if session exists in Supabase Auth
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsLoggedIn(true);
          setSession(session);
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setSession(null);
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setIsLoggedIn(false);
        } else if (session) {
          setSession(session);
          setIsLoggedIn(true);

          // Check if this user exists in admin_users
          const { data, error: userError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();

          if (userError || !data) {
            // If not in admin_users table, sign out
            await supabase.auth.signOut();
            setIsLoggedIn(false);
            setSession(null);
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You don't have admin access. Please contact support."
            });
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        setIsLoggedIn(false);
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

  return isLoggedIn ? (
    <AdminDashboard />
  ) : (
    <AdminLogin />
  );
};

export default Admin;
