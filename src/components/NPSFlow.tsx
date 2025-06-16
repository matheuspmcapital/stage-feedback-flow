import React, { useState, useEffect } from "react";
import { useNPS } from "../contexts/NPSContext";
import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "./Screens/WelcomeScreen";
import RecommendScreen from "./Screens/RecommendScreen";
import ReasonScreen from "./Screens/ReasonScreen";
import RehireScreen from "./Screens/RehireScreen";
import TestimonialScreen from "./Screens/TestimonialScreen";
import PublishScreen from "./Screens/PublishScreen";
import SummaryScreen from "./Screens/SummaryScreen";
import ThankYouScreen from "./Screens/ThankYouScreen";
import LanguageSelector from "./LanguageSelector";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StageSplitScreen from './StageSplitScreen';

enum Step {
  Welcome,
  Recommend,
  Reason,
  Rehire,
  Testimonial,
  Publish,
  Summary,
  ThankYou,
  CodeUsed,
}

const NPSFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const { npsData, code, codeValidated, submitResponses } = useNPS();
  const { toast } = useToast();
  const [isCheckingCode, setIsCheckingCode] = useState(true);

  // Check if code has already been completed
  useEffect(() => {
    const checkCodeStatus = async () => {
      if (!code) {
        setIsCheckingCode(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('survey_codes')
          .select('completed_at')
          .eq('code', code)
          .single();

        if (error) {
          console.error("Error checking code:", error);
        } else if (data && data.completed_at) {
          // If code was already completed, show the CodeUsed screen
          setCurrentStep(Step.CodeUsed);
        } else if (codeValidated) {
          // If the code exists but hasn't been completed, mark it as started
          const now = new Date().toISOString();
          await supabase
            .from('survey_codes')
            .update({ started_at: now })
            .eq('code', code);
        }
      } catch (err) {
        console.error("Error checking code status:", err);
      } finally {
        setIsCheckingCode(false);
      }
    };

    checkCodeStatus();
  }, [codeValidated, code]);

  const goToNext = () => {
    setDirection("forward");
    setCurrentStep((prev) => prev + 1 as Step);
  };

  const goToPrev = () => {
    setDirection("backward");
    setCurrentStep((prev) => prev - 1 as Step);
  };

  const handleSubmit = async () => {
    try {
      const success = await submitResponses();

      if (success) {
        toast({
          title: "Survey submitted",
          description: "Thank you for your feedback!"
        });
        goToNext();
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your survey. Please try again."
      });
    }
  };

  if (isCheckingCode) {
    return <div className="flex items-center justify-center min-h-screen">Checking survey code...</div>;
  }

  return (
    <div className="min-h-screen">
      <LanguageSelector />

      <AnimatePresence mode="wait" initial={false}>
        {currentStep === Step.Welcome && (
          <WelcomeScreen key="welcome" onNext={goToNext} />
        )}

        {(currentStep !== Step.Welcome && currentStep !== Step.ThankYou && currentStep !== Step.CodeUsed) && (
          <StageSplitScreen>
            {currentStep === Step.Recommend && (
                <RecommendScreen key="recommend" onNext={goToNext} onPrev={goToPrev} />
              )}

              {currentStep === Step.Reason && (
                <ReasonScreen key="reason" onNext={goToNext} onPrev={goToPrev} />
              )}

              {currentStep === Step.Rehire && (
                <RehireScreen key="rehire" onNext={goToNext} onPrev={goToPrev} />
              )}

              {currentStep === Step.Testimonial && (
                <TestimonialScreen key="testimonial" onNext={goToNext} onPrev={goToPrev} />
              )}

              {currentStep === Step.Publish && (
                <PublishScreen key="publish" onNext={goToNext} onPrev={goToPrev} />
              )}

              {currentStep === Step.Summary && (
                <SummaryScreen key="summary" onNext={goToNext} onPrev={goToPrev} onSubmit={handleSubmit} />
              )}
          </StageSplitScreen>
        )}

        {currentStep === Step.ThankYou && (
          <ThankYouScreen key="thank-you" />
        )}

        {currentStep === Step.CodeUsed && (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">This survey code has already been used</h2>
            <p className="mb-6">This survey has already been completed and cannot be used again.</p>
            <p className="text-muted-foreground">If you believe this is an error, please contact support.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NPSFlow;
