
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useNPS } from "../../contexts/NPSContext";
import ProgressBar from "../ProgressBar";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { t } = useLanguage();
  const { userName } = useNPS();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="question-container"
    >
      <Logo />
      <ProgressBar currentStep={1} totalSteps={5} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-xl mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          {t("welcome")}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t("subtitle")}
        </p>
        <Button onClick={onNext} size="lg" className="px-8 py-6 text-lg">
          {t("start")}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
