
# Recipi Book - Comprehensive Analysis

## Project Overview

**Recipi Book** is a dual-platform recipe management application that automatically extracts recipes from YouTube cooking videos using AI. It consists of:
- **Web App**: Next.js 15 (App Router) with Server Components
- **Mobile App**: React Native/Expo with local-first architecture and cloud sync

---

## 1. FEATURES AND IMPLEMENTATION STATUS

### Web App Features (Next.js)

#### Core Features (Implemented)
- **Recipe Extraction from YouTube Videos**
  - Input: YouTube video URL
  - Process: Extract transcript → AI analysis → Structured recipe output
  - Supported languages: Japanese and English (fallback)
  - Error handling for no subtitles, invalid URLs, extraction failures

- **Recipe Display**
  - Shows extracted recipe with title, ingredients, steps, tips, difficulty level
  - Tags, prep/cook times, servings

- **Authentication**
  - Supabase Auth integration
  - OAuth callback handler (`/auth/callback`)
  - Server-side session management using SSR

- **Usage Tracking**
  - Per-user monthly usage limits
  - Free plan: 10 extractions/month
  - Premium plan: 120 extractions/month (月額500円)
  - Stored in `user_usage` table with monthly granularity

- **Feedback Menu**
  - User can provide feedback on the application

#### UI Components
- URL input form with validation
- Recipe detail display component
- User menu and authentication buttons
- Feedback menu

### Mobile App Features (React Native/Expo)

#### Core Features (Implemented)
- **Recipe Extraction** (via API call to Next.js server)
  - Sends YouTube URL to `/api/extract-recipe` endpoint
  - Requires authentication token (Bearer token from Supabase)
  
- **Recipe Management**
  - List all recipes with search and filtering
  - View recipe details
  - Edit recipe metadata (title, servings, etc.)
  - Delete recipes
  - Filter by categories (日本食, 洋食, 中華, 簡単, お気に入り)
  - Support for favorites filtering

- **Shopping List**
  - Add ingredients from recipes to shopping list
  - Group items by recipe source
  - Adjust quantities based on servings
  - Check off completed items
  - Clear completed items
  - Manual item addition (category: "その他")
  - Local storage only (not synced to cloud)

- **Local-First Data Storage**
  - AsyncStorage for offline access
  - Stores recipes locally before sync
  - Supports anonymous usage (no login required)

- **Cloud Sync**
  - Sync local recipes to Supabase on login
  - Bi-directional sync (local ↔ cloud)
  - Automatic sync on app focus (recipe list refresh)
  - Manual sync trigger in settings

- **Authentication**
  - Supabase Auth with multiple providers
  - Google Sign-In (OAuth)
  - Apple Sign-In (native iOS only, currently disabled)
  - Session persistence using AsyncStorage
  - Auto-refresh tokens

- **Usage Tracking**
  - Display remaining monthly extractions
  - Show usage limit based on plan
  - Client-side limit checks before API calls

- **Settings Screen**
  - User profile display (email, user ID)
  - Manual data sync trigger
  - Clear local data option
  - Sign out
  - Version info

---

## 2. ARCHITECTURE AND DEPENDENCIES

### Technology Stack

**Web App (Next.js)**
```json
{
  "next": "^16.1.6",
  "react": "^19.2.4",
  "typescript": "^5.9.3",
  "tailwindcss": "^4.2.1",
  "@supabase/supabase-js": "^2.99.3",
  "@supabase/ssr": "^0.9.0",
  "ai": "^6.0.116",
  "@ai-sdk/amazon-bedrock": "^4.0.77",
  "@ai-sdk/anthropic": "^3.0.58",
  "youtube-caption-extractor": "^1.9.1",
  "zod": "^4.3.6"
}
```

**Mobile App (Expo)**
```json
{
  "expo": "~55.0.5",
  "react": "19.2.0",
  "react-native": "0.83.2",
  "@supabase/supabase-js": "^2.99.3",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "expo-apple-authentication": "^55.0.9",
  "expo-auth-session": "^55.0.9",
  "expo-router": "~55.0.7",
  "nativewind": "^4.2.2",
  "tailwindcss": "^3.4.19"
}
```

### Clean Architecture Layers

```
Presentation (app/, components/, mobile/app)
    ↓
Application (use-cases/)
    ↓
Domain (domain/ - pure TypeScript, framework-agnostic)
    ↑
Infrastructure (infrastructure/ - external service implementations)
```

**Layer Dependencies:**
- **Domain**: No external dependencies (error types, entities, value objects, repository interfaces)
- **Application**: Depends on Domain only (use-cases, DTOs)
- **Infrastructure**: Implements Domain interfaces (YouTube service, AI service, repositories)
- **Presentation**: Uses Application layer via use-cases

### Directory Structure

```
src/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── extract-recipe/route.ts  # POST recipe extraction
│   │   └── usage/route.ts           # GET usage stats
│   ├── auth/callback/route.ts       # Supabase auth callback
│   └── page.tsx                     # Home page
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── features/
│   │   ├── recipe/
│   │   ├── video/
│   │   └── feedback/
│   └── auth/
├── domain/                          # Business logic layer
│   ├── entities/
│   │   ├── recipe.ts
│   │   └── video-transcript.ts
│   ├── value-objects/
│   │   └── youtube-url.ts
│   ├── repositories/
│   │   ├── recipe-extractor.ts
│   │   └── transcript-repository.ts
│   └── errors.ts
├── application/                     # Use-cases
│   ├── use-cases/
│   │   └── extract-recipe.ts
│   └── dto/
│       └── extract-recipe-dto.ts
├── infrastructure/                  # External service implementations
│   ├── services/
│   │   ├── youtube-transcript-service.ts
│   │   └── ai-recipe-extractor.ts
│   └── repositories/
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   └── client.ts
│   ├── usage-limit.ts              # Usage tracking logic
│   └── utils.ts
└── hooks/                           # Custom hooks
```

---

## 3. EXTERNAL SERVICES & INFRASTRUCTURE

### Supabase
**Purpose**: Backend-as-a-Service for authentication, database, and real-time features

**Database Schema:**
```sql
-- recipes table
- id (UUID, Primary Key)
- user_id (UUID, FK → auth.users)
- title, description
- ingredients, steps (JSONB arrays)
- tags, tips (TEXT arrays)
- total_time, prep_time, cook_time, servings
- difficulty (easy/medium/hard)
- channel_name, source_url
- created_at, updated_at (timestamps)

-- user_usage table
- user_id (UUID, Primary Key, FK → auth.users)
- month (TEXT, format: YYYY-MM)
- extraction_count (INTEGER)
- plan (TEXT: 'free' or 'premium')
- created_at, updated_at (timestamps)
- Unique constraint: (user_id, month)

-- RLS Policies: Users can only access their own data
-- Functions: increment_extraction_count() - increments monthly usage
```

**Features Used:**
- OAuth authentication (Google, Apple)
- Session management (cookies/tokens)
- Row-Level Security (RLS) for data isolation
- Custom PostgreSQL functions for usage counting
- Triggers for updated_at auto-update

**Configuration:**
```
NEXT_PUBLIC_SUPABASE_URL: https://iufkqhfentcctrrbcecn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY: sb_publishable_PWKvNYr-TAoqMIqpVfjsGA_lDVwulcO
SUPABASE_SERVICE_ROLE_KEY: (required for server-side operations)
```

### YouTube Data Services

**Service**: `youtube-caption-extractor` npm package
- Extracts video transcripts/subtitles
- Tries Japanese (ja) first, falls back to English (en)
- Gets video title, description, and subtitle segments
- No API key required (uses public YouTube APIs)

### AI Recipe Extraction

**Service**: AWS Bedrock + Anthropic Claude

**Implementation**: 
- Model: `claude-haiku-4-5-20251001-v1:0` via Amazon Bedrock
- Uses Vercel's `ai` SDK with Bedrock provider
- `generateObject()` for structured recipe output

**Prompt Engineering:**
- System prompt in Japanese and English
- Input: video title + description + transcript
- Output: Recipe object with schema validation (Zod)

**Extracted Data:**
```typescript
{
  title, description
  servings, prepTime, cookTime, totalTime
  ingredients: [{ name, amount, unit?, notes? }]
  steps: [{ stepNumber, text, duration? }]
  tips?, tags?, difficulty?
}
```

---

## 4. API ROUTES (Next.js Server)

### POST /api/extract-recipe
**Purpose**: Extract recipe from YouTube URL (called by mobile app and web server action)

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Recipe Title",
    "ingredients": [...],
    "steps": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    ...
  }
}
```

**Error Handling:**
- `InvalidYouTubeUrlError` → "有効なYouTube URLを入力してください。"
- `VideoNotFoundError` → "動画が見つかりませんでした。URLを確認してください。"
- `TranscriptNotAvailableError` → "この動画には字幕がありません。字幕付きの動画をお試しください。"
- `ExtractionFailedError` → "レシピの抽出に失敗しました。もう一度お試しください。"

**Note:** Does NOT check usage limits (mobile app checks before calling)

### GET /api/usage
**Purpose**: Get current user's monthly usage stats

**Headers:**
```
Authorization: Bearer <supabase_access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "remaining": 5,
    "limit": 10,
    "used": 5,
    "plan": "free"
  }
}
```

**Authentication:** Requires valid Supabase token
- Validates token using Supabase Service Role Key
- Returns 401 if invalid

### GET /auth/callback
**Purpose**: Handle Supabase OAuth callback

**Flow:**
1. User completes OAuth (Google/Apple)
2. Redirected to this endpoint with authorization code
3. Exchange code for session
4. Redirect to home page

---

## 5. MOBILE APP - API INTEGRATION

### How Mobile App Uses Next.js Server

**API Endpoint Construction:**
```typescript
const API_BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL || "http://localhost:3002"
  : "https://your-production-url.com"
```

**Recipe Extraction Flow (Mobile):**
1. User enters YouTube URL in UrlInputForm
2. `useExtractRecipe` hook:
   - Checks user authentication status
   - Calls `checkUsageLimitClient()` to verify remaining extractions
   - If limit reached: Shows error "今月の抽出回数の上限に達しました"
   - If allowed: Sends POST to `${API_BASE_URL}/api/extract-recipe`
   - Includes Bearer token if authenticated
   - On success: Increments usage count via Supabase RPC
   - Saves recipe to local storage or Supabase

**Dependencies:**
- Requires Next.js server running at configured API_BASE_URL
- For development: Typically http://localhost:3000 (must be configured in .env.local)
- For production: Hardcoded in constants.ts (currently placeholder)

### Local vs. Cloud Storage (Mobile)

**Unauthenticated Users:**
- All recipes stored in AsyncStorage
- No sync capability
- Shopping list stored locally only
- Usage tracking disabled (unlimited extractions)

**Authenticated Users:**
- Recipe extraction synced to Supabase immediately via API call
- Local recipes synced to Supabase on login
- Subsequent fetches pull from Supabase cloud
- Shopping list remains local-only (not synced)

**Sync Mechanism:**
```typescript
// Automatic sync on login
useAuth() → SIGNED_IN event → syncLocalToSupabase()

// Manual sync in settings
Settings → "データを同期" → syncLocalToSupabase(localRecipes, userId)

// Sync function: upserts all local recipes to Supabase with conflict resolution
```

---

## 6. AUTHENTICATION FLOW

### Web App (Next.js)

**OAuth Providers:**
- Google (via Supabase)
- (Apple disabled in code - marked for future use)

**Flow:**
1. User clicks "Sign In with Google"
2. Redirected to Supabase auth UI
3. Completes Google OAuth
4. Redirected to `/auth/callback?code=xxx`
5. Server exchanges code for session
6. Session stored in cookies
7. Redirected to home page

**Session Management:**
- Uses `@supabase/ssr` for cookie-based sessions
- Server Component access via `createClient()`
- Client Component access via client context

### Mobile App (React Native/Expo)

**Google Sign-In:**
```typescript
// expo-web-browser + expo-auth-session
WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
→ Extract tokens from callback URL
→ supabase.auth.setSession({ access_token, refresh_token })
→ Listen to onAuthStateChange event
→ Trigger automatic sync
```

**Apple Sign-In (iOS only):**
```typescript
// expo-apple-authentication
AppleAuthentication.signInAsync()
→ Get identityToken
→ supabase.auth.signInWithIdToken({ provider: 'apple', token })
→ Wait 300ms for state propagation
→ Trigger automatic sync
```

**Session Persistence:**
```typescript
// AsyncStorage persistence layer
createClient(supabaseUrl, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true
  }
})
```

**Auth State Hook (`useAuth`):**
```typescript
- Initializes session from AsyncStorage
- Listens to onAuthStateChange events
- On SIGNED_IN: Syncs local recipes to Supabase in background
- Provides: user, session, isLoading, signOut()
```

---

## 7. MONETIZATION MODEL

### Pricing Structure

**Free Plan:**
- 10 extractions per month
- All features (create, edit, delete recipes)
- Local storage + cloud sync
- Access to mobile and web apps

**Premium Plan:**
- 120 extractions per month
- Price: 月額500円 (¥500/month, ~$3.50 USD)
- Same features as free plan, just higher limits

### Usage Tracking Implementation

**Tracking Logic:**
- Monthly granularity (resets on 1st of each month)
- Stored in `user_usage` table with format: `YYYY-MM`
- Unique constraint on (user_id, month)
- Incremented via PostgreSQL function: `increment_extraction_count()`

**Client-Side Checks (Mobile):**
```typescript
checkUsageLimitClient() → queries user_usage table
→ Returns: boolean (remaining > 0)
```

**Server-Side Checks (Web):**
```typescript
checkUsageLimit() → queries user_usage table
→ Returns: { allowed, remaining, limit, plan }
```

**Billing/Payment:**
- **NOT IMPLEMENTED**: No payment processing found in code
- No Stripe, Paddle, or other payment gateway integration
- Plan assignment appears manual (database insert with plan='free' or 'premium')
- No subscription management or auto-renewal logic

### Current Limitations

**Not Monetized Yet:**
1. No payment processing (Stripe/Paddle/RevenueCat integration)
2. No subscription management UI
3. No upgrade flow from free to premium
4. Premium plan limit hardcoded (120/month) - no configuration
5. No invoice generation
6. No analytics on premium conversion

---

## 8. DOMAIN ENTITIES & TYPES

### Recipe Entity
```typescript
type Recipe = {
  id: string
  title: string
  description?: string
  servings?: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  ingredients: Ingredient[]
  steps: Step[]
  tips?: string[]
  tags?: string[]
  difficulty?: "easy" | "medium" | "hard"
  sourceUrl: string
  thumbnailUrl?: string
  channelName?: string
  language: "ja" | "en"
  createdAt: Date
  // Mobile additions:
  category?: string
  isFavorite?: boolean
}
```

### Video Transcript Entity
```typescript
type VideoTranscript = {
  videoId: string
  title: string
  description: string
  language: "ja" | "en"
  segments: Array<{
    text: string
    start: number
    duration: number
  }>
  fullText: string
}
```

### Shopping List (Mobile Only)
```typescript
type ShoppingItem = {
  id: string
  recipeId: string
  recipeTitle: string
  ingredientName: string
  amount: string
  unit?: string
  checked: boolean
  servings?: number
}

type ShoppingGroup = {
  recipeId: string
  recipeTitle: string
  servings?: number
  items: ShoppingItem[]
}
```

---

## 9. CURRENT STATUS & GAPS

### Fully Implemented
✅ Recipe extraction from YouTube (AI-powered)
✅ Web interface (Next.js)
✅ Mobile app (React Native/Expo)
✅ Supabase authentication (Google, Apple sign-in)
✅ Cloud database (recipes, user usage)
✅ Usage tracking & limits (free/premium plans)
✅ Local offline storage (mobile)
✅ Local→Cloud sync (mobile)
✅ Recipe CRUD operations (create, read, update, delete)
✅ Shopping list feature (mobile, local only)
✅ Feedback mechanism

### Partially Implemented
⚠️ Premium plan (hardcoded limits, no payment system)
⚠️ Recipe categorization (code references categories but not stored)
⚠️ Recipe favorites (code references isFavorite but not persisted)

### Not Implemented
❌ Payment processing (Stripe, Paddle, RevenueCat)
❌ Premium upgrade flow
❌ Subscription management UI
❌ Usage analytics dashboard
❌ Admin panel for plan management
❌ Email notifications
❌ Rate limiting for API
❌ Search indexing/full-text search
❌ Image storage/CDN for recipe photos
❌ Social features (sharing, comments)
❌ Recipe ratings/reviews

---

## 10. ENVIRONMENT SETUP REQUIREMENTS

### Web App (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

### Mobile App (.env / .env.local)
```
EXPO_PUBLIC_SUPABASE_URL=<same-as-web>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<same-as-web>
EXPO_PUBLIC_API_URL=<next-js-server-url>  # e.g., http://localhost:3000
```

### Required External Accounts
1. **Supabase Project** with:
   - Google OAuth configured
   - Apple OAuth configured (optional)
   - Database schema initialized (schema.sql)
   - Service Role Key created

2. **AWS Account** (for Bedrock Claude access)
   - AWS credentials configured in environment
   - Bedrock access to Claude Haiku model

### Database Initialization
```sql
-- Run supabase/schema.sql in Supabase SQL Editor
-- Creates: recipes, user_usage tables
-- Sets up: RLS policies, indexes, triggers, functions
```

---

## 11. KEY METRICS & INSIGHTS

### Performance Considerations
- **Recipe Extraction**: ~3-10 seconds (transcript extraction + AI analysis)
- **Database Queries**: All have appropriate indexes
- **Storage**: AsyncStorage limit ~10MB (mobile) - sufficient for ~1000 recipes

### Security
- RLS policies enforce user data isolation
- Service Role Key never exposed to client
- Bearer token validation on `/api/usage`
- OAuth tokens auto-refreshed

### Data Model Efficiency
- JSONB arrays for flexible schema (ingredients, steps)
- Monthly granularity for usage tracking (no daily/hourly bloat)
- Sparse schema (optional fields) reduces storage

---

## SUMMARY

**Recipi Book** is a well-architected dual-platform app using clean architecture principles. The core functionality (recipe extraction, storage, sync, authentication) is complete and production-ready. However, the monetization layer (premium plans, payment processing) is only partially implemented with hardcoded limits and no actual payment integration. The mobile app depends on the Next.js server exclusively for recipe extraction via the `/api/extract-recipe` endpoint, but can function offline for recipe viewing and shopping list management with AsyncStorage.
