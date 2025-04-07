
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
  const { npsData, codeValidated, setCode, setCodeValidated } = useNPS();
  const { toast } = useToast();
  const [isCheckingCode, setIsCheckingCode] = useState(true);
  
  // Check if code has already been completed
  useEffect(() => {
    const checkCodeStatus = async () => {
      if (!npsData.code) {
        setIsCheckingCode(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('survey_codes')
          .select('completed_at')
          .eq('code', npsData.code)
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
            .eq('code', npsData.code);
        }
      } catch (err) {
        console.error("Error checking code status:", err);
      } finally {
        setIsCheckingCode(false);
      }
    };
    
    checkCodeStatus();
  }, [codeValidated, npsData.code]);
  
  const goToNext = () => {
    setDirection("forward");
    setCurrentStep((prev) => prev + 1 as Step);
  };

  const goToPrev = () => {
    setDirection("backward");
    setCurrentStep((prev) => prev - 1 as Step);
  };

  const submitSurvey = async () => {
    // In a real app, you would send the data to an API
    console.log("Submitting survey:", npsData);
    
    try {
      // Get the survey_code_id from the code
      const { data: codeData, error: codeError } = await supabase
        .from('survey_codes')
        .select('id')
        .eq('code', npsData.code)
        .single();
      
      if (codeError) throw codeError;
      
      if (!codeData) {
        throw new Error("Survey code not found");
      }
      
      // Insert survey answers
      await supabase.from('survey_answers').insert([
        {
          survey_code_id: codeData.id,
          question_id: 'recommend_score',
          answer: npsData.recommendScore?.toString() || ''
        },
        {
          survey_code_id: codeData.id,
          question_id: 'recommend_reason',
          answer: npsData.recommendReason || ''
        },
        {
          survey_code_id: codeData.id,
          question_id: 'rehire_score',
          answer: npsData.rehireScore?.toString() || ''
        },
        {
          survey_code_id: codeData.id,
          question_id: 'testimonial',
          answer: npsData.testimonial || ''
        },
        {
          survey_code_id: codeData.id,
          question_id: 'can_publish',
          answer: npsData.canPublish ? 'true' : 'false'
        }
      ]);
      
      // Update survey code completion
      await supabase
        .from('survey_codes')
        .update({ completed_at: new Date().toISOString() })
        .eq('code', npsData.code);
      
      // Show toast
      toast({
        title: "Survey submitted",
        description: "Thank you for your feedback!"
      });
      
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your survey. Please try again."
      });
    }
    
    // Go to thank you screen
    goToNext();
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
