import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: return as-is (will be sanitized on client)
    return dirty;
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text input (strips all HTML)
 */
export function sanitizeText(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic escaping
    return dirty
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize user input for chat messages
 */
export function sanitizeChatInput(input: string): string {
  // Remove potentially dangerous patterns
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");

  // Trim excessive whitespace
  sanitized = sanitized.trim();

  // Limit length to prevent abuse
  const MAX_LENGTH = 10_000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized;
}

/**
 * Validate and sanitize API key format
 */
export function sanitizeApiKey(key: string): string | null {
  // Remove whitespace
  const trimmed = key.trim();

  // Basic validation: should be alphanumeric with some special chars
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return null;
  }

  // Reasonable length check (Claude API keys are typically 40-60 chars)
  if (trimmed.length < 20 || trimmed.length > 100) {
    return null;
  }

  return trimmed;
}
