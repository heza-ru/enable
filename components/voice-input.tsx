"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isDisabled?: boolean;
}

export function VoiceInput({ onTranscript, isDisabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");

          // Only send final results
          if (event.results[event.results.length - 1].isFinal) {
            onTranscript(transcript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);

          if (event.error === "not-allowed") {
            toast.error(
              "Microphone access denied. Please enable it in your browser settings."
            );
          } else if (event.error === "no-speech") {
            toast.error("No speech detected. Please try again.");
          } else {
            toast.error("Voice recognition error. Please try again.");
          }

          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        toast.success("Listening... Speak now!");
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Failed to start voice input");
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      toast.success("Voice input stopped");
    }
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return null; // Don't show the button if not supported
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "relative size-9 p-0 transition-all",
              isListening && "bg-red-500 text-white hover:bg-red-600"
            )}
            disabled={isDisabled}
            onClick={toggleListening}
            size="sm"
            type="button"
            variant={isListening ? "default" : "ghost"}
          >
            {isListening ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <MicOff className="size-4" />
              </>
            ) : (
              <Mic className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? "Stop listening" : "Start voice input"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook for voice input
export function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  return {
    isListening,
    isSupported,
    onTranscript,
  };
}

// Type definitions for Web Speech API
// Note: These types are already defined globally in components/ai-elements/prompt-input.tsx
