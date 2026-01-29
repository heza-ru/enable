/**
 * Structured output templates for Enable
 * These templates help generate formatted content for specific use cases
 */

export type TemplateCategory =
  | "presentations"
  | "emails"
  | "demos"
  | "technical";

export interface OutputTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  prompt: string;
  icon: string;
}

export const STRUCTURED_TEMPLATES: OutputTemplate[] = [
  // Presentations
  {
    id: "slide-deck",
    name: "Slide Deck Outline",
    category: "presentations",
    description: "Create a presentation outline with slides",
    icon: "presentation",
    prompt: `Create a presentation slide deck outline for this topic. Format it as:

**Slide [Number]: [Title]**
- Key Point 1
- Key Point 2
- Key Point 3
[Speaker Notes: what to say]

Make it compelling, visual-friendly, and story-driven. Include 8-12 slides.`,
  },
  {
    id: "value-prop",
    name: "Value Proposition",
    category: "presentations",
    description: "Generate a customer-specific value prop",
    icon: "target",
    prompt: `Create a compelling value proposition for this customer/use case. Structure it as:

**The Challenge:**
[What problem are they facing?]

**Our Solution:**
[How Whatfix addresses it]

**Business Impact:**
- Metric 1: [Quantified benefit]
- Metric 2: [Quantified benefit]
- Metric 3: [Quantified benefit]

**Why Whatfix:**
[3-5 differentiators]

Keep it concise and business-focused.`,
  },

  // Emails
  {
    id: "follow-up-email",
    name: "Follow-Up Email",
    category: "emails",
    description: "Draft a professional follow-up email",
    icon: "mail",
    prompt: `Write a professional follow-up email after a demo/meeting. Include:

**Subject:** [Compelling subject line]

**Body:**
- Thank them for their time
- Recap key discussion points
- Highlight 2-3 key value points that resonated
- Clear next steps
- Call to action

Keep it warm, professional, and action-oriented. Max 200 words.`,
  },
  {
    id: "proposal-email",
    name: "Proposal Email",
    category: "emails",
    description: "Create a proposal/pricing email",
    icon: "file-text",
    prompt: `Draft a proposal email that presents pricing/next steps. Structure:

**Subject:** [Clear and professional]

**Opening:**
[Warm greeting, reference to previous discussions]

**Proposal Summary:**
- Scope: [What's included]
- Timeline: [Implementation roadmap]
- Investment: [Pricing framework - keep high level]

**Value Reminder:**
[2-3 key benefits specific to their needs]

**Next Steps:**
[Clear call to action]

Professional tone, consultative approach.`,
  },

  // Demos
  {
    id: "demo-script",
    name: "Demo Script",
    category: "demos",
    description: "Generate a demo flow and talking points",
    icon: "play",
    prompt: `Create a demo script with this structure:

**Demo Flow: [Use Case Title]**

**Opening (2 min):**
- Hook: [Compelling opening statement]
- Agenda: [What we'll cover]

**Scene 1: [Feature/Flow Name] (5 min)**
- Setup: [Context]
- Demo: [What to show]
- Talk track: [What to say]
- Value point: [Why it matters]

**Scene 2: [Feature/Flow Name] (5 min)**
[Same structure]

**Wrap-up (2 min):**
- Key takeaways
- Next steps

Keep it story-driven and customer-centric. Total: 15 min.`,
  },
  {
    id: "objection-handling",
    name: "Objection Response",
    category: "demos",
    description: "Handle common objections",
    icon: "shield",
    prompt: `Address this objection/concern professionally. Structure:

**Objection:**
[Restate their concern clearly]

**Acknowledge:**
[Show you understand their perspective]

**Reframe:**
[Provide context or a different angle]

**Evidence:**
- Customer example / case study
- Specific feature/capability
- ROI data (if applicable)

**Close:**
[Turn it into a positive, propose next step]

Be empathetic, data-driven, and solution-focused.`,
  },

  // Technical
  {
    id: "poc-plan",
    name: "POC Plan",
    category: "technical",
    description: "Create a technical POC plan",
    icon: "clipboard",
    prompt: `Create a POC (Proof of Concept) plan. Format:

**POC Scope & Objectives**
- Goal: [What we're proving]
- Success criteria: [Measurable outcomes]
- Duration: [Timeline]

**Technical Requirements**
- Systems/integrations needed
- Access requirements
- Data/content needed

**Implementation Plan**
Week 1: [Milestones]
Week 2: [Milestones]
Week 3: [Milestones]

**Deliverables**
- [Specific outputs]

**Risks & Mitigation**
- Risk 1 → Mitigation
- Risk 2 → Mitigation

Be specific and realistic.`,
  },
  {
    id: "technical-walkthrough",
    name: "Technical Walkthrough",
    category: "technical",
    description: "Create implementation guide",
    icon: "code",
    prompt: `Create a technical implementation walkthrough:

**Overview**
[What we're implementing and why]

**Prerequisites**
- System requirements
- Access needed
- Tools/credentials

**Step-by-Step Instructions**

**Step 1: [Action]**
- What to do
- Expected result
- Troubleshooting tip

**Step 2: [Action]**
[Same structure]

**Validation**
- How to verify it's working
- Key metrics to check

**Next Steps**
[What comes after]

Be clear, detailed, and include screenshots/examples if relevant.`,
  },
];

export function getTemplatesByCategory(
  category: TemplateCategory
): OutputTemplate[] {
  return STRUCTURED_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): OutputTemplate | undefined {
  return STRUCTURED_TEMPLATES.find((t) => t.id === id);
}
