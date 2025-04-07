
import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useNPS } from "../contexts/NPSContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface CodeInputProps {
  onValidCode: () => void;
}

// Mock database of codes - in a real app this would come from a database
const mockCodes = {
  "123456": { name: "João Silva", company: "ABC Corp" },
  "654321": { name: "Maria Santos", company: "XYZ Ltd" },
  "111222": { name: "Carlos Oliveira", company: "Tech Solutions" }
};

const CodeInput: React.FC<CodeInputProps> = ({ onValidCode }) => {
  const { t } = useLanguage();
  const { setUserName, setCode } = useNPS();
  const [inputCode, setInputCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateCode = () => {
    setIsValidating(true);
    
    // Simulate API call
    setTimeout(() => {
      const userData = (mockCodes as any)[inputCode];
      
      if (userData) {
        setUserName(userData.name);
        setCode(inputCode);
        onValidCode();
      } else {
        toast({
          variant: "destructive",
          title: t("invalidCode"),
          description: t("codeError"),
        });
      }
      
      setIsValidating(false);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <LanguageSelector />
      
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <Logo />
          <CardTitle>{t("enterCode")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="ABC123"
            className="text-center text-xl py-6"
            maxLength={10}
          />
          <Button
            onClick={validateCode}
            disabled={!inputCode || isValidating}
            className="w-full py-6"
            size="lg"
          >
            {isValidating ? "..." : t("continue")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CodeInput;
