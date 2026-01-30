"use client";

import { exampleSetup } from "prosemirror-example-setup";
import { inputRules } from "prosemirror-inputrules";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { memo, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import type { Suggestion } from "@/lib/db/schema";
import {
  documentSchema,
  handleTransaction,
  headingRule,
} from "@/lib/editor/config";
import {
  buildContentFromDocument,
  buildDocumentFromContent,
  createDecorations,
} from "@/lib/editor/functions";
import {
  projectWithPositions,
  suggestionsPlugin,
  suggestionsPluginKey,
} from "@/lib/editor/suggestions";

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Suggestion[];
};

function PureEditor({
  content,
  onSaveContent,
  suggestions,
  status,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const { resolvedTheme } = useTheme();
  const [isEditorReady, setIsEditorReady] = useState(false);

  console.log('[TextEditor] Received content:', content?.substring(0, 100), 'Status:', status);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      console.log('[TextEditor] Creating editor with initial content length:', content?.length);
      
      const doc = buildDocumentFromContent(content || "");
      console.log('[TextEditor] Built document with text:', doc?.textContent?.substring(0, 100));
      
      const state = EditorState.create({
        doc,
        plugins: [
          ...exampleSetup({ schema: documentSchema, menuBar: false }),
          inputRules({
            rules: [
              headingRule(1),
              headingRule(2),
              headingRule(3),
              headingRule(4),
              headingRule(5),
              headingRule(6),
            ],
          }),
          suggestionsPlugin,
        ],
      });

      const textColor = resolvedTheme === 'dark' ? '#fafafa' : '#18181b';

      editorRef.current = new EditorView(containerRef.current, {
        state,
        attributes: {
          class: 'ProseMirror-content editor-content',
          spellcheck: 'true',
        },
      });

      // Apply text color immediately after creation
      const applyTextColor = () => {
        if (containerRef.current) {
          const proseMirrorDiv = containerRef.current.querySelector('.ProseMirror');
          if (proseMirrorDiv) {
            const el = proseMirrorDiv as HTMLElement;
            el.style.setProperty('color', textColor, 'important');
            el.style.setProperty('caret-color', textColor, 'important');
            
            console.log('[TextEditor] Applied text color, ProseMirror innerHTML:', el.innerHTML.substring(0, 200));
            console.log('[TextEditor] ProseMirror textContent:', el.textContent?.substring(0, 200));
          }
        }
      };

      // Apply immediately
      applyTextColor();
      
      // Apply again after a short delay to ensure it sticks
      setTimeout(applyTextColor, 50);

      setIsEditorReady(true);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setProps({
        dispatchTransaction: (transaction) => {
          handleTransaction({
            transaction,
            editorRef,
            onSaveContent,
          });
        },
      });
    }
  }, [onSaveContent]);

  useEffect(() => {
    if (editorRef.current && content && isEditorReady) {
      const currentContent = buildContentFromDocument(
        editorRef.current.state.doc
      );

      if (status === "streaming") {
        const newDocument = buildDocumentFromContent(content);

        const transaction = editorRef.current.state.tr.replaceWith(
          0,
          editorRef.current.state.doc.content.size,
          newDocument.content
        );

        transaction.setMeta("no-save", true);
        editorRef.current.dispatch(transaction);

        // Reapply text color after content change
        setTimeout(() => {
          if (containerRef.current) {
            const textColor = resolvedTheme === 'dark' ? '#fafafa' : '#18181b';
            const proseMirrorDiv = containerRef.current.querySelector('.ProseMirror');
            if (proseMirrorDiv) {
              const allElements = proseMirrorDiv.querySelectorAll('*');
              for (const child of allElements) {
                (child as HTMLElement).style.setProperty('color', textColor, 'important');
              }
            }
          }
        }, 50);
        return;
      }

      if (currentContent !== content) {
        const newDocument = buildDocumentFromContent(content);

        const transaction = editorRef.current.state.tr.replaceWith(
          0,
          editorRef.current.state.doc.content.size,
          newDocument.content
        );

        transaction.setMeta("no-save", true);
        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status, isEditorReady, resolvedTheme]);

  useEffect(() => {
    if (editorRef.current?.state.doc && content) {
      const projectedSuggestions = projectWithPositions(
        editorRef.current.state.doc,
        suggestions
      ).filter(
        (suggestion) => suggestion.selectionStart && suggestion.selectionEnd
      );

      const decorations = createDecorations(
        projectedSuggestions,
        editorRef.current
      );

      const transaction = editorRef.current.state.tr;
      transaction.setMeta(suggestionsPluginKey, { decorations });
      editorRef.current.dispatch(transaction);
    }
  }, [suggestions, content]);

  const textColor = resolvedTheme === 'dark' ? '#fafafa' : '#18181b';

  return (
    <div className="relative w-full">
      <div 
        className="prose prose-zinc prose-lg dark:prose-invert relative w-full max-w-none min-h-[100px]" 
        style={{ 
          color: textColor,
          caretColor: textColor,
        }}
        ref={containerRef} 
      />
      {/* Debug overlay - remove after confirming text is visible */}
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Loading editor...
        </div>
      )}
      {/* Debug: Show raw content if editor fails to display it */}
      {isEditorReady && content && (
        <div 
          className="fixed bottom-4 right-4 max-w-sm rounded-lg border border-border bg-background p-4 text-xs opacity-50 shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <div className="font-bold mb-2">Debug: Raw Content Preview</div>
          <div className="max-h-40 overflow-auto text-foreground">
            {content.substring(0, 200)}...
          </div>
          <div className="mt-2 text-muted-foreground">
            Length: {content.length} | Status: {status}
          </div>
        </div>
      )}
    </div>
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  return (
    prevProps.suggestions === nextProps.suggestions &&
    prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
    prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
    !(prevProps.status === "streaming" && nextProps.status === "streaming") &&
    prevProps.content === nextProps.content &&
    prevProps.onSaveContent === nextProps.onSaveContent
  );
}

export const Editor = memo(PureEditor, areEqual);
