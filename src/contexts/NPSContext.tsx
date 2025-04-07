
import React, { createContext, useContext, useState } from "react";

export interface NPSData {
  recommendScore: number | null;
  recommendReason: string;
  rehireScore: number | null;
  testimonial: string;
  canPublish: boolean;
  userName: string;
  code: string;
}

export interface NPSContextProps {
  npsData: NPSData;
  setRecommendScore: (score: number) => void;
  setRecommendReason: (reason: string) => void;
  setRehireScore: (score: number) => void;
  setTestimonial: (testimonial: string) => void;
  setCanPublish: (canPublish: boolean) => void;
  setUserName: (name: string) => void;
  setCode: (code: string) => void;
  resetData: () => void;
}

const initialNPSData: NPSData = {
  recommendScore: null,
  recommendReason: "",
  rehireScore: null,
  testimonial: "",
  canPublish: false,
  userName: "",
  code: ""
};

const NPSContext = createContext<NPSContextProps>({
  npsData: initialNPSData,
  setRecommendScore: () => {},
  setRecommendReason: () => {},
  setRehireScore: () => {},
  setTestimonial: () => {},
  setCanPublish: () => {},
  setUserName: () => {},
  setCode: () => {},
  resetData: () => {}
});

export const useNPS = () => useContext(NPSContext);

export const NPSProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [npsData, setNpsData] = useState<NPSData>(initialNPSData);

  const setRecommendScore = (score: number) => {
    setNpsData(prev => ({ ...prev, recommendScore: score }));
  };

  const setRecommendReason = (reason: string) => {
    setNpsData(prev => ({ ...prev, recommendReason: reason }));
  };

  const setRehireScore = (score: number) => {
    setNpsData(prev => ({ ...prev, rehireScore: score }));
  };

  const setTestimonial = (testimonial: string) => {
    setNpsData(prev => ({ ...prev, testimonial }));
  };

  const setCanPublish = (canPublish: boolean) => {
    setNpsData(prev => ({ ...prev, canPublish }));
  };

  const setUserName = (name: string) => {
    setNpsData(prev => ({ ...prev, userName: name }));
  };
  
  const setCode = (code: string) => {
    setNpsData(prev => ({ ...prev, code }));
  };

  const resetData = () => {
    setNpsData(initialNPSData);
  };

  return (
    <NPSContext.Provider
      value={{
        npsData,
        setRecommendScore,
        setRecommendReason,
        setRehireScore,
        setTestimonial,
        setCanPublish,
        setUserName,
        setCode,
        resetData
      }}
    >
      {children}
    </NPSContext.Provider>
  );
};
