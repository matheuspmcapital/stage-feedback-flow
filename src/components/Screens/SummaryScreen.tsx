
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useNPS } from "../../contexts/NPSContext";
import ProgressBar from "../ProgressBar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Map question IDs to full questions text
const questionMap: Record<string, string> = {
  "recommend_score": "How likely are you to recommend our services to a friend or colleague?",
  "recommend_reason": "What's the main reason for your score?",
  "rehire_score": "How likely are you to work with us again?",
  "testimonial": "Would you like to share a testimonial about your experience?",
  "can_publish": "Can we publish your feedback publicly?"
};

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
      </div>

      <ScrollArea className="flex-grow mb-6 rounded-lg border">
        <div className="bg-card rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium">{t("question1")}</h3>
              <div className="text-2xl mt-1">{npsData.recommendScore}</div>
            </div>

            <div>
              <h3 className="font-medium">{t("question2")}</h3>
              <div className="p-3 bg-muted rounded-md mt-1">
                {npsData.recommendReason || t("notProvided")}
              </div>
            </div>

            <div>
              <h3 className="font-medium">{t("question3")}</h3>
              <div className="text-2xl mt-1">{npsData.rehireScore}</div>
            </div>

            <div>
              <h3 className="font-medium">{t("question4")}</h3>
              <div className="p-3 bg-muted rounded-md mt-1">
                {npsData.testimonial || t("notProvided")}
              </div>
            </div>

            <div>
              <h3 className="font-medium">{t("question5")}</h3>
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
            {t("sendAnswers")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryScreen;
