
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useNPS } from "../../contexts/NPSContext";

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
          src="public/lovable-uploads/65aee1e3-c45f-429a-b936-1588d3994a06.png"
          alt="Thank you illustration"
          className="w-64 mb-6"
        />
        <h1 className="text-3xl font-bold">{t("thankYou")}</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          {t("thankYouMessage")}
        </p>
        
        <div className="mt-10 p-6 bg-card rounded-lg shadow-sm w-full max-w-md">
          <h2 className="text-lg font-medium mb-4">{t("yourFeedback")}</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">{t("recommendationScore")}</p>
              <p className="text-2xl font-bold">{npsData.recommendScore}</p>
            </div>
            
            {npsData.recommendReason && (
              <div>
                <p className="text-sm font-medium">{t("recommendationReason")}</p>
                <p className="p-3 bg-muted rounded-md">{npsData.recommendReason}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium">{t("rehireScore")}</p>
              <p className="text-2xl font-bold">{npsData.rehireScore}</p>
            </div>
            
            {npsData.testimonial && (
              <div>
                <p className="text-sm font-medium">{t("testimonial")}</p>
                <p className="p-3 bg-muted rounded-md">{npsData.testimonial}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThankYouScreen;
