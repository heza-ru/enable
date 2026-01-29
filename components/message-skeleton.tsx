"use client";

import { motion } from "framer-motion";
import { SparklesIcon } from "./icons";

export function MessageSkeleton() {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="w-full"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-2 md:gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          {/* Skeleton lines with staggered animation */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              className="h-4 rounded bg-muted"
              initial={{ opacity: 0.3 }}
              key={i}
              style={{ width: i === 2 ? "60%" : "100%" }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-muted-foreground text-sm"
      exit={{ opacity: 0, y: 10 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <span>Thinking</span>
      <span className="inline-flex">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 0,
          }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 0.15,
          }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 0.3,
          }}
        >
          .
        </motion.span>
      </span>
    </motion.div>
  );
}

export function StreamingLoader() {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      className="flex size-6 items-center justify-center rounded-full bg-primary/10"
      transition={{
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        className="size-4 rounded-full border-2 border-primary border-t-transparent"
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}
