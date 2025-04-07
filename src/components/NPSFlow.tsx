
import React, { useState } from "react";
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

enum Step {
  Welcome,
  Recommend,
  Reason,
  Rehire,
  Testimonial,
  Publish,
  Summary,
  ThankYou,
}

const NPSFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const { npsData } = useNPS();
  const { toast } = useToast();
  
  const goToNext = () => {
    setDirection("forward");
    setCurrentStep((prev) => prev + 1 as Step);
  };

  const goToPrev = () => {
    setDirection("backward");
    setCurrentStep((prev) => prev - 1 as Step);
  };

  const submitSurvey = () => {
    // In a real app, you would send the data to an API
    console.log("Submitting survey:", npsData);
    
    // Show toast
    toast({
      title: "Survey submitted",
      description: "Thank you for your feedback!"
    });
    
    // Go to thank you screen
    goToNext();
  };

  return (
    <div className="min-h-screen">
      <LanguageSelector />
      
      <AnimatePresence mode="wait" initial={false}>
        {currentStep === Step.Welcome && (
          <WelcomeScreen key="welcome" onNext={goToNext} />
        )}
        
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
          <SummaryScreen key="summary" onNext={goToNext} onPrev={goToPrev} onSubmit={submitSurvey} />
        )}
        
        {currentStep === Step.ThankYou && (
          <ThankYouScreen key="thank-you" />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NPSFlow;
