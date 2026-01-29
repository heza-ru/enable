"use client";

import { type Document, get, getAll, put, STORES } from "./indexeddb";

/**
 * Save or update a document
 */
export async function saveDocument(document: {
  id: string;
  title: string;
  content: string;
  kind: string;
  userId: string;
}): Promise<Document> {
  const existing = await get<Document>(STORES.DOCUMENTS, document.id);

  const fullDocument: Document = {
    ...document,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  await put(STORES.DOCUMENTS, fullDocument);
  return fullDocument;
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  return await get<Document>(STORES.DOCUMENTS, id);
}

/**
 * Get all documents with matching ID (for versioning)
 */
export async function getDocumentsById(id: string): Promise<Document[]> {
  const doc = await getDocumentById(id);
  return doc ? [doc] : [];
}

/**
 * Get all documents
 */
export async function getAllDocuments(): Promise<Document[]> {
  return await getAll<Document>(STORES.DOCUMENTS);
}

/**
 * Delete documents by ID after timestamp
 */
export async function deleteDocumentsByIdAfterTimestamp(
  id: string,
  timestamp: Date
): Promise<number> {
  // For now, just delete the document if it was updated after the timestamp
  const doc = await getDocumentById(id);
  if (doc && doc.updatedAt > timestamp.getTime()) {
    await put(STORES.DOCUMENTS, { ...doc, content: "", updatedAt: Date.now() });
    return 1;
  }
  return 0;
}
