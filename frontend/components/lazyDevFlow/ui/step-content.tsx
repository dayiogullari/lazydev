"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

interface StepContentProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  isLoading: boolean;
  buttonStyle?: "primary" | "github" | "wallet" | "disabled";
  children?: React.ReactNode;
  buttonStylesCustome: string;
}

export function StepContent({
  icon,
  title,
  description,
  buttonText,
  onClick,
  isLoading,
  buttonStyle,
  buttonStylesCustome,
  children,
}: StepContentProps) {
  const buttonStyles = {
    primary: "bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300",
    github: "bg-slate-800 hover:bg-slate-700 text-white",
    wallet:
      "bg-indigo-900/50 hover:bg-indigo-800/50 text-white border border-indigo-700/30",
    disabled: "bg-slate-800/50 text-slate-400 cursor-not-allowed",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-6 text-cyan-400"
      >
        {icon}
      </motion.div>

      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-2 max-w-md">{description}</p>
      <p className="mb-2">{children}</p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        disabled={isLoading || buttonStyle === "disabled"}
        className={`relative px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 ${
          buttonStylesCustome
            ? buttonStylesCustome
            : buttonStyles[buttonStyle || "primary"]
        } `}
      >
        {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}
        <span>{buttonText}</span>
      </motion.button>
    </motion.div>
  );
}
