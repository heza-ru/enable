"use client";

import type { ArtifactKind } from "./artifact";

export const DocumentSkeleton = ({
  artifactKind,
}: {
  artifactKind: ArtifactKind;
}) => {
  if (artifactKind === "image") {
    return (
      <div className="flex h-[calc(100dvh-60px)] w-full flex-col items-center justify-center gap-4">
        <div className="size-96 animate-pulse rounded-lg bg-muted-foreground/20" />
      </div>
    );
  }

  if (artifactKind === "presentation") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Slide-like skeleton */}
          <div className="rounded-xl border border-border bg-card p-12 shadow-2xl">
            {/* Title */}
            <div className="mb-8 h-12 w-3/4 animate-pulse rounded-lg bg-muted-foreground/20" />
            {/* Bullet points */}
            <div className="space-y-4">
              <div className="h-6 w-full animate-pulse rounded-lg bg-muted-foreground/20" />
              <div className="h-6 w-5/6 animate-pulse rounded-lg bg-muted-foreground/20" />
              <div className="h-6 w-4/5 animate-pulse rounded-lg bg-muted-foreground/20" />
            </div>
          </div>
          {/* Navigation dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-2 w-8 animate-pulse rounded-full bg-primary" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/30" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="h-12 w-1/2 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-5 w-full animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-5 w-full animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-5 w-1/3 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-5 w-52 animate-pulse rounded-lg bg-transparent" />
      <div className="h-8 w-52 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-5 w-2/3 animate-pulse rounded-lg bg-muted-foreground/20" />
    </div>
  );
};

export const InlineDocumentSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="h-4 w-48 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-4 w-3/4 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-4 w-64 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-4 w-40 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-4 w-36 animate-pulse rounded-lg bg-muted-foreground/20" />
      <div className="h-4 w-64 animate-pulse rounded-lg bg-muted-foreground/20" />
    </div>
  );
};
