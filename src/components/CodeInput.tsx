
import React, { useState, useEffect } from "react";
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
  onValidCode: (code: string) => Promise<void>;
  prefilledCode?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({ onValidCode, prefilledCode = "" }) => {
  const { t } = useLanguage();
  const { setUserName, setCode } = useNPS();
  const [inputCode, setInputCode] = useState(prefilledCode);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateCode = async () => {
    if (!inputCode) return;
    setIsValidating(true);
    
    try {
      await onValidCode(inputCode);
    } finally {
      setIsValidating(false);
    }
  };

  // Update input code when prefilledCode changes
  useEffect(() => {
    if (prefilledCode) {
      setInputCode(prefilledCode);
    }
  }, [prefilledCode]);

  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10"
        style={{width:'calc(100% - 32px)', maxWidth:"450px", margin:"0px 16px"}}
      >
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80 shadow-xl border border-white/20 dark:border-zinc-800/30">
          <CardHeader className="items-center">
            <Logo />
            <CardTitle className="mt-2">{t("enterCode")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="ABC123"
              className="text-center text-xl py-6 bg-white/50 dark:bg-zinc-800/50 border border-[#ececec]"
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
    </>
  );
};

export default CodeInput;
