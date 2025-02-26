import React from "react";
import { motion } from "framer-motion";

interface StepProgressBarProps {
  steps: string[];
  currentStep: string;
}

export function StepProgressBar({ steps, currentStep }: StepProgressBarProps) {
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex < 0) return null;

  const progressPercentage =
    steps.length > 1 ? `${(currentIndex / (steps.length - 1)) * 100}%` : "100%";

  return (
    <div className="relative w-full mb-8 h-1 bg-zinc-900 rounded-full">
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: progressPercentage }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
      />

      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrentStep = index === currentIndex;

        return (
          <div
            key={step}
            className="absolute"
            style={{
              top: "50%",
              left: `${(index / (steps.length - 1)) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              className={`
                relative w-2 h-2 rounded-full transition-colors duration-200 border-2
                ${isActive ? "bg-emerald-400 border-emerald-400" : "bg-zinc-900 border-zinc-700"}
                ${isCurrentStep ? "ring-2 ring-emerald-400/20" : ""}
              `}
              initial={{ scale: 0.8 }}
              animate={{ scale: isCurrentStep ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>
        );
      })}
    </div>
  );
}
