# Mood Mirror AI — Feature Roadmap & Subscription Strategy

## What the App Is Today

Mood Mirror AI is an AI-powered emotion reflection and journaling web app. Users express their inner emotional state via **text, drawing, or voice**, and a multimodal AI (Qwen3-VL via OpenRouter) analyses the emotion and mirrors it back as a poem, motivational message, or joke. The app tracks mood history, journals entries, and renders ambient music + animated visuals that shift to match the detected mood.

**Current stack:** React 19 + FastAPI + SQLite + OpenRouter AI (vision + text) + Web Audio API

---

## Subscription Tiers

| Tier | Price | Target User |
|------|-------|-------------|
| Free | $0 | Casual / try-before-buy |
| Starter | **$4.99 / month** | Daily journalers wanting more depth |
| Growth | **$9.99 / month** | People actively working on emotional wellness |
| Pro | **$19.99 / month** | Power users, therapist-adjacent, teams |

---

## Free Tier (Current Baseline)

> Keep this generous enough to show value, tight enough to create upgrade desire.

- [x] Text / Draw / Voice mood input
- [x] AI emotion analysis (6 emotions)
- [x] Last 20 mood history entries
- [x] Basic mood journal with notes
- [x] 90-day trend chart
- [x] Ambient procedural music (mood-synced)
- [x] Animated Mood Orb
- [x] English + German UI

---

## $4.99 / month — Starter

> Hook: "Go deeper. Track every day."

### Unlimited History & Journal
- Remove the 20-entry cap on mood history
- Unlimited journal entries (currently can delete; give cloud backup)
- **Calendar heat-map view** — see mood density day by day (like GitHub contributions, colored by dominant emotion)

### Richer Tracking
- **Streak counter** — consecutive days with at least one check-in; badge system (7-day, 30-day, 100-day streaks)
- **Daily mood reminder** — configurable push notification / email nudge ("Time to check in with yourself")
- **Custom journal tags** — user-defined labels (e.g., #work #relationship #sleep) to filter and group entries
- **Time-of-day pattern** — chart showing whether mornings vs evenings vs nights skew different emotions

### Export & Share
- **PDF mood report** — monthly summary PDF with charts, dominant moods, your journal entries
- **CSV export** — raw emotion score data for personal use

### More Emotion Nuance
- Expand from 6 to **12 emotion dimensions** (add: anxiety, loneliness, excitement, gratitude, shame, pride)
- Show a "secondary emotion" card alongside the dominant mood

### UI Personalization
- **3 UI themes** — Dark Zen (default), Soft Pastel, Minimal Light
- **Custom Mood Orb color palette** — let users pick their own orb colors per mood

---

## $9.99 / month — Growth

> Hook: "Understand yourself. Build better patterns."

### AI-Powered Insights (the key differentiator)
- **Weekly AI Insight Report** — each Sunday, the AI summarizes your week: "You were most anxious on Tuesdays after 8pm. Your calmest moments followed creative writing sessions." Pull from journal + timestamps.
- **Mood correlation analysis** — the AI surfaces connections: "Entries tagged #work correlate 70% with high stress scores" — surfaces triggers the user may not notice consciously
- **Personalized coping suggestions** — after each analysis, offer 2-3 specific evidence-based actions based on the detected emotion (e.g., for high anxiety: box breathing exercise, 5-minute walk prompt, journaling prompt)
- **Mood prediction nudge** — based on historical patterns, send a heads-up: "Historically you feel lower on Monday mornings — maybe journal tonight"

### Conversational AI ("Talk to Mirror")
- **Follow-up chat** — after an analysis, open a short AI chat dialogue where the user can explore the detected emotion deeper (e.g., "Why do you think you're feeling this way?", Socratic reflection prompts)
- Stored per session but not long-term (long-term memory is Pro tier)

### Photo Mood Analysis
- **Upload an image or take a photo** — the AI analyses the visual scene/colors/content for emotional resonance (e.g., a photo of a cluttered desk, a sunset walk, a hospital waiting room)
- Leverages the existing Qwen3-VL multimodal capability already wired in the backend

### Enhanced Audio
- **10 curated ambient soundscapes** — beyond procedurally generated tones: lo-fi rain, forest, fireplace, ocean waves, café noise — each mapped to a mood state
- **Binaural beat overlay** — optional layer tuned to focus / calm / sleep frequencies

### Goal & Wellness Tracking
- **Weekly intention setting** — set a feeling goal ("I want to feel more grounded this week"), and the app tracks whether your check-ins trend toward it
- **Gratitude prompts** — optional daily gratitude journaling module with its own trend chart

### More Languages
- Add **5 more UI + speech recognition languages**: Spanish, French, Portuguese, Japanese, Hindi

---

## $19.99 / month — Pro

> Hook: "Your personal emotional intelligence system."

### Long-Term AI Memory & Deep Personalization
- **Persistent AI memory** — the AI remembers context across sessions ("Last month you mentioned feeling isolated at work — I notice that stress score is high again today")
- **Personalized AI voice + name** — choose the AI's name, tone (gentle / direct / poetic), and response style (poem / coach / philosopher)
- **Custom emotion vocabulary** — define your own emotion labels that map to the standard score axes

### Crisis Detection & Safety Net
- **Distress signal detection** — if text/voice input contains language patterns associated with crisis, gently surface mental health resources (988 Lifeline, Crisis Text Line) without being alarmist
- **Safety check-in mode** — optionally enable: if you miss 3 days, app sends a gentle "checking in" message
- Can be turned off — opt-in only, zero data leaves the app

### Advanced Analytics Dashboard
- **Year-in-review** — end-of-year visual story of your emotion journey (share-ready card)
- **Emotion volatility metric** — measures how much your emotions swing week to week vs staying stable
- **Comparative insight** — (optional, anonymized aggregate) "You feel 30% calmer than the average Sunday user"
- **Sleep + activity correlation** — manual daily log (5-second slider) for sleep quality and movement, correlated with mood scores

### Therapist / Coach Sharing
- **Shareable mood report link** — generate a privacy-controlled report link to share with a therapist, coach, or trusted person
- **Annotated export** — therapist can add notes, you receive them back in the app
- Designed as a complement to therapy, never a replacement

### Voice Journaling
- **Full audio journal recording** — record a voice note, the AI transcribes + analyses the emotion, stores the audio recording alongside the journal entry
- Replaces the current session-only SpeechInput with saved recordings

### Team / Family Plan (add-on)
- 1 Pro account can invite **up to 5 members** at a group rate
- Each member has their own private data — no cross-visibility unless explicitly shared
- Useful for couples therapy homework, family wellness, or workplace wellness programs

### API Access
- REST API with personal API key — pipe mood data into Notion, Obsidian, Apple Health, or custom automations
- Webhook support — fire events to external services on each analysis

---

## Feature Priority Matrix (What to Build First)

| Feature | Tier | Effort | Impact | Build Order |
|---------|------|--------|--------|-------------|
| Stripe subscription + user accounts | All | High | Critical | **#1** |
| Unlimited history + calendar heat-map | $4.99 | Low | High | **#2** |
| Streak tracking | $4.99 | Low | High | **#3** |
| Weekly AI Insight Report | $9.99 | Medium | Very High | **#4** |
| Daily reminder / push notification | $4.99 | Medium | High | **#5** |
| Custom tags + filtering | $4.99 | Low | Medium | **#6** |
| PDF / CSV export | $4.99 | Medium | Medium | **#7** |
| Follow-up AI chat | $9.99 | Medium | High | **#8** |
| Photo mood analysis | $9.99 | Low (already multimodal) | High | **#9** |
| Coping suggestions | $9.99 | Low | High | **#10** |
| Distress detection + resources | $19.99 | Medium | Critical (ethical) | **#11** |
| User accounts + cloud sync | All | High | Critical | Parallel with #1 |

---

## Technical Foundation Required First

Before monetizing, these non-feature changes are mandatory:

### 1. User Accounts (Auth)
- Currently the app has **no authentication** — all data is local/shared SQLite
- Need: email/password or OAuth (Google, Apple) login
- Library recommendation: **Supabase** (managed auth + PostgreSQL, replaces SQLite) or Auth0 + migrate to PostgreSQL

### 2. Stripe Integration (Stripe is already in `requirements.txt`)
- Subscription billing with 3 price tiers
- Webhook handler for `customer.subscription.updated/deleted`
- Free trial period (7 days on Growth/Pro to drive upgrades)
- Usage metering if you want per-analysis caps on Free tier

### 3. Database Migration
- Migrate from SQLite to **PostgreSQL** (via Supabase or Railway) to support multi-user data isolation
- Add `user_id` foreign key to all existing tables (`mood_analyses`, `mood_journal`)

### 4. Deployment
- Containerize with Docker (backend)
- Deploy backend to **Railway / Render / Fly.io**
- Deploy frontend to **Vercel / Netlify**
- Set up environment-specific `.env` (dev / staging / prod)

---

## Monetization Psychology Tips

- **Free → $4.99**: The upgrade trigger is hitting the 20-entry history cap or wanting the streak. Make the cap visible with a gentle CTA: "You've logged 18 moods this month — unlock unlimited history"
- **$4.99 → $9.99**: The upgrade trigger is curiosity about the Weekly Insight. Tease it: show a blurred/locked "Your Week in Review" card at the bottom of the journal page every Sunday
- **$9.99 → $19.99**: The upgrade trigger is wanting to share with a therapist or wanting the AI to remember them. Surface this after a user has 3+ months of data
- Offer an **annual plan** at ~2 months free (e.g., $39.99 / $79.99 / $159.99/year) — reduces churn significantly
- Consider a **Lifetime deal** at launch (AppSumo / Product Hunt) at $99 to generate initial MRR and social proof

---

## Differentiation vs Competitors

| Competitor | What they do | Mood Mirror advantage |
|------------|-------------|----------------------|
| Daylio | Emoji mood logging, manual tags | AI understands nuance from freeform text/drawing/voice — no manual tagging needed |
| Reflectly | AI journaling prompts | Mood Mirror analyses YOUR input rather than leading you with prompts |
| How We Feel | Emotion wheel check-ins | Mood Mirror accepts drawing and voice, ambient music, far richer multimodal |
| Woebot | CBT chatbot for anxiety | Mood Mirror is non-clinical, creative, aesthetic — different emotional register |
| Journey | General journaling | Mood Mirror has quantified emotion scores + AI reflection, not just storage |

**Core differentiator to double down on:** The multimodal input (especially drawing) + ambient music that shifts with your mood is genuinely unique. No competitor does this. Lean into it in all marketing copy.
