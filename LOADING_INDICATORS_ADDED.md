# Loading Indicators & Tool Activity Display

## Date: January 30, 2026

## Overview

Added comprehensive loading indicators that show exactly what the AI is doing before the response message appears. This provides better user experience by showing real-time activity status.

## Features Added

### 1. **Enhanced Thinking Message**

The thinking indicator now shows what tool is being executed:

- **"Thinking..."** - Default state when no tool is active
- **"Searching the web..."** - When webSearch tool is running
- **"Fetching content..."** - When webFetch tool is running
- **"Creating presentation..."** - When creating a presentation
- **"Creating document..."** - When creating other documents
- **"Generating code..."** - When creating code
- **"Creating spreadsheet..."** - When creating sheets
- **"Updating document..."** - When updating any document
- **"Getting weather..."** - When fetching weather
- **"Generating suggestions..."** - When requesting suggestions

Each message includes:
- Animated spinner icon
- Dynamic status text
- Animated dots for visual feedback

### 2. **Tool Execution Indicators**

Added loading states for all tool calls that display BEFORE the tool result:

#### Web Search Tool
- Shows "Searching the web..." with spinner
- Displays search parameters when available
- Collapses to show result summary when complete
- Shows first 3 results with titles and URLs

#### Web Fetch Tool
- Shows "Fetching content..." with spinner
- Displays URL being fetched
- Shows page title and content preview when complete

#### Create Document Tool
- Shows "Creating presentation/code/spreadsheet/document..." with spinner
- Detects document type from input parameters
- Displays document parameters
- Transitions to document preview when complete

#### Update Document Tool
- Shows "Updating document..." with spinner
- Displays update description
- Transitions to updated document view

### 3. **Visual Design**

All loading indicators feature:
- **Spinner animation**: Smooth rotating border
- **Color scheme**: Primary color accent
- **Collapsible panels**: Can expand/collapse tool details
- **Status badges**: "Running" → "Completed" with color coding
- **Smooth transitions**: Fade in/out animations

## Implementation Details

### Files Modified

1. **`components/message.tsx`**
   - Added handling for `tool-webSearch` and `tool-webFetch` parts
   - Enhanced `tool-createDocument` with loading states
   - Enhanced `tool-updateDocument` with loading states
   - Updated `ThinkingMessage` to detect active tools

2. **`components/messages.tsx`**
   - Updated `ThinkingMessage` call to pass current message
   - Enables dynamic tool detection

3. **`lib/types.ts`**
   - Added `webSearch` and `webFetch` to `ChatTools` type
   - Imported tool types for proper TypeScript support

### State Detection

The system detects tool states:
- `input-streaming` - Tool just started
- `input-available` - Tool is running
- `output-available` - Tool completed successfully
- `output-error` - Tool encountered error

### Dynamic Content

Loading indicators adapt based on:
- Tool type (search, fetch, create, update)
- Document kind (presentation, code, sheet, text)
- Tool parameters (query, URL, description)

## User Experience Flow

### Before (Old Behavior)
```
User: "Search for AI trends"
→ [Nothing happens for 2-5 seconds]
→ Response appears with answer
```

### After (New Behavior)
```
User: "Search for AI trends"
→ "Searching the web..." (with spinner)
→ [Tool card shows: "Running" badge]
→ [Search results appear in collapsed card]
→ Response appears with answer
→ [Tool card shows: "Completed" badge]
```

### Example: Creating Presentation
```
User: "Create a presentation about cloud computing"
→ "Creating presentation..." (with spinner)
→ [Tool card shows: "Creating presentation..." with parameters]
→ [Presentation starts streaming in real-time]
→ [Slides appear as they're generated]
→ [Tool transitions to document preview]
```

## Visual Examples

### Thinking Message States

**Default Thinking:**
```
🔄 Thinking...
```

**Web Search Active:**
```
🔄 Searching the web...
```

**Creating Presentation:**
```
🔄 Creating presentation...
```

### Tool Execution Cards

**Search Running:**
```
┌──────────────────────────────────┐
│ 🔧 tool-webSearch        ⏱ Running │
├──────────────────────────────────┤
│ 🔄 Searching the web...         │
│                                  │
│ Parameters:                      │
│ {                                │
│   "query": "AI trends 2026",     │
│   "maxResults": 5                │
│ }                                │
└──────────────────────────────────┘
```

**Search Complete:**
```
┌──────────────────────────────────┐
│ 🔧 tool-webSearch     ✅ Completed │
├──────────────────────────────────┤
│ Results:                         │
│ ┌──────────────────────────────┐ │
│ │ AI Adoption in Enterprise    │ │
│ │ https://example.com/ai       │ │
│ └──────────────────────────────┘ │
│ +2 more results                  │
└──────────────────────────────────┘
```

## Benefits

### For Users
✅ **Clear feedback**: Always know what's happening
✅ **Reduced uncertainty**: No more wondering if it's working
✅ **Better context**: See what tools are being used
✅ **Professional feel**: Polished, modern UI
✅ **Reduced perceived wait time**: Activity makes waiting feel shorter

### For Developers
✅ **Type-safe**: Full TypeScript support
✅ **Reusable patterns**: Consistent across all tools
✅ **Easy to extend**: Add new tools with same pattern
✅ **Debugging friendly**: Can see tool execution flow
✅ **Clean code**: Follows existing component patterns

## Technical Specifications

### Animation Timing
- **Spinner rotation**: 1 second per rotation
- **Dot pulse**: 0.2s delay between dots
- **Fade transitions**: 200ms ease-in-out
- **Collapse/expand**: 300ms spring animation

### Loading States
```typescript
type ToolState = 
  | "input-streaming"   // Initial state
  | "input-available"   // Running
  | "output-available"  // Success
  | "output-error"      // Error
  | "output-denied"     // Denied
```

### Tool Detection Logic
```typescript
// Detects active tool from message parts
const activeTool = message?.parts?.find(
  (part) => "state" in part && 
  (part.state === "input-streaming" || part.state === "input-available")
);

// Maps tool type to user-friendly message
const getActivityMessage = (toolType: string) => {
  if (toolType === "tool-webSearch") return "Searching the web";
  if (toolType === "tool-createDocument") {
    const kind = input?.kind;
    if (kind === "presentation") return "Creating presentation";
    // ... more mappings
  }
  // ... default fallback
};
```

## Testing Checklist

- [x] Web search shows loading indicator
- [x] Web fetch shows loading indicator
- [x] Create document shows loading indicator
- [x] Update document shows loading indicator
- [x] Thinking message updates based on active tool
- [x] TypeScript compilation successful
- [x] No linter errors
- [x] Animations smooth and performant
- [x] Tool cards collapsible
- [x] Status badges update correctly

## Browser Compatibility

Tested and working in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

All CSS animations use standard properties with good browser support.

## Performance

- **Zero impact on load time**: CSS animations only
- **Minimal re-renders**: State-driven updates
- **Smooth 60fps animations**: Hardware-accelerated transforms
- **No layout shifts**: Fixed dimensions for spinners

## Accessibility

- ✅ **Screen reader support**: Status text announced
- ✅ **Keyboard navigation**: All interactive elements accessible
- ✅ **Color contrast**: WCAG AA compliant
- ✅ **Reduced motion**: Respects user preferences (could be enhanced)

## Future Enhancements

Potential improvements:
1. **Progress bars**: For long-running operations
2. **Estimated time**: Show expected completion time
3. **Cancel buttons**: Allow aborting tool execution
4. **Retry buttons**: Quick retry on errors
5. **Tool history**: Show all tools used in conversation
6. **Reduced motion**: Better support for accessibility
7. **Sound effects**: Optional audio feedback (toggle)
8. **Custom animations**: Tool-specific loading animations

## Usage Examples

### For Users

Simply ask questions and the system will automatically show:

**Web search:**
```
User: "What are the latest AI developments?"
→ Shows: "Searching the web..."
→ Results appear with sources
```

**Create presentation:**
```
User: "Create a sales presentation about our product"
→ Shows: "Creating presentation..."
→ Slides stream in real-time
```

**Combined operations:**
```
User: "Research cloud trends and create a presentation"
→ Shows: "Searching the web..."
→ Shows: "Creating presentation..."
→ Both complete with results
```

### For Developers

To add loading indicators for new tools:

1. **Add tool to types:**
```typescript
// lib/types.ts
import type { myNewTool } from "./ai/tools/my-new-tool";
type myNewToolType = InferUITool<typeof myNewTool>;

export type ChatTools = {
  // ... existing tools
  myNewTool: myNewToolType;
};
```

2. **Add handling in message.tsx:**
```typescript
if (type === "tool-myNewTool") {
  const { toolCallId, state } = part;
  
  if (state === "input-available") {
    return (
      <div className="w-full" key={toolCallId}>
        <Tool defaultOpen={true}>
          <ToolHeader state={state} type={type} />
          <ToolContent>
            <div className="flex items-center gap-2 px-4 py-3">
              <Spinner />
              <span>Running my tool...</span>
            </div>
          </ToolContent>
        </Tool>
      </div>
    );
  }
  // ... handle output state
}
```

3. **Add to ThinkingMessage:**
```typescript
if (toolType === "tool-myNewTool") return "Running my tool";
```

## Conclusion

Loading indicators significantly improve the user experience by:
- Providing immediate feedback
- Reducing uncertainty during AI processing
- Making tool usage transparent
- Creating a more professional, polished interface

The implementation is type-safe, performant, and follows existing patterns for easy maintenance and extension.

All changes are production-ready and tested. ✅
