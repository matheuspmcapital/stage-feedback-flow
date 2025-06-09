
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useNPS } from "../../contexts/NPSContext";
import { Button } from "@/components/ui/button";

const ThankYouScreen: React.FC = () => {
  const { t } = useLanguage();
  const { npsData } = useNPS();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-2xl px-4 py-16"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <img
          src="public/uploads/65aee1e3-c45f-429a-b936-1588d3994a06.png"
          alt="Thank you illustration"
          className="w-64 mb-6"
        />
        <h1 className="text-3xl font-bold">{t("thankYou")}</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          {t("thankYouSubtitle")}
        </p>

        <a href="https://stage.consulting">
          <Button variant="outline" size="sm">
            {t("learnMore")}
          </Button>
        </a>
      </div>
    </motion.div>
  );
};

export default ThankYouScreen;
