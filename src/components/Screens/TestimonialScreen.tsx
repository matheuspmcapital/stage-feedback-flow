
import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNPS } from "../../contexts/NPSContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Logo from "../Logo";
import { motion } from "framer-motion";
import ProgressBar from "../ProgressBar";

interface TestimonialScreenProps {
  onNext: () => void;
  onPrev: () => void;
}

const TestimonialScreen: React.FC<TestimonialScreenProps> = ({ onNext, onPrev }) => {
  const { t } = useLanguage();
  const { npsData, setTestimonial } = useNPS();
  const [testimonial, setTestimonialText] = useState(npsData.testimonial);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!testimonial.trim()) {
      setError("This field is required");
      return;
    }
    
    setTestimonial(testimonial);
    onNext();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
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
      <ProgressBar currentStep={4} totalSteps={5} />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl sm:text-2xl md:text-3xl font-bold mb-10 text-center"
      >
        {t("question4")}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-xl mb-6"
      >
        <Textarea
          value={testimonial}
          onChange={(e) => {
            setTestimonialText(e.target.value);
            if (e.target.value.trim()) setError("");
          }}
          placeholder={t("question4")}
          className="min-h-[150px] text-base"
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 mt-4"
      >
        <Button variant="outline" onClick={onPrev} className="px-8">
          {t("back")}
        </Button>
        <Button onClick={handleSubmit} className="px-8">
          {t("next")}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default TestimonialScreen;
