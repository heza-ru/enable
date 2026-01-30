"use client";

import { useTheme } from "next-themes";
import { parse, unparse } from "papaparse";
import { memo, useEffect, useMemo, useState } from "react";
import DataGrid, { textEditor } from "react-data-grid";
import { cn } from "@/lib/utils";

import "react-data-grid/lib/styles.css";

type SheetEditorProps = {
  content: string;
  saveContent: (content: string, isCurrentVersion: boolean) => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  status: string;
};

const MIN_ROWS = 50;
const MIN_COLS = 26;

const PureSpreadsheetEditor = ({ content, saveContent }: SheetEditorProps) => {
  const { resolvedTheme } = useTheme();

  const parseData = useMemo(() => {
    console.log("[SpreadsheetEditor] Parsing content:", {
      contentLength: content?.length,
      contentPreview: content?.substring(0, 100),
      hasContent: !!content,
    });

    if (!content || content.trim() === "") {
      console.log("[SpreadsheetEditor] No content provided, using empty grid");
      return new Array(MIN_ROWS).fill(new Array(MIN_COLS).fill(""));
    }

    try {
      const result = parse<string[]>(content, { 
        skipEmptyLines: true,
        delimiter: ",",
        header: false,
      });

      console.log("[SpreadsheetEditor] Parse result:", {
        rowCount: result.data.length,
        firstRow: result.data[0],
        errors: result.errors,
      });

      if (result.errors.length > 0) {
        console.error("[SpreadsheetEditor] Parse errors:", result.errors);
      }

      if (!result.data || result.data.length === 0) {
        console.warn("[SpreadsheetEditor] No data parsed from content");
        return new Array(MIN_ROWS).fill(new Array(MIN_COLS).fill(""));
      }

      const paddedData = result.data.map((row) => {
        const paddedRow = [...row];
        while (paddedRow.length < MIN_COLS) {
          paddedRow.push("");
        }
        return paddedRow;
      });

      while (paddedData.length < MIN_ROWS) {
        paddedData.push(new Array(MIN_COLS).fill(""));
      }

      console.log("[SpreadsheetEditor] Final padded data rows:", paddedData.length);
      return paddedData;
    } catch (error) {
      console.error("[SpreadsheetEditor] Error parsing CSV:", error);
      return new Array(MIN_ROWS).fill(new Array(MIN_COLS).fill(""));
    }
  }, [content]);

  const columns = useMemo(() => {
    const rowNumberColumn = {
      key: "rowNumber",
      name: "",
      frozen: true,
      width: 50,
      renderCell: ({ rowIdx }: { rowIdx: number }) => rowIdx + 1,
      cellClass: "border-t border-r dark:bg-zinc-950 dark:text-zinc-50",
      headerCellClass: "border-t border-r dark:bg-zinc-900 dark:text-zinc-50",
    };

    const dataColumns = Array.from({ length: MIN_COLS }, (_, i) => ({
      key: i.toString(),
      name: String.fromCharCode(65 + i),
      renderEditCell: textEditor,
      width: 120,
      cellClass: cn("border-t dark:bg-zinc-950 dark:text-zinc-50", {
        "border-l": i !== 0,
      }),
      headerCellClass: cn("border-t dark:bg-zinc-900 dark:text-zinc-50", {
        "border-l": i !== 0,
      }),
    }));

    return [rowNumberColumn, ...dataColumns];
  }, []);

  const initialRows = useMemo(() => {
    const rows = parseData.map((row, rowIndex) => {
      const rowData: any = {
        id: rowIndex,
        rowNumber: rowIndex + 1,
      };

      columns.slice(1).forEach((col, colIndex) => {
        rowData[col.key] = row[colIndex] || "";
      });

      return rowData;
    });

    console.log("[SpreadsheetEditor] Generated rows:", {
      rowCount: rows.length,
      firstRow: rows[0],
      hasData: rows.some((row, idx) => 
        Object.values(row).some(val => val !== "" && val !== idx + 1)
      ),
    });

    return rows;
  }, [parseData, columns]);

  const [localRows, setLocalRows] = useState(initialRows);

  useEffect(() => {
    setLocalRows(initialRows);
  }, [initialRows]);

  const generateCsv = (data: any[][]) => {
    return unparse(data);
  };

  const handleRowsChange = (newRows: any[]) => {
    setLocalRows(newRows);

    const updatedData = newRows.map((row) => {
      return columns.slice(1).map((col) => row[col.key] || "");
    });

    const newCsvContent = generateCsv(updatedData);
    saveContent(newCsvContent, true);
  };

  console.log("[SpreadsheetEditor] Rendering with:", {
    rowCount: localRows.length,
    columnCount: columns.length,
    theme: resolvedTheme,
  });

  return (
    <div className="size-full overflow-hidden">
      <DataGrid
        className={cn(
          resolvedTheme === "dark" ? "rdg-dark" : "rdg-light"
        )}
        columns={columns}
        defaultColumnOptions={{
          resizable: true,
          sortable: true,
        }}
        enableVirtualization
        onCellClick={(args) => {
          if (args.column.key !== "rowNumber") {
            args.selectCell(true);
          }
        }}
        onRowsChange={handleRowsChange}
        rows={localRows}
        style={{ 
          height: "100%", 
          width: "100%",
          blockSize: "100%",
          inlineSize: "100%",
        }}
      />
    </div>
  );
};

function areEqual(prevProps: SheetEditorProps, nextProps: SheetEditorProps) {
  return (
    prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
    prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
    !(prevProps.status === "streaming" && nextProps.status === "streaming") &&
    prevProps.content === nextProps.content &&
    prevProps.saveContent === nextProps.saveContent
  );
}

export const SpreadsheetEditor = memo(PureSpreadsheetEditor, areEqual);
