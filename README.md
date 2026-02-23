# PromptCraft AI 🪄

> Turn any idea into a perfect AI prompt — in seconds.

PromptCraft AI is a full-stack SaaS application that transforms raw ideas into optimized, structured AI prompts across 3 levels: **Basic**, **Advanced**, and **Expert**. Built with Next.js 14 and powered by the Anthropic Claude API.

---

## ✨ Features

- **3-Level Prompt Engine** — Basic, Advanced, Expert versions of every prompt
- **Claude API Integration** — Server-side API route keeps your key secure
- **Dark / Light Mode** — Toggle in the nav
- **Auth System** — Email/password + Google login (demo)
- **Prompt History** — Save and revisit past prompts
- **API Key Management** — Generate and manage API keys
- **Admin Dashboard** — User stats, revenue, signups chart
- **Subscription Gating** — Free vs Pro plans
- **Model Agnostic** — Output works with GPT-4, Claude, Gemini, Llama

---

## 🚀 Deploy in 5 Minutes (Vercel)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/promptcraft-ai
cd promptcraft-ai
npm install
```

### 2. Set Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Get your key from: https://console.anthropic.com/settings/keys

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

When prompted:
- Set `ANTHROPIC_API_KEY` as an environment variable in the Vercel dashboard
- Or run: `vercel env add ANTHROPIC_API_KEY`

**That's it!** You'll get a live URL like `https://promptcraft-ai.vercel.app`

---

## 🏗️ Project Structure

```
promptcraft-ai/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout + fonts
│   │   ├── page.js            # Entry point
│   │   ├── globals.css        # Global styles
│   │   └── api/
│   │       └── generate/
│   │           └── route.js   # 🔒 Secure Claude API route
│   └── components/
│       └── PromptCraftApp.js  # Full application UI
├── public/
├── .env.example               # Environment variable template
├── .env.local                 # Your local env vars (git-ignored)
├── next.config.js
├── package.json
└── vercel.json                # Vercel deployment config
```

---

## 🔑 Demo Accounts

| Email | Password | Plan |
|-------|----------|------|
| demo@promptcraft.ai | demo123 | Pro + Admin |
| free@promptcraft.ai | free123 | Free |

---

## 🔌 API Usage

Once deployed, you can call the prompt generation API directly:

```bash
curl -X POST https://your-domain.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Write a product launch email",
    "goal": "Persuade",
    "tone": "Professional",
    "format": "Email",
    "length": "Medium"
  }'
```

**Response:**
```json
{
  "basic": "Write professionally about...",
  "advanced": "## Task\nPersuade: Write a product launch email...",
  "expert": "# Expert Prompt — Persuade Specialist..."
}
```

---

## 🔧 Production Upgrade Path

To make this fully production-ready, add:

| Feature | Recommended Tool | Time |
|---------|-----------------|------|
| Real Auth | [Clerk](https://clerk.com) | 1-2 hrs |
| Database | [Supabase](https://supabase.com) | 2-3 hrs |
| Payments | [Stripe](https://stripe.com) | 2-4 hrs |
| Email | [Resend](https://resend.com) | 1 hr |
| Analytics | [PostHog](https://posthog.com) | 30 min |

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Inline styles + CSS variables
- **AI**: Anthropic Claude API (claude-opus-4-6)
- **Fonts**: Syne + DM Mono (Google Fonts)
- **Deployment**: Vercel

---

## 📄 License

MIT — free to use, modify, and deploy.

---

Built with ❤️ using Claude API by Anthropic.
