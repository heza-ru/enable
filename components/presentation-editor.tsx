"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  MaximizeIcon,
  MinimizeIcon,
  PresentationIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface Slide {
  title: string;
  content: string[];
  notes?: string;
  layout?: "title" | "content" | "two-column" | "image";
}

interface PresentationEditorProps {
  content: string;
  saveContent: (content: string, debounce: boolean) => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  status: "streaming" | "idle";
}

export function PresentationEditor({
  content,
  saveContent,
  currentVersionIndex,
  isCurrentVersion,
  status,
}: PresentationEditorProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"slides" | "grid">("slides");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse markdown-style presentation content into slides
  useEffect(() => {
    if (!content) {
      setSlides([]);
      return;
    }

    const parsedSlides: Slide[] = [];
    const slideBlocks = content.split(/^---+$/m);

    for (const block of slideBlocks) {
      if (!block.trim()) continue;

      const lines = block.trim().split("\n");
      const slide: Slide = {
        title: "",
        content: [],
        layout: "content",
      };

      let inNotes = false;
      let notes: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for notes section
        if (line.trim().toLowerCase().startsWith("notes:")) {
          inNotes = true;
          continue;
        }

        if (inNotes) {
          notes.push(line);
          continue;
        }

        // Title (first line or marked with #)
        if (i === 0 || line.startsWith("# ")) {
          slide.title = line.replace(/^#\s*/, "").trim();
        }
        // Detect layout hints
        else if (line.toLowerCase().startsWith("layout:")) {
          const layout = line.split(":")[1].trim() as Slide["layout"];
          slide.layout = layout || "content";
        }
        // Content
        else if (line.trim()) {
          slide.content.push(line.trim());
        }
      }

      if (notes.length > 0) {
        slide.notes = notes.join("\n").trim();
      }

      if (slide.title || slide.content.length > 0) {
        parsedSlides.push(slide);
      }
    }

    setSlides(parsedSlides);
  }, [content]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  if (slides.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <PresentationIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="text-lg">
            {status === "streaming"
              ? "Generating presentation..."
              : "No slides to display"}
          </p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="flex h-full flex-col bg-background dark:bg-muted">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode(viewMode === "slides" ? "grid" : "slides")}
            size="sm"
            variant="ghost"
          >
            <LayoutGridIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={prevSlide} disabled={currentSlide === 0} size="sm" variant="ghost">
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            size="sm"
            variant="ghost"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            size="sm"
            variant="ghost"
          >
            {isFullscreen ? (
              <MinimizeIcon className="h-4 w-4" />
            ) : (
              <MaximizeIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "grid" ? (
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-6 md:grid-cols-3 lg:grid-cols-4">
          {slides.map((s, index) => (
            <motion.div
              key={index}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
                index === currentSlide
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
              onClick={() => {
                setCurrentSlide(index);
                setViewMode("slides");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="mb-2 text-xs font-semibold text-muted-foreground">
                Slide {index + 1}
              </div>
              <div className="mb-2 font-bold text-sm">{s.title}</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {s.content.slice(0, 3).map((line, i) => (
                  <div key={i} className="truncate">
                    {line.replace(/^[-*]\s*/, "• ")}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              animate={{ opacity: 1, x: 0 }}
              className={`w-full ${
                isFullscreen ? "max-w-5xl" : "max-w-4xl"
              } rounded-xl border border-border bg-card p-12 shadow-2xl`}
              exit={{ opacity: 0, x: -20 }}
              initial={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Slide Title */}
              <h1 className="mb-8 text-4xl font-bold text-foreground">
                {slide.title}
              </h1>

              {/* Slide Content */}
              <div className="space-y-4 text-foreground">
                {slide.content.map((line, index) => {
                  // Bullet point
                  if (line.match(/^[-*]\s/)) {
                    return (
                      <motion.div
                        key={index}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 text-lg"
                        initial={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>{line.replace(/^[-*]\s*/, "")}</span>
                      </motion.div>
                    );
                  }

                  // Numbered list
                  if (line.match(/^\d+\./)) {
                    return (
                      <motion.div
                        key={index}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 text-lg"
                        initial={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="font-bold text-primary">
                          {line.match(/^\d+/)?.[0]}.
                        </span>
                        <span>{line.replace(/^\d+\.\s*/, "")}</span>
                      </motion.div>
                    );
                  }

                  // Heading
                  if (line.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="mt-6 mb-4 text-2xl font-semibold text-foreground"
                      >
                        {line.replace(/^##\s*/, "")}
                      </h2>
                    );
                  }

                  // Bold text
                  if (line.includes("**")) {
                    const parts = line.split(/\*\*(.+?)\*\*/g);
                    return (
                      <p key={index} className="text-lg">
                        {parts.map((part, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className="font-bold text-primary">
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  }

                  // Regular paragraph
                  return (
                    <p key={index} className="text-lg">
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* Speaker Notes */}
              {slide.notes && (
                <div className="mt-8 border-t border-border pt-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Speaker Notes
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{slide.notes}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Dots */}
      {viewMode === "slides" && (
        <div className="flex items-center justify-center gap-2 py-4">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              onClick={() => goToSlide(index)}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}
