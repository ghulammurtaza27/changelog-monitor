# AI-Powered Changelog Generator

## Technical Decisions & Architecture

### Core Technologies
- **Next.js 14**: Chosen for its server components, file-based routing, and built-in API routes
- **Prisma**: Type-safe database access with great developer experience
- **Google's Gemini AI**: Selected for its code understanding capabilities and cost-effectiveness
- **GitHub API**: Direct access to repository data with comprehensive commit information

### Code Organization
```
src/
├── app/              # Next.js app router
├── services/         # Core business logic
│   ├── github.ts     # GitHub API interactions
│   ├── ai.ts         # AI analysis service
│   └── analysis.ts   # Changelog generation
├── utils/            # Shared utilities
│   ├── timing.ts     # Rate limiting
│   ├── git-analysis  # Git specific helpers
│   └── sanitization  # Data cleaning
└── components/       # React components
```

### Key Design Decisions

1. **Service-Based Architecture**
   - Separated concerns into dedicated services
   - Each service has a single responsibility
   - Makes testing and maintenance easier

2. **Rate Limiting & Performance**
   - Implemented batch processing for commits
   - Added delays between API calls
   - Caching of AI responses for similar patterns

3. **Error Handling & Reliability**
   - Graceful fallbacks for AI analysis
   - Detailed error logging
   - Type-safe database operations

4. **Developer Experience**
   - Clear folder structure
   - Consistent naming conventions
   - Comprehensive type definitions

### AI Tools Used in Development

1. **Cursor**
   - Assisted with code completion
   - Suggested error handling patterns
   - Helped with type definitions


2. **Google's Gemini AI**
   - Powers the changelog analysis
   - Understands code changes
   - Generates human-readable summaries

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/changelog_db"

# GitHub (Required)
GITHUB_TOKEN="your_github_personal_access_token"
# Generate token at: https://github.com/settings/tokens
# Required scopes: repo, read:user

# Google AI (Required)
GEMINI_API_KEY="your_gemini_api_key"
# Get key at: https://makersuite.google.com/app/apikey


### Getting the API Keys

1. **GitHub Token**
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select the `repo` and `read:user` scopes
   - Copy the generated token

2. **Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create or sign in to your Google account
   - Click "Create API Key"
   - Copy the generated key

3. **Database Setup**
   - Install PostgreSQL locally or use a hosted service
   - Create a new database
   - Update the DATABASE_URL with your credentials

### First Time Setup

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```
