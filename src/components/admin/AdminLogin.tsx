
import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "../Logo";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }
      
      // Sign in with Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Login Successful",
        description: "You've been logged in successfully.",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An error occurred while logging in.",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4 bg-muted/20"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <Logo />
          <CardTitle>{t("adminArea")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                type="email"
                className="py-6"
              />
            </div>
            <div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                type="password"
                className="py-6"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-6"
              size="lg"
            >
              {isLoggingIn ? t("loggingIn") : t("login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminLogin;
