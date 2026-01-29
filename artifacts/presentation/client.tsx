import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import { DocumentSkeleton } from "@/components/document-skeleton";
import {
  CopyIcon,
  DownloadIcon,
  PresentationIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
} from "@/components/icons";
import { PresentationEditor } from "@/components/presentation-editor";

type Metadata = any;

export const presentationArtifact = new Artifact<"presentation", Metadata>({
  kind: "presentation",
  description:
    "Useful for creating presentation slides, pitch decks, and slide outlines",
  initialize: () => null,
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === "data-textDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 200 &&
          draftArtifact.content.length < 250
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({
    content,
    currentVersionIndex,
    onSaveContent,
    status,
    isLoading,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="presentation" />;
    }

    return (
      <PresentationEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={true}
        saveContent={onSaveContent}
        status={status}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Presentation copied to clipboard!");
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      description: "Download as markdown",
      onClick: ({ content }) => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const timestamp = new Date().toISOString().split("T")[0];
        a.download = `presentation-${timestamp}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Presentation downloaded!");
      },
    },
  ],
  toolbar: [
    {
      description: "Add more slides",
      icon: <PresentationIcon />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add 2-3 more slides to strengthen the presentation with additional insights, examples, or supporting data.",
            },
          ],
        });
      },
    },
    {
      description: "Polish and refine",
      icon: <SparklesIcon />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please polish the presentation by improving clarity, adding impactful statements, and ensuring consistent messaging throughout.",
            },
          ],
        });
      },
    },
    {
      description: "Add speaker notes",
      icon: <CopyIcon />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add detailed speaker notes to each slide to help during the presentation.",
            },
          ],
        });
      },
    },
  ],
});
