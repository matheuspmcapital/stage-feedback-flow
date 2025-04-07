
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const languageOptions = [
  { value: "pt", label: "Português", Icon: () => <Flag className="mr-2 h-4 w-4" color="#009C3B" /> }, // Brazil flag colors
  { value: "en", label: "English", Icon: () => <Flag className="mr-2 h-4 w-4" color="#B31942" /> }, // US flag colors
  { value: "es", label: "Español", Icon: () => <Flag className="mr-2 h-4 w-4" color="#AA151B" /> }, // Spain flag colors
];

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const selectedLanguage = languageOptions.find((option) => option.value === language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute top-4 right-4"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            {selectedLanguage?.Icon && <selectedLanguage.Icon />}
            {selectedLanguage?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languageOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setLanguage(option.value as "pt" | "en" | "es")}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <option.Icon />
                {option.label}
              </div>
              {language === option.value && (
                <Check className="w-4 h-4 ml-2 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default LanguageSelector;

