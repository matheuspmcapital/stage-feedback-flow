
import React from "react";
import { motion } from "framer-motion";

const Logo: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-4"
    >
      <img
        src="https://nps.stage.consulting/_next/static/media/logo-stg.51abc93c.svg"
        alt="Stage Consulting Logo"
        className="h-6 sm:h-7"
      />
    </motion.div>
  );
};

export default Logo;
