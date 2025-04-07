
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNPS } from "../../contexts/NPSContext";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryScreenProps {
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({
  onPrev,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const { npsData } = useNPS();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="question-container relative flex flex-col h-full"
    >
      <Logo />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center"
      >
        {t("yourAnswers")}
      </motion.h1>
      
      <ScrollArea className="flex-grow mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xl space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("question1")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-xl text-primary">{npsData.recommendScore}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("question2")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{npsData.recommendReason}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("question3")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-xl text-primary">{npsData.rehireScore}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("question4")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{npsData.testimonial}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("question5")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{npsData.canPublish ? t("yes") : t("no")}</p>
            </CardContent>
          </Card>
        </motion.div>
      </ScrollArea>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 py-4 bg-white absolute bottom-0 w-full justify-center border-t"
      >
        <Button variant="outline" onClick={onPrev} className="px-8">
          {t("back")}
        </Button>
        <Button onClick={onSubmit} className="px-8">
          {t("sendAnswers")}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SummaryScreen;
