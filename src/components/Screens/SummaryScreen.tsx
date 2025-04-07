
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useNPS } from "../../contexts/NPSContext";
import ProgressBar from "../ProgressBar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryScreenProps {
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({
  onNext,
  onPrev,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const { npsData } = useNPS();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-2xl px-4 py-8 flex flex-col h-[calc(100vh-120px)]"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">{t("summary")}</h1>
        <p className="text-lg text-center text-muted-foreground">
          {t("summarySubtitle")}
        </p>
      </div>

      <ScrollArea className="flex-grow mb-6 rounded-lg border">
        <div className="bg-card rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium">{t("recommendationScore")}</h3>
              <div className="text-2xl mt-1">{npsData.recommendScore}</div>
            </div>

            <div>
              <h3 className="font-medium">{t("recommendationReason")}</h3>
              <div className="p-3 bg-muted rounded-md mt-1">
                {npsData.recommendReason || t("notProvided")}
              </div>
            </div>

            <div>
              <h3 className="font-medium">{t("rehireScore")}</h3>
              <div className="text-2xl mt-1">{npsData.rehireScore}</div>
            </div>

            <div>
              <h3 className="font-medium">{t("testimonial")}</h3>
              <div className="p-3 bg-muted rounded-md mt-1">
                {npsData.testimonial || t("notProvided")}
              </div>
            </div>

            <div>
              <h3 className="font-medium">{t("publishConsent")}</h3>
              <div className="mt-1">
                {npsData.canPublish ? t("yes") : t("no")}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 bg-background pt-4">
        <ProgressBar currentStep={7} totalSteps={7} />
        <div className="flex justify-between mt-4">
          <Button onClick={onPrev} variant="outline" size="lg">
            {t("back")}
          </Button>
          <Button onClick={onSubmit} size="lg">
            {t("submit")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryScreen;
