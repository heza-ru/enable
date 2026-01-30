import { smoothStream, streamText } from "ai";
import { presentationPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { getArtifactModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { loadMasterDeckReference } from "@/lib/master-deck/load-master-deck";

export const presentationDocumentHandler =
  createDocumentHandler<"presentation">({
    kind: "presentation",
    onCreateDocument: async ({ title, dataStream, apiKey }) => {
      let draftContent = "";

      // Load master deck reference if available
      const masterDeckRef = loadMasterDeckReference();

      const { fullStream } = streamText({
        model: getArtifactModel(apiKey),
        system: presentationPrompt(masterDeckRef),
        experimental_transform: smoothStream({ chunking: "word" }),
        prompt: title,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === "text-delta") {
          const { text } = delta;

          draftContent += text;

          dataStream.write({
            type: "data-textDelta",
            data: text,
            transient: true,
          });
        }
      }

      return draftContent;
    },
    onUpdateDocument: async ({ document, description, dataStream, apiKey }) => {
      let draftContent = "";

      // Load master deck reference if available
      const masterDeckRef = loadMasterDeckReference();

      const { fullStream } = streamText({
        model: getArtifactModel(apiKey),
        system: `${presentationPrompt(masterDeckRef)}

${updateDocumentPrompt(document.content, "presentation")}`,
        experimental_transform: smoothStream({ chunking: "word" }),
        prompt: description,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === "text-delta") {
          const { text } = delta;

          draftContent += text;

          dataStream.write({
            type: "data-textDelta",
            data: text,
            transient: true,
          });
        }
      }

      return draftContent;
    },
  });
