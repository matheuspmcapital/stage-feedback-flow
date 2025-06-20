
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { Scope, useNPS } from "../../contexts/NPSContext";
import ProgressBar from "../ProgressBar";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";

import stageDiagram from "../../assets/stage-diagram.png";

interface WelcomeScreenProps {
  onNext: () => void;
}

const scopeOptions: { slug: Scope, title: string }[] = [
  { slug: 'strategy', title: 'Strategy & Business' },
  { slug: 'design', title: 'Design' },
  { slug: 'solutions', title: 'Solutions' },
  { slug: 'tech', title: 'Technology' },
  { slug: 'm&a', title: 'M&A e Finance' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { t } = useLanguage();
  const { npsData, scopes } = useNPS();

  console.log("SCOPES: ", scopes);
  console.log("SCOPE OPTIONS: ", scopeOptions);

  return (
    <div className="flex">
      <div className="flex-1 bg-[#21005E] items-center hidden md:flex">
        <img src={stageDiagram} alt="Stage Scope Diagram" className="px-8" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="question-container flex-1"
      >
        <Logo />
        <ProgressBar currentStep={1} totalSteps={5} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-xl mx-auto"
        >
          <h1 className="text-2xl text-[#3C3C3C] sm:text-3xl font-bold mb-4">
            {t("welcome")}
          </h1>
          <p className="text-lg text-[#3C3C3C] mb-12">
            {t("subtitle")}
          </p>
          {
            !!scopes?.length && (
              <div className="flex flex-col gap-6 mb-24">
                <p className="font-bold text-lg">{t("scope")}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {scopeOptions.map((scope) => (
                    <button
                      className={`
                        text-lg font-thin border py-2 px-4 rounded-full cursor-default
                        ${scopes?.includes(scope.slug) ? 'border-[#5200CE] bg-[#5200CE] text-[#FFFFFF]' : 'border-[#EADDFF] bg-[#FFFBFE] text-[#21005E]'}
                      `}
                      key={scope.title}
                    >{scope.title}</button>
                  ))}
                </div>
              </div>
            )
          }
          <Button onClick={onNext} size="lg" className="px-8 py-6 text-lg">
            {t("start")}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
