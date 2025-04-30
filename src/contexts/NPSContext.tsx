/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type Scope = 'strategy' | 'design' | 'solutions' | 'tech' | 'm&a'

export interface NPSData {
  userName: string;
  code: string;
  scope: Scope[];
  recommendScore: number;
  recommendReason: string;
  rehireScore: number;
  testimonial: string;
  canPublish: boolean;
}

interface NPSProviderProps {
  children: React.ReactNode;
}

interface NPSContextType {
  npsData: NPSData;
  userName: string;
  code: string;
  codeValidated: boolean;
  setScope: (scope: Scope) => void;
  setUserName: (name: string) => void;
  setCode: (code: string) => void;
  setCodeValidated: (validated: boolean) => void;
  setRecommendScore: (score: number) => void;
  setRecommendReason: (reason: string) => void;
  setRehireScore: (score: number) => void;
  setTestimonial: (testimonial: string) => void;
  setCanPublish: (canPublish: boolean) => void;
  submitResponses: () => Promise<boolean>;
  recordStep: (questionId: string, answer: any) => Promise<void>;
  getNPSCategory: (score: number) => "promoter" | "neutral" | "detractor";
}

const initialData: NPSData = {
  userName: "",
  code: "",
  scope: [],
  recommendScore: 0,
  recommendReason: "",
  rehireScore: 0,
  testimonial: "",
  canPublish: false,
};

const NPSContext = createContext<NPSContextType | undefined>(undefined);

export const NPSProvider: React.FC<NPSProviderProps> = ({ children }) => {
  const [npsData, setNpsData] = useState<NPSData>(initialData);
  const [userName, setUserName] = useState("");
  const [code, setCode] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setNpsData(prev => ({ ...prev, userName, code }));
  }, [userName, code]);

  // NPS category calculator
  const getNPSCategory = (score: number): "promoter" | "neutral" | "detractor" => {
    if (score >= 9) return "promoter";
    if (score >= 7) return "neutral";
    return "detractor";
  };

  const recordStep = async (questionId: string, answer: any) => {
    try {
      if (!code) return;

      const { data: codeData, error: codeError } = await supabase
        .from('survey_codes')
        .select('id')
        .eq('code', code)
        .single();

      if (codeError || !codeData) {
        throw new Error("Invalid survey code");
      }

      const { error } = await supabase
        .from('survey_answers')
        .insert({
          survey_code_id: codeData.id,
          question_id: questionId,
          answer: typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
        });

      if (error) throw error;

    } catch (error) {
      console.error("Error recording step:", error);
    }
  };

  const setRecommendScore = (score: number) => {
    setNpsData({ ...npsData, recommendScore: score });
    recordStep("recommend_score", score);
  };

  const setRecommendReason = (reason: string) => {
    setNpsData({ ...npsData, recommendReason: reason });
    recordStep("recommend_reason", reason);
  };

  const setRehireScore = (score: number) => {
    setNpsData({ ...npsData, rehireScore: score });
    recordStep("rehire_score", score);
  };

  const setTestimonial = (testimonial: string) => {
    setNpsData({ ...npsData, testimonial: testimonial });
    recordStep("testimonial", testimonial);
  };

  const setCanPublish = (canPublish: boolean) => {
    setNpsData({ ...npsData, canPublish: canPublish });
    recordStep("can_publish", canPublish);
  };

  const setScope = (scope: Scope) => {
    let updatedScope = npsData.scope;

    if (updatedScope.find((item) => item === scope)) {
      updatedScope = updatedScope.filter((item) => item !== scope)
    } else {
      updatedScope = [...updatedScope, scope]
    }

    setNpsData({ ...npsData, scope: updatedScope })
  }

  const submitResponses = async (): Promise<boolean> => {
    try {
      if (!code) return false;

      const { error } = await supabase
        .from('survey_codes')
        .update({ completed_at: new Date().toISOString() })
        .eq('code', code);

      if (error) throw error;

      await recordStep("submission", { submitted: true });

      return true;
    } catch (error) {
      console.error("Error submitting responses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your responses. Please try again."
      });
      return false;
    }
  };

  return (
    <NPSContext.Provider
      value={{
        npsData,
        userName,
        code,
        codeValidated,
        setScope,
        setUserName,
        setCode,
        setCodeValidated,
        setRecommendScore,
        setRecommendReason,
        setRehireScore,
        setTestimonial,
        setCanPublish,
        submitResponses,
        recordStep,
        getNPSCategory
      }}
    >
      {children}
    </NPSContext.Provider>
  );
};

export const useNPS = () => {
  const context = useContext(NPSContext);
  if (context === undefined) {
    throw new Error("useNPS must be used within a NPSProvider");
  }
  return context;
};
