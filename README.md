# Social Agents

AI companions with unique personalities, long-term memory, and free will — in a real-time group chat.

You create characters called **Shapes**, drop them into chat rooms, and they decide on their own when to speak, what to say, and how to say it. Invite real friends to join the same room. Shapes remember who you are and grow more personal over time.

---

## What it does

- **Shapes** - AI agents you design. Give them a name, backstory, voice style, values, and behavioral quirks. Each shape has its own personality kernel that drives how it speaks and when.
- **Free Will** - A Director AI reads the room after each message and chooses which shapes respond, how quickly, and with what strategy. Shapes can also choose to stay silent.
- **Long-Term Memory** - Shapes build episodic memory about each user using vector embeddings. After enough conversations, they recall past details naturally.
- **Real-Time Chat** - Live presence, typing indicators, and message delivery over WebSockets.
- **Multiplayer** - Share an invite link. Real humans and AI shapes coexist in the same room.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Better Auth |
| Database | Neon (PostgreSQL) via Drizzle ORM |
| Real-time | Pusher |
| Background jobs | Inngest |
| Cache / Rate-limit | Upstash Redis |
| AI | Vercel AI SDK — Anthropic, OpenAI, Amazon Bedrock |

---

## Architecture

### Message Pipeline

Every user message triggers a multi-step async pipeline handled by Inngest:

```
User sends message
       │
       ▼
  Prefilter (fast gate)
  ├── checks token budget, rate limits, quiet hours
  └── passes / blocks
       │
       ▼
  Director LLM
  ├── reads room context and recent messages
  ├── decides which shapes respond (up to 2)
  ├── assigns each a strategy, intent, delay
  └── outputs structured JSON
       │
       ▼
  Drafter (per shape, in sequence)
  ├── builds full prompt from persona kernel + memory + chat history
  ├── generates message content
  └── pushes to Pusher → client
       │
       ▼
  Echo-chamber check (if 2+ shapes replied)
  Memory consolidation (every 10 messages)
  Idle timer scheduled (30s)
```

### Key Modules

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── rooms/                # Chat room pages
│   │   └── shapes/               # Shape management
│   ├── api/
│   │   ├── rooms/                # Room CRUD, messages, members
│   │   ├── shapes/               # Shape CRUD
│   │   ├── internal/             # Server-to-server only (director, drafter, memory)
│   │   ├── inngest/              # Inngest webhook endpoint
│   │   └── pusher/auth/          # Pusher channel auth
│   ├── sign-in/ sign-up/
│   └── join/[code]/              # Invite link landing
│
├── lib/
│   ├── ai/
│   │   ├── director.ts           # Decides who speaks and when
│   │   ├── drafter.ts            # Generates each shape's message
│   │   ├── memory.ts             # Reads/writes episodic memory
│   │   ├── embeddings.ts         # Vector embedding generation
│   │   ├── gateway.ts            # AI provider abstraction
│   │   ├── providers.ts          # Model selection (Anthropic / OpenAI / Bedrock)
│   │   ├── prompts/              # System prompts for director and memory
│   │   ├── schemas/              # Zod schemas for structured AI outputs
│   │   └── safety/
│   │       ├── echo-chamber.ts   # Detects when shapes just agree with each other
│   │       ├── content-safety.ts # Filters harmful content
│   │       └── loop-detection.ts # Prevents infinite agent loops
│   │
│   ├── inngest/
│   │   ├── client.ts
│   │   └── functions/
│   │       ├── on-message-sent.ts     # Main pipeline trigger
│   │       ├── on-time-elapsed.ts     # Idle room revival
│   │       ├── on-idle-consolidate.ts # Memory consolidation on idle
│   │       └── revive-idle-rooms.ts
│   │
│   ├── persona/
│   │   ├── schema.ts             # PersonaKernel type definition
│   │   ├── examples.ts           # Seed persona templates
│   │   └── render.ts             # Renders persona into prompt text
│   │
│   ├── db/
│   │   ├── schema.ts             # All Drizzle table definitions
│   │   ├── queries.ts            # Reusable DB query helpers
│   │   └── seed.ts               # Database seeder
│   │
│   ├── auth/                     # Better Auth setup
│   ├── pusher/                   # Pusher server + client helpers
│   ├── redis/                    # Upstash Redis client
│   └── prefilter/                # Fast pre-director gate logic
│
└── components/
    ├── chat/                     # ChatRoom, MessageList, MessageInput, PresenceList
    └── shapes/                   # ShapesPanel and shape builder UI
```

### Database Schema

```
users           — auth + profile + quiet hours + notification budget
shapes          — AI persona definition (persona_kernel as JSONB)
rooms           — chat rooms with mode, token budget, free_will flag
room_members    — users and shapes joined to a room
messages        — all chat messages (human and shape)
director_runs   — audit log of every director decision
memories        — per-shape episodic memories with pgvector embeddings
user_memories   — consolidated user profiles per shape
shape_state     — per-room cooldown and message rate tracking
```

### Persona Kernel

Each shape's personality is stored as a `PersonaKernel` JSON object:

```ts
{
  identity: { display_name, age?, archetype, backstory_short },
  voice: { tone, register, sentence_length, emoji_usage, typo_rate },
  values: string[],
  knowledge_boundaries: { knows: string[], unknown: string[] },
  talkativeness: number,            // 0–1
  reactivity: {
    keywords: string[],             // triggers a response
    favorite_users: string[],
    ignored_topics: string[],
  },
  typing_speed_wpm: number,
  signature_phrases: string[],
  response_distribution: { fast_p, normal_p, slow_p },
}
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database (with `pgvector` extension enabled)
- A [Pusher](https://pusher.com) Channels app
- An [Inngest](https://inngest.com) account
- An [Upstash](https://upstash.com) Redis database
- An AI provider key (Anthropic, OpenAI, or AWS Bedrock)

### 1. Clone and install

```bash
git clone https://github.com/your-username/ai-agent-chat.git
cd ai-agent-chat
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Inngest
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI Provider (at least one)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Internal API secret (any random string)
INTERNAL_API_SECRET=
```

### 3. Set up the database

```bash
npm run db:push       # Push schema to Neon
npm run db:seed       # Optional: seed example shapes
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For background jobs to work locally, also run the Inngest Dev Server:

```bash
npx inngest-cli@latest dev
```

---

## Key Concepts

**Director** — A fast LLM call that runs after every message. It reads the last 20 messages, the shapes in the room, and returns a structured JSON decision: which shapes respond, with what strategy (`agree`, `challenge`, `question`, `joke`, etc.), and after how long a delay.

**Drafter** — For each shape the director selects, a full prompt is built from that shape's persona kernel + their memories of the user + the chat history. The drafter generates the final message text.

**Memory consolidation** — Every 10 messages from a user, recent conversation is summarized into durable episodic memories. These are embedded as vectors and retrieved by cosine similarity when a shape is about to respond.

**Prefilter** — A lightweight gate that runs before the director. It checks token budgets, per-room rate limits, whether any humans are present, and quiet hours. If the gate blocks, no LLM calls are made.

**Free will** — Shapes are not forced to respond. The director can output an empty responders list with a skip reason (`not_relevant`, `cooldown`, `director_error`, etc.). This makes conversations feel less mechanical.

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Push DB schema + build for production
npm run start        # Start production server
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema directly (no migration files)
npm run db:seed      # Seed example shapes
npm run lint         # Run ESLint
```

---

## License

MIT
