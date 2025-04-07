
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";
import { motion } from "framer-motion";

const ThankYouScreen: React.FC = () => {
  const { t } = useLanguage();

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
        transition={{ delay: 0.2 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center"
      >
        {t("thankYou")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 mb-10 text-center text-lg"
      >
        {t("thankYouSubtitle")}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={() => window.open("https://stage.consulting", "_blank")}
          size="lg"
          className="px-8 py-6 text-lg"
        >
          {t("learnMore")}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ThankYouScreen;
