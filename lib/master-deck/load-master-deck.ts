import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Load master deck reference content for AI presentation generation
 * This reads the markdown files containing your company's presentation standards
 */

export function loadMasterDeckReference(): string {
  try {
    const masterDeckDir = join(process.cwd(), "lib", "master-deck");

    // Read all master deck template files
    const structure = readFileSync(
      join(masterDeckDir, "master-deck-structure.md"),
      "utf-8"
    );
    const templates = readFileSync(
      join(masterDeckDir, "slide-templates.md"),
      "utf-8"
    );
    const visuals = readFileSync(
      join(masterDeckDir, "visual-guidelines.md"),
      "utf-8"
    );
    const messaging = readFileSync(
      join(masterDeckDir, "messaging-framework.md"),
      "utf-8"
    );

    // Combine into a single reference document
    return `
# MASTER DECK REFERENCE - USE THIS AS YOUR GUIDE

When generating presentations, follow these company standards exactly:

${structure}

${templates}

${visuals}

${messaging}

## IMPORTANT INSTRUCTIONS:
- Use the slide structures defined above
- Follow the messaging framework for all content
- Apply the visual guidelines (icons, colors, formatting)
- Reference the templates for each slide type
- Maintain consistency with company standards
- Use approved terminology only
- Include speaker notes as shown in templates

If the master deck content above contains [bracketed placeholders], it means the templates haven't been customized yet. In that case, use general best practices for professional presentations.
`.trim();
  } catch (error) {
    // If master deck files don't exist or can't be read, return empty string
    // The AI will fall back to general presentation best practices
    console.warn(
      "[Master Deck] Could not load master deck reference:",
      error
    );
    return "";
  }
}

/**
 * Check if master deck has been customized
 * Returns true if the user has replaced the template placeholders
 */
export function isMasterDeckCustomized(): boolean {
  try {
    const structure = readFileSync(
      join(process.cwd(), "lib", "master-deck", "master-deck-structure.md"),
      "utf-8"
    );

    // If still contains many template placeholders, it's not customized
    const placeholderCount = (structure.match(/\[Add your/g) || []).length;
    return placeholderCount < 3; // Allow a few placeholders
  } catch {
    return false;
  }
}

/**
 * Get a summary of available master deck content
 */
export function getMasterDeckSummary(): {
  hasStructure: boolean;
  hasTemplates: boolean;
  hasVisuals: boolean;
  hasMessaging: boolean;
  isCustomized: boolean;
} {
  try {
    const masterDeckDir = join(process.cwd(), "lib", "master-deck");

    return {
      hasStructure: Boolean(
        readFileSync(join(masterDeckDir, "master-deck-structure.md"), "utf-8")
      ),
      hasTemplates: Boolean(
        readFileSync(join(masterDeckDir, "slide-templates.md"), "utf-8")
      ),
      hasVisuals: Boolean(
        readFileSync(join(masterDeckDir, "visual-guidelines.md"), "utf-8")
      ),
      hasMessaging: Boolean(
        readFileSync(join(masterDeckDir, "messaging-framework.md"), "utf-8")
      ),
      isCustomized: isMasterDeckCustomized(),
    };
  } catch {
    return {
      hasStructure: false,
      hasTemplates: false,
      hasVisuals: false,
      hasMessaging: false,
      isCustomized: false,
    };
  }
}
