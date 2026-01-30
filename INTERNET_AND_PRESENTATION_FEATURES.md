# Internet Connectivity & Presentation Creation Features

This document describes the new capabilities added to Enable for internet browsing and presentation/deck creation.

## 🌐 Internet Connectivity Features

### 1. Web Search Tool

**Purpose**: Search the internet for current information, news, data, research, or any topic.

**When to use**:
- Finding current information not in AI training data
- Researching industry trends and news
- Looking up company information
- Finding statistics and data points
- Researching competitors

**Example queries that trigger web search**:
- "What are the latest trends in digital adoption?"
- "Search for information about [Company Name]"
- "What's happening with AI in healthcare this year?"
- "Find recent news about digital transformation"

**How it works**:
- Uses DuckDuckGo's API (no API key required)
- Returns instant answers, abstracts, and related topics
- Automatically triggered when AI needs current information

### 2. Web Fetch Tool

**Purpose**: Fetch and read content from specific URLs.

**When to use**:
- Reading specific articles or blog posts
- Accessing documentation
- Reviewing company websites
- Extracting content from web pages

**Example queries**:
- "Read this article: https://example.com/article"
- "Summarize the content from [URL]"
- "What does this webpage say about...?"
- "Fetch information from [URL]"

**Features**:
- Extracts main text content from HTML pages
- Includes page title and meta description
- Optional link extraction
- 10-second timeout for responsiveness
- Content truncation for long pages (max 8000 chars)

**Limitations**:
- Only works with HTML web pages
- Cannot access content behind authentication
- Cannot process PDFs, images, or other non-HTML formats

## 📊 Presentation Creation Features

### Create Presentation Tool

**Purpose**: Create professional presentation slides and pitch decks.

**When to use**:
- Creating sales presentations
- Building demo decks
- Preparing pitch decks
- Generating educational slides
- Making business presentations

**Example queries**:
- "Create a presentation about [topic]"
- "Make a sales deck for [customer/industry]"
- "Build a 10-slide presentation on [subject]"
- "Generate a pitch deck for [product/service]"

**Features**:
- Professional slide templates
- Master deck integration (uses company standards if configured)
- Multiple presentation styles:
  - Business (default)
  - Technical
  - Sales
  - Educational
- Customizable slide count (3-20 slides)
- Automatic slide structure:
  - Title slide
  - Agenda
  - Problem/Challenge
  - Solution
  - Benefits
  - Implementation
  - Call to action
- Speaker notes for each slide
- Visual slide viewer with navigation
- Grid view for overview
- Fullscreen presentation mode

**Input parameters**:
- **title**: The presentation title
- **topic**: Main topic or purpose
- **audience** (optional): Target audience
- **keyPoints**: 3-10 key points to cover
- **slideCount**: Number of slides (3-20, default: 8)
- **style**: Presentation style (business/technical/sales/educational)

**Output format**:
Presentations are created in markdown format with special syntax:
```markdown
# Slide Title
- Key point 1
- Key point 2
- Key point 3

Notes: Speaker notes go here

---

# Next Slide Title
...
```

The presentation editor automatically:
- Parses the markdown into visual slides
- Adds navigation controls
- Provides grid view for overview
- Includes speaker notes display
- Supports fullscreen mode
- Adds slide numbers and progress indicators

## 🎯 Persona-Specific Enhancements

### Solution Consultants
The internet browsing capabilities enhance research for:
- Customer background and industry information
- Competitive intelligence
- Industry trends and statistics
- Use cases and success stories
- ROI data and benchmarks

The presentation tool helps create:
- Customer-specific demo decks
- Value proposition presentations
- Proposal slides
- ROI presentations
- Success story decks

### Sales Engineers
The internet browsing capabilities help with:
- Technical documentation research
- Integration guides and API references
- Security and compliance information
- Architecture best practices
- Technical competitive analysis

The presentation tool helps create:
- Technical architecture presentations
- POC planning decks
- Implementation roadmap slides
- Security and compliance presentations
- Technical demo scripts

## 🔧 Technical Implementation

### Tools Added
1. **webSearch** (`lib/ai/tools/web-search.ts`)
   - Uses DuckDuckGo API
   - No API key required
   - Returns structured search results

2. **webFetch** (`lib/ai/tools/web-fetch.ts`)
   - Fetches and parses HTML content
   - Extracts text, title, and description
   - 10-second timeout
   - User-agent spoofing for compatibility

3. **createPresentation** (`lib/ai/tools/create-presentation.ts`)
   - Integrates with master deck system
   - Generates structured presentation requests
   - Supports multiple styles and audiences

### Integration Points
- All tools integrated into chat API route
- Added to experimental_activeTools for automatic use
- Updated system prompts to inform AI of capabilities
- Works with existing artifact system

## 💡 Example Use Cases

### Use Case 1: Research-Enhanced Presentation
**User**: "Create a presentation about digital adoption in healthcare"

**What happens**:
1. AI uses `webSearch` to find current healthcare digital adoption trends
2. AI uses `webFetch` to read relevant articles or reports
3. AI uses `createPresentation` to build a deck incorporating the research
4. User gets a presentation with current data and insights

### Use Case 2: Customer-Specific Demo Deck
**User**: "Make a demo deck for Acme Corp, a manufacturing company"

**What happens**:
1. AI uses `webSearch` to research Acme Corp and manufacturing trends
2. AI uses `webFetch` to read Acme Corp's website for specific information
3. AI uses `createPresentation` with business style for manufacturing audience
4. User gets a customized presentation tailored to the customer

### Use Case 3: Technical Documentation Research
**User**: "Create a technical overview presentation about implementing SSO with Okta"

**What happens**:
1. AI uses `webSearch` to find Okta SSO documentation
2. AI uses `webFetch` to read official Okta integration guides
3. AI uses `createPresentation` with technical style
4. User gets a presentation with accurate, current technical information

## 🚀 Getting Started

### For Users
Simply ask Enable to:
- "Search for..." or "Find information about..."
- "Read this URL..." or "What does [URL] say about..."
- "Create a presentation about..." or "Make a deck for..."

The AI will automatically use the appropriate tools based on your request.

### For Developers
The tools are automatically active for all non-reasoning models. To modify:

1. **Add/modify tools**: Edit files in `lib/ai/tools/`
2. **Change tool activation**: Modify `experimental_activeTools` in `app/(chat)/api/chat/route.ts`
3. **Update prompts**: Edit `lib/ai/prompts.ts` to change AI behavior
4. **Customize master deck**: Edit files in `lib/master-deck/` for company-specific presentation templates

## ⚙️ Configuration

### Master Deck Customization
To use company-specific presentation templates:
1. Edit `lib/master-deck/master-deck-structure.md`
2. Edit `lib/master-deck/slide-templates.md`
3. Edit `lib/master-deck/visual-guidelines.md`
4. Edit `lib/master-deck/messaging-framework.md`

The AI will automatically use these templates when creating presentations.

### Environment Variables
No additional environment variables are required. The web search tool uses DuckDuckGo's free API.

## 🔒 Privacy & Security

- Web search uses DuckDuckGo (privacy-focused)
- No API keys stored or required for web search
- Web fetching uses standard HTTP requests
- No authentication credentials are handled
- Content is truncated to reasonable lengths
- Timeouts prevent hanging requests

## 📝 Limitations & Considerations

### Web Search
- Limited to DuckDuckGo's instant answer results
- Best for general information, not deep research
- Results vary based on query quality

### Web Fetch
- Only works with publicly accessible HTML pages
- Cannot bypass authentication or paywalls
- Cannot process non-HTML content (PDFs, images)
- 10-second timeout may truncate very slow pages

### Presentations
- Generated in markdown format (not PowerPoint files)
- Styling limited to what the presentation editor supports
- No image/chart generation (text and bullet points only)
- Master deck templates must be manually configured

## 🔄 Future Enhancements

Potential improvements:
- Export presentations to PowerPoint format
- Add more search providers (Google, Bing with API keys)
- Support for PDF content extraction
- Image generation for slides
- Chart and diagram creation
- Multi-page web scraping
- Cached search results
- Browser automation with MCP servers
