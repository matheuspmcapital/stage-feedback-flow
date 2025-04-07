
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNPS } from "../../contexts/NPSContext";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";
import { motion } from "framer-motion";
import ProgressBar from "../ProgressBar";

interface RecommendScreenProps {
  onNext: () => void;
  onPrev: () => void;
}

const RecommendScreen: React.FC<RecommendScreenProps> = ({ onNext, onPrev }) => {
  const { t } = useLanguage();
  const { npsData, setRecommendScore } = useNPS();

  const handleSelectScore = (score: number) => {
    setRecommendScore(score);
    onNext();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="question-container"
    >
      <Logo />
      <ProgressBar currentStep={1} totalSteps={5} />
      <motion.h1
        variants={itemVariants}
        className="text-xl sm:text-2xl md:text-3xl font-bold mb-10 text-center"
      >
        {t("question1")}
      </motion.h1>
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-xl"
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
          <motion.button
            key={score}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelectScore(score)}
            className={`number-button ${
              npsData.recommendScore === score ? "selected" : ""
            }`}
          >
            {score}
          </motion.button>
        ))}
      </motion.div>
      <motion.div variants={itemVariants} className="flex justify-between w-full max-w-xl">
        <span className="text-sm text-gray-500">{t("lowProbability")}</span>
        <span className="text-sm text-gray-500">{t("highProbability")}</span>
      </motion.div>
      <motion.div variants={itemVariants} className="mt-10">
        <Button variant="outline" onClick={onPrev} className="px-8">
          {t("back")}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default RecommendScreen;
