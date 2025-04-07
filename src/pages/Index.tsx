
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNPS } from "../contexts/NPSContext";
import { useLanguage } from "../contexts/LanguageContext";
import CodeInput from "../components/CodeInput";
import NPSFlow from "../components/NPSFlow";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuroraBackground } from "@/components/ui/aurora-background";

const Index = () => {
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get("code");
  const langParam = searchParams.get("lang") as "pt" | "en" | "es" | null;
  const [hasValidCode, setHasValidCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUserName, setCode, setCodeValidated } = useNPS();
  const { setLanguage } = useLanguage();
  const { toast } = useToast();

  // Set language from URL parameter if provided
  useEffect(() => {
    if (langParam && ["pt", "en", "es"].includes(langParam)) {
      setLanguage(langParam);
    }
  }, [langParam, setLanguage]);

  // Validate code function
  const validateCode = async (code: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('survey_codes')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "The code provided is not valid.",
        });
        return false;
      }
      
      // Update started_at if not already set
      if (!data.started_at) {
        await supabase
          .from('survey_codes')
          .update({ started_at: new Date().toISOString() })
          .eq('id', data.id);
      }
      
      setUserName(data.name || '');
      setCode(code);
      setCodeValidated(true);
      return true;
      
    } catch (error) {
      console.error("Error validating code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while validating the code.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code input validation
  const handleValidCode = async (inputCode: string) => {
    const isValid = await validateCode(inputCode);
    setHasValidCode(isValid);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return hasValidCode ? (
    <NPSFlow /> 
  ) : (
    <AuroraBackground>
      <CodeInput onValidCode={handleValidCode} prefilledCode={codeParam || ""} />
    </AuroraBackground>
  );
};

export default Index;
