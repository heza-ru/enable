"use client";
// @ts-nocheck

import { defaultMarkdownParser, defaultMarkdownSerializer } from "prosemirror-markdown";
import type { Node } from "prosemirror-model";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

import { createSuggestionWidget, type UISuggestion } from "./suggestions";

export const buildDocumentFromContent = (content: string) => {
  console.log('[buildDocumentFromContent] Input content:', content?.substring(0, 100));
  
  if (!content) {
    console.log('[buildDocumentFromContent] No content, returning empty doc');
    return defaultMarkdownParser.parse("");
  }
  
  try {
    // Use ProseMirror's markdown parser directly - much more reliable!
    const doc = defaultMarkdownParser.parse(content);
    console.log('[buildDocumentFromContent] Successfully parsed markdown, doc:', doc?.toJSON());
    console.log('[buildDocumentFromContent] Document has content:', doc?.textContent?.substring(0, 100));
    return doc;
  } catch (error) {
    console.error('[buildDocumentFromContent] Error parsing markdown:', error);
    // Fallback to empty document
    return defaultMarkdownParser.parse("");
  }
};

export const buildContentFromDocument = (document: Node) => {
  return defaultMarkdownSerializer.serialize(document);
};

export const createDecorations = (
  suggestions: UISuggestion[],
  view: EditorView
) => {
  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    decorations.push(
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: "suggestion-highlight",
        },
        {
          suggestionId:
            (suggestion as any).id ||
            `${suggestion.selectionStart}-${suggestion.selectionEnd}`,
          type: "highlight",
        }
      )
    );

    decorations.push(
      Decoration.widget(
        suggestion.selectionStart,
        (currentView) => {
          const { dom } = createSuggestionWidget(suggestion, currentView);
          return dom;
        },
        {
          suggestionId:
            (suggestion as any).id ||
            `${suggestion.selectionStart}-${suggestion.selectionEnd}`,
          type: "widget",
        }
      )
    );
  }

  return DecorationSet.create(view.state.doc, decorations);
};
