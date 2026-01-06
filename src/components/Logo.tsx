
import React from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";


const Logo: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-4"
    >
      <img
        src={logo}
        alt="Stage Consulting"
        className="h-6 sm:h-7"
      />
    </motion.div>
  );
};

export default Logo;
