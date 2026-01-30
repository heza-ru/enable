"use client";

import equal from "fast-deep-equal";
import {
  type MouseEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import useSWR from "swr";
import { useArtifact } from "@/hooks/use-artifact";
import type { Document } from "@/lib/db/schema";
import { cn, fetcher } from "@/lib/utils";
import type { ArtifactKind, UIArtifact } from "./artifact";
import { CodeEditor } from "./code-editor";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { InlineDocumentSkeleton } from "./document-skeleton";
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from "./icons";
import { ImageEditor } from "./image-editor";
import { SpreadsheetEditor } from "./sheet-editor";
import { Editor } from "./text-editor";

type DocumentPreviewProps = {
  isReadonly: boolean;
  result?: any;
  args?: any;
};

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Document[]
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = hitboxRef.current;
    // Only update if this preview matches the currently visible artifact
    if (!element || !artifact.documentId || artifact.documentId !== result?.id) return;

    const boundingBox = element.getBoundingClientRect();

    // Validate bounding box to prevent glitches
    const isValidBoundingBox = 
      boundingBox.width > 0 && 
      boundingBox.height > 0 &&
      !isNaN(boundingBox.x) && 
      !isNaN(boundingBox.y);

    if (isValidBoundingBox) {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, result?.id, setArtifact]);

  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          isReadonly={isReadonly}
          result={{ id: result.id, title: result.title, kind: result.kind }}
          type="create"
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          args={{ title: args.title, kind: args.kind }}
          isReadonly={isReadonly}
          type="create"
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result.kind ?? args.kind} />;
  }

  // Use preview document from API, or fall back to result/args data
  // Only use artifact state if this is the currently streaming artifact
  const document: Document | null = previewDocument
    ? previewDocument
    : artifact.status === "streaming" && artifact.documentId === result?.id
      ? {
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: new Date(),
          userId: "noop",
        }
      : result
        ? {
            title: result.title,
            kind: result.kind,
            content: "", // Will be loaded from API
            id: result.id,
            createdAt: new Date(),
            userId: "noop",
          }
        : null;

  if (!document) {
    return <LoadingSkeleton artifactKind={artifact.kind} />;
  }

  // For text documents, show a simple clickable card that opens fullscreen
  if (document.kind === "text") {
    return (
      <button
        ref={hitboxRef as React.RefObject<HTMLButtonElement>}
        className="group relative w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-white text-left transition-all hover:border-primary/50 hover:shadow-md dark:bg-zinc-900"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          
          // Validate bounding box
          const isValidBoundingBox = 
            rect.width > 0 && 
            rect.height > 0 &&
            !Number.isNaN(rect.x) && 
            !Number.isNaN(rect.y);

          const safeBoundingBox = isValidBoundingBox
            ? {
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
              }
            : {
                left: window.innerWidth / 2,
                top: window.innerHeight / 2,
                width: 300,
                height: 200,
              };

          setArtifact((currentArtifact) => ({
            ...currentArtifact,
            documentId: result.id,
            kind: result.kind,
            title: result.title,
            isVisible: true,
            status: currentArtifact.status === "streaming" ? "streaming" : "idle",
            boundingBox: safeBoundingBox,
          }));
        }}
        type="button"
      >
        <div className="flex flex-row items-start justify-between gap-2 border-b border-border bg-white p-4 sm:items-center dark:bg-zinc-900">
          <div className="flex flex-row items-start gap-3 sm:items-center">
            <div className="text-muted-foreground">
              {artifact.status === "streaming" && artifact.documentId === result.id ? (
                <div className="animate-spin">
                  <LoaderIcon />
                </div>
              ) : (
                <FileIcon />
              )}
            </div>
            <div className="font-medium text-foreground">{document.title}</div>
          </div>
          <div className="rounded-md bg-black/5 p-2 transition-all group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
            <FullscreenIcon />
          </div>
        </div>
        <div className="line-clamp-3 p-4 text-sm text-muted-foreground">
          {previewDocument?.content || document.content || "Click to view document..."}
        </div>
      </button>
    );
  }

  // For other document types, show the full preview
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-white dark:bg-zinc-900">
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result}
        setArtifact={setArtifact}
      />
      <DocumentHeader
        isStreaming={artifact.status === "streaming" && artifact.documentId === result?.id}
        kind={document.kind}
        title={document.title}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="flex h-[57px] flex-row items-center justify-between gap-2 p-4 dark:bg-muted">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="size-4 animate-pulse rounded-md bg-muted-foreground/20" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded-lg bg-muted-foreground/20" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === "image" ? (
      <div className="overflow-y-scroll bg-muted">
        <div className="h-[257px] w-full animate-pulse bg-muted-foreground/20" />
      </div>
    ) : (
      <div className="overflow-y-scroll bg-muted p-8 pt-4">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setArtifact,
}: {
  hitboxRef: React.RefObject<HTMLElement>;
  result: any;
  setArtifact: (
    updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)
  ) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const element = event.currentTarget;
      const boundingBox = element.getBoundingClientRect();

      // Validate bounding box dimensions to prevent animation glitches
      const isValidBoundingBox = 
        boundingBox.width > 0 && 
        boundingBox.height > 0 &&
        !isNaN(boundingBox.x) && 
        !isNaN(boundingBox.y);

      // Use default/fallback values if invalid
      const safeBoundingBox = isValidBoundingBox
        ? {
            left: boundingBox.x,
            top: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
          }
        : {
            left: window.innerWidth / 2,
            top: window.innerHeight / 2,
            width: 300,
            height: 200,
          };

      setArtifact((artifact) =>
        artifact.status === "streaming"
          ? { ...artifact, isVisible: true }
          : {
              ...artifact,
              title: result.title,
              documentId: result.id,
              kind: result.kind,
              isVisible: true,
              boundingBox: safeBoundingBox,
            }
      );
    },
    [setArtifact, result]
  );

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-10 cursor-pointer"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as any);
        }
      }}
      ref={hitboxRef as React.RefObject<HTMLDivElement>}
      role="button"
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-4">
        <div className="pointer-events-auto rounded-md bg-black/10 p-2 transition-all hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) {
    return false;
  }
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: ArtifactKind;
  isStreaming: boolean;
}) => (
  <div className="flex flex-row items-start justify-between gap-2 border-b border-border bg-white p-4 sm:items-center dark:bg-zinc-900">
    <div className="flex flex-row items-start gap-3 sm:items-center">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === "image" ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 font-medium text-foreground sm:translate-y-0">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) {
    return false;
  }
  if (prevProps.isStreaming !== nextProps.isStreaming) {
    return false;
  }

  return true;
});

const DocumentContent = ({ document }: { document: Document }) => {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    "h-[257px] flex-shrink-0 overflow-y-auto bg-white dark:bg-zinc-900",
    {
      "p-4 sm:px-14 sm:py-16": document.kind === "text",
      "p-0": document.kind === "code" || document.kind === "sheet",
    }
  );

  const commonProps = {
    content: document.content ?? "",
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    saveContent: () => null,
    suggestions: [],
  };

  const handleSaveContent = () => null;

  // Show spreadsheet preview differently
  if (document.kind === "sheet") {
    const lines = document.content?.split('\n').slice(0, 5) || [];
    const hasContent = lines.length > 0 && lines[0]?.length > 0;
    
    return (
      <div className={containerClassName}>
        {hasContent ? (
          <div className="space-y-1 text-xs font-mono">
            {lines.map((line: string, idx: number) => (
              <div key={idx} className="truncate text-foreground">
                {line.split(',').slice(0, 4).join(' | ') || '...'}
              </div>
            ))}
            <div className="pt-2 text-center text-muted-foreground">
              Click to view full spreadsheet
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Spreadsheet preview loading...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {document.kind === "text" ? (
        <Editor {...commonProps} onSaveContent={handleSaveContent} />
      ) : document.kind === "code" ? (
        <div className="relative flex h-full w-full">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} onSaveContent={handleSaveContent} />
          </div>
        </div>
      ) : document.kind === "image" ? (
        <ImageEditor
          content={document.content ?? ""}
          currentVersionIndex={0}
          isCurrentVersion={true}
          isInline={true}
          status={artifact.status}
          title={document.title}
        />
      ) : null}
    </div>
  );
};
