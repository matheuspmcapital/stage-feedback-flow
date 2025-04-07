
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNPS } from "../../contexts/NPSContext";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";
import { motion } from "framer-motion";
import ProgressBar from "../ProgressBar";

interface PublishScreenProps {
  onNext: () => void;
  onPrev: () => void;
}

const PublishScreen: React.FC<PublishScreenProps> = ({ onNext, onPrev }) => {
  const { t } = useLanguage();
  const { setCanPublish } = useNPS();

  const handleYes = () => {
    setCanPublish(true);
    onNext();
  };

  const handleNo = () => {
    setCanPublish(false);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="question-container"
    >
      <Logo />
      <ProgressBar currentStep={5} totalSteps={5} />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl sm:text-2xl md:text-3xl font-bold mb-10 text-center"
      >
        {t("question5")}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <Button
          onClick={handleYes}
          variant="default"
          className="px-12 py-6 text-lg"
        >
          {t("yes")}
        </Button>
        <Button
          onClick={handleNo}
          variant="outline"
          className="px-12 py-6 text-lg"
        >
          {t("no")}
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button variant="outline" onClick={onPrev} className="px-8">
          {t("back")}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default PublishScreen;
