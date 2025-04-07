
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNPS } from "../contexts/NPSContext";
import CodeInput from "../components/CodeInput";
import NPSFlow from "../components/NPSFlow";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

// Mock database of codes - in a real app this would come from a database
const mockCodes = {
  "123456": { name: "João Silva", company: "ABC Corp" },
  "654321": { name: "Maria Santos", company: "XYZ Ltd" },
  "111222": { name: "Carlos Oliveira", company: "Tech Solutions" }
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get("code");
  const [hasValidCode, setHasValidCode] = useState(false);
  const { setUserName, setCode } = useNPS();
  const { toast } = useToast();

  useEffect(() => {
    if (codeParam) {
      // Check if code is valid
      const userData = (mockCodes as any)[codeParam];
      
      if (userData) {
        setUserName(userData.name);
        setCode(codeParam);
        setHasValidCode(true);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "The code provided is not valid.",
        });
      }
    }
  }, [codeParam, setUserName, setCode, toast]);

  return hasValidCode ? <NPSFlow /> : <CodeInput onValidCode={() => setHasValidCode(true)} />;
};

export default Index;
