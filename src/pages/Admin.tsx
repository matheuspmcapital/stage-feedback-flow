
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsLoggedIn(true);
          setSession(session);
          toast({
            title: "Welcome",
            description: "You've successfully logged in to the admin panel."
          });
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setSession(null);
          setIsLoading(false);
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsLoggedIn(true);
          setSession(session);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify authentication status."
        });
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
