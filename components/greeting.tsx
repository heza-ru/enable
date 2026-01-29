"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getUserName } from "@/lib/storage/user-profile";
import { PromptSuggestions } from "./prompt-suggestions";

interface GreetingProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export const Greeting = ({ onSuggestionClick }: GreetingProps) => {
  // Get user's name from profile
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    setUserName(getUserName());
  }, []);

  return (
    <div
      className="mx-auto flex size-full max-w-4xl flex-col justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
      >
        <h1 className="mb-2 font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          Hi, {userName}
        </h1>
        <p className="mb-6 text-muted-foreground text-base sm:text-lg md:text-xl lg:text-2xl">
          What can I help you with?
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-muted-foreground text-xs sm:text-sm"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.2,
        }}
      >
        Choose a prompt below or write your own to start chatting with Enable.
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.3,
        }}
      >
        <PromptSuggestions onSuggestionClick={onSuggestionClick} />
      </motion.div>
    </div>
  );
};
