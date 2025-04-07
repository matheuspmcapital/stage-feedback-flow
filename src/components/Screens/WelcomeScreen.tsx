
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNPS } from "../../contexts/NPSContext";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { t } = useLanguage();
  const { npsData } = useNPS();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="question-container"
    >
      <Logo />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center"
      >
        {npsData.userName}, {t("welcome")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-gray-500 mb-10 text-center text-lg"
      >
        {t("subtitle")}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Button size="lg" onClick={onNext} className="px-8 py-6 text-lg">
          {t("start")}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
