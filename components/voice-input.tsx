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
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        setIsSupported(true);
      }
    }
  }, []);

  const initializeRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return null;

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
      if (event.error === "not-allowed") {
        toast.error(
          "Microphone access denied. Please allow microphone access in your browser settings and try again.",
          { duration: 5000 }
        );
        setPermissionGranted(false);
      } else if (event.error === "no-speech") {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === "aborted") {
        // Silently handle aborted errors
        return;
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }

      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    return recognitionInstance;
  }, [onTranscript]);

  const startListening = useCallback(async () => {
    if (isListening) return;

    // Request microphone permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);

      // Initialize recognition if not already done
      let recognitionInstance = recognition;
      if (!recognitionInstance) {
        recognitionInstance = initializeRecognition();
        if (!recognitionInstance) {
          toast.error("Speech recognition not supported in your browser");
          return;
        }
        setRecognition(recognitionInstance);
      }

      // Start recognition
      recognitionInstance.start();
      setIsListening(true);
      toast.success("Listening... Speak now!");
    } catch (error: any) {
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        toast.error(
          "Microphone access denied. Please allow microphone access in your browser and try again.",
          { duration: 5000 }
        );
        setPermissionGranted(false);
      } else if (error.name === "NotFoundError") {
        toast.error("No microphone found. Please connect a microphone and try again.");
      } else {
        toast.error("Failed to start voice input. Please try again.");
      }
      setIsListening(false);
    }
  }, [recognition, isListening, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        recognition.stop();
        setIsListening(false);
        toast.success("Voice input stopped");
      } catch (error) {
        // Silently handle stop errors
        setIsListening(false);
      }
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
          <p>
            {isListening 
              ? "Stop listening" 
              : permissionGranted === false
                ? "Microphone access denied. Please check browser settings."
                : "Start voice input"}
          </p>
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
