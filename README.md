<h1 align="center">enable</h1>

<p align="center">
    A free, secure AI assistant for professionals. Powered by Claude API with client-side architecture.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#security"><strong>Security</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a>
</p>
<br/>

## Features

### Core Capabilities
- **Claude 4.5 Integration** - Direct API access to Claude Sonnet 4.5, Haiku 4.5, and Opus 4.5
- **Client-Side First** - No server-side API key storage, all data stored locally in IndexedDB
- **Cost Tracking** - Real-time token counting and cost estimation per message, chat, and session
- **Artifact Support** - Code editor, spreadsheet editor, image generation, and structured outputs
- **Demo Mode** - One-click conversation reset for seamless live demos
- **🌐 Internet Connectivity** - Web search and URL fetching for current information and research
- **📊 Presentation Creation** - AI-powered slide deck generation with visual presentation viewer

### Manus-Level UX
- **Persona Selector** - Solution Consultant, Sales Engineer, or Generic Assistant modes
- **Context Layering** - Pin customer, industry, and scope context to all conversations
- **Prompt Shortcuts** - Quick access to demo scripts, slide outlines, objection handling, competitive comparisons
- **Structured Outputs** - JSON rendering for slides, emails, walkthroughs, and more

### AI-Powered Tools
- **Web Search** - Search the internet for current information, industry trends, and research
- **Web Fetch** - Read and analyze content from specific URLs and documentation
- **Presentation Generator** - Create professional slide decks with master deck template integration
- **Weather Information** - Get current weather data for any location

### Security & Privacy
- **Client-Side API Keys** - Your API keys never leave your browser
- **No Backend Storage** - All chat data stored in IndexedDB (local-first)
- **HTTPS Only** - Secure connections enforced in production
- **Zero Infrastructure Costs** - Free static hosting on Vercel/Netlify

## Getting Started

### 1. Get Your Claude API Key

1. Sign up for an Anthropic account at [console.anthropic.com](https://console.anthropic.com/)
2. Generate an API key from your account settings
3. **Important**: Keep this key secure - it will only be stored in your browser

### 2. Run Enable

On first launch, you'll be prompted to enter your Claude API key. Choose:
- **Memory Only** (recommended for demos): Key is cleared when you close the browser
- **Encrypted Local Storage**: Key persists across sessions, encrypted with Web Crypto API

### 3. Start Chatting

- Select your Claude model (Sonnet 4.5 recommended for demos)
- Choose your persona (Solution Consultant or Sales Engineer)
- Add customer context for personalized responses
- Use prompt shortcuts for common tasks (Cmd/Ctrl + K)

### 4. Use AI-Powered Features

**Internet Research:**
- "Search for latest trends in [industry]"
- "Find information about [company name]"
- "Read this article: [URL]"

**Presentation Creation:**
- "Create a presentation about [topic]"
- "Make a sales deck for [customer]"
- "Generate a 10-slide pitch deck on [subject]"

See [INTERNET_AND_PRESENTATION_FEATURES.md](./INTERNET_AND_PRESENTATION_FEATURES.md) for detailed documentation.

## Security

### API Key Handling
- ✅ Keys stored only in browser memory or encrypted localStorage
- ✅ Keys never sent to any server except api.anthropic.com
- ✅ Auto-clear after 30 minutes of inactivity
- ✅ Manual clear button always available
- ✅ No logging in production

### Data Privacy
- ✅ All chat history stored in IndexedDB (local-first)
- ✅ No server-side database
- ✅ Export/import your data anytime
- ✅ Optional cloud sync (future: Supabase with RLS)

### Cost Transparency
- ✅ Token counts extracted from Claude API responses
- ✅ Costs calculated using official pricing: [claude.com/pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- ✅ Per-message, per-chat, and session totals displayed
- ✅ Export cost reports to CSV

## Running Locally

Enable is a client-side application with **no environment variables required**:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000).

**First time setup:**
1. Open the app in your browser
2. Enter your Claude API key when prompted
3. Start chatting!

## Deployment

Deploy to Vercel (free tier):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**No environment variables needed** - the app is fully client-side!

## Architecture

Enable uses a client-first architecture:
- **Frontend**: Next.js 14 with App Router, React Server Components
- **UI**: shadcn/ui with Tailwind CSS and lucide-react icons
- **AI**: Direct integration with Anthropic's Claude API
- **Storage**: IndexedDB for local-first chat history
- **Deployment**: Static export to Vercel/Netlify free tier

## License

MIT License - See LICENSE file for details.

## Support

For issues, questions, or feature requests, please contact your Whatfix team lead.
