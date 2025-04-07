
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useNPS } from "../../contexts/NPSContext";
import CodeInput from "../CodeInput";
import ProgressBar from "../ProgressBar";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { t } = useLanguage();
  const { npsData, codeValidated } = useNPS();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-2xl px-4 py-8"
    >
      <div className="flex flex-col items-center mb-10">
        <img
          src="https://nps.stage.consulting/_next/static/media/stg-home.0a1c9367.svg"
          alt="Stage Consulting"
          className="w-64 mb-8" 
        />
        <h1 className="text-3xl font-bold text-center mb-2">{t("welcome")}</h1>
        <p className="text-lg text-center text-muted-foreground mb-6">
          {t("welcomeSubtitle")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{t("enterYourCode")}</h2>
          <CodeInput />
        </div>

        <div className="mt-8">
          <ProgressBar currentStep={1} totalSteps={7} />
          <div className="flex justify-end mt-4">
            <Button
              onClick={onNext}
              disabled={!codeValidated}
              size="lg"
              className="px-8"
            >
              {t("continue")}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
