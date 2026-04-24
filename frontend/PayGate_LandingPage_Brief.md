# PayGate — Landing Page Design Brief
> For AI Agent execution. Single-file React (.jsx). Dark developer tool aesthetic.

---

## 1. Context & Goal

**Product:** PayGate — an MPP code generator and monitoring dashboard for Node.js APIs on Stellar.

**Page goal:** Communicate the product clearly and confidently to a technical audience. The page should feel like a real, shipping developer tool — not a pitch or a proposal. Let the product speak for itself.

**Primary CTA:** "View on GitHub" → `https://github.com/paygate-stellar` (placeholder)

**Audience:** Developers who build and monetize APIs. Familiarity with Node.js assumed. Stellar/MPP knowledge not required — the page should make it feel approachable.

---

## 2. Technical Spec

| | |
|---|---|
| **Output** | Single-file React component (`.jsx`) |
| **Styling** | Tailwind CSS utility classes only. No external CSS files. |
| **Icons** | `lucide-react` |
| **Fonts** | Import from Google Fonts: `Inter` (body, weights 400/600/700/800) + `JetBrains Mono` (code, weight 400/500) |
| **No dependencies** | Beyond React, Tailwind, lucide-react — no extra libraries |

---

## 3. Visual Identity

### Color System

Define as a JS object `const colors = {...}` at the top of the file and reference throughout:

```js
const colors = {
  bg:           '#080808',  // page background
  surface:      '#0F0F0F',  // card / code block background
  surfaceHover: '#141414',  // card hover state
  border:       '#1A1A1A',  // default border
  borderHover:  '#2A2A2A',  // border on hover
  accent:       '#7C3AED',  // violet — primary accent
  accentDim:    'rgba(124, 58, 237, 0.12)',
  accentGlow:   'rgba(124, 58, 237, 0.20)',
  cyan:         '#22D3EE',  // secondary highlight (used sparingly)
  text1:        '#F8FAFC',  // primary text
  text2:        '#94A3B8',  // secondary text
  text3:        '#475569',  // muted / placeholder
  codeBg:       '#0D0D0D',  // code block background
  green:        '#86EFAC',  // syntax: strings
  blue:         '#93C5FD',  // syntax: properties
  purple:       '#C084FC',  // syntax: keywords
}
```

### Typography

```
Headings:  Inter, 700–800 weight, letter-spacing: -0.02em, line-height: 1.1
Body:      Inter, 400 weight, line-height: 1.6, font-size: 16px
Labels:    JetBrains Mono, 400 weight, uppercase, letter-spacing: 0.1em, font-size: 11–12px
Code:      JetBrains Mono, 400–500 weight, font-size: 13–14px
```

### Background Texture

Apply to the full page and especially the hero section:

```css
backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
backgroundSize: '24px 24px',
```

This is the "Vercel dot grid aesthetic" — very subtle, low opacity, gives depth without distraction.

### Glow Effects

Two types used across the page:

**1. Hero background glow** — one absolute element behind the code block:
```css
position: absolute, zIndex: 0
background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)'
width: 700px, height: 400px
filter: blur(80px)
pointerEvents: none
```

**2. CTA button glow on hover:**
```css
boxShadow: '0 0 24px rgba(124, 58, 237, 0.45)'
```

### Design Exploration Notes for the Agent

> These are open design decisions. Explore multiple approaches and use the one that looks most refined.

**Gradient text:** The headline on the CTA section should use a violet-to-cyan gradient text. Explore whether this also works on the hero headline's second line, or if it creates too much visual noise. Try both — use the subtler option.

**Card depth:** Cards on a near-black background can feel flat. Explore adding a very subtle top border highlight `border-top: 1px solid rgba(255,255,255,0.06)` in addition to the standard border — this creates a light-catching edge that adds dimension without color. Use this only if it improves perceived depth.

**Code block inner glow:** Try adding a subtle violet inner glow to the code block: `box-shadow: inset 0 0 40px rgba(124,58,237,0.04), 0 0 0 1px #1A1A1A`. Compare against no glow. Use whichever feels more premium without being distracting.

**Label color:** Section labels (e.g., `THE PROBLEM`, `HOW IT WORKS`) are specified as `#22D3EE` cyan. Explore a dimmer version — `rgba(34,211,238,0.7)` — for a more refined look on dark background. Pick whichever creates better visual hierarchy.

**Hover states:** Every interactive element needs a hover state. For cards: transition `background` to `surfaceHover` + `border` to `borderHover`. For buttons: use background color shift only — no scale transform. All transitions: `transition: all 0.15s ease`.

---

## 4. Section-by-Section Spec

---

### SECTION 1 — Navbar

**Layout:** `position: sticky`, `top: 0`, `z-index: 50`, full width, `backdrop-filter: blur(12px)`, `background: rgba(8,8,8,0.85)`, `border-bottom: 1px solid #1A1A1A`

**Left — Logo:**
- Prefix: `{` and `}` characters in `#7C3AED` (violet), sandwiching the word `PayGate` in white
- Full text renders as: `{ PayGate }` where brackets are violet
- Font: `JetBrains Mono`, bold, font-size 16px

**Right — CTA Button: `"View on GitHub"`**
- Style: border `1px solid #1A1A1A`, background transparent, hover background `accentDim`, text white
- Font-size: 13px, padding `px-4 py-2`, rounded-md
- Icon: `Github` from lucide at 14px, margin-right 6px
- Transition: `all 0.15s ease`

**Container:** `max-width: 1100px`, `margin: 0 auto`, `padding: 0 24px`, flex, space-between

---

### SECTION 2 — Hero

**Layout:** `min-height: 100vh`, flex column, `justify-content: center`, `align-items: center`, `text-align: center`, `padding: 120px 24px 80px`, `position: relative`, `overflow: hidden`

Glow element (described above) placed absolutely at `z-index: 0`. All content at `z-index: 1`.

**Badge:**
```
⚡ MPP launched March 2026. The tooling gap is real.
```
- Pill: `border: 1px solid #1A1A1A`, `background: accentDim`, text color `#22D3EE`
- Font: `JetBrains Mono`, 11px, padding `px-4 py-1.5`, rounded-full
- Margin-bottom: 32px

> The badge copy references a real, verifiable fact. Do not soften to something generic like "Built on Stellar." The specificity is intentional — it signals the team is tracking the ecosystem closely.

**Headline (h1):**

Line 1: `Monetize Your API.`
Line 2: `No Protocol Knowledge Required.`

- Font-size: `clamp(42px, 6vw, 64px)`, font-weight 800, letter-spacing -0.02em, line-height 1.1
- Line 1: color white
- Line 2: gradient — `background: linear-gradient(90deg, #7C3AED, #22D3EE)`, `-webkit-background-clip: text`, `color: transparent`
- Max-width: 800px

**Subheadline:**
```
PayGate generates MPP-ready middleware for your Node.js API
from a 3-field form. Paste it in. Start accepting USDC on Stellar.
```
- Color: `#94A3B8`, font-size 18px, line-height 1.6, max-width 520px, margin-top 20px

**CTA Row** (margin-top 36px, flex, gap 12px, justify-center):

Primary — `"View on GitHub"`:
- `background: #7C3AED`, text white, `padding: px-6 py-3`, rounded-lg, font-size 15px, font-weight 600
- Icon `Github` 16px, margin-right 8px
- Hover: `background: #6D28D9` + glow `boxShadow: '0 0 24px rgba(124,58,237,0.45)'`

Secondary — `"See How It Works ↓"`:
- Transparent background, `border: 1px solid #1A1A1A`, color `#94A3B8`, `padding: px-6 py-3`, rounded-lg, 15px
- Hover: border `#2A2A2A`, text `#F8FAFC`
- onClick: smooth scroll to `#how-it-works`

**Hero Code Block** (margin-top 64px, max-width 680px, width 100%):

Terminal mockup — static visual, Copy button is decorative.

```
┌─────────────────────────────────────────────────────┐
│  ● ● ●   paywall.js                        [Copy]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  import { mppCharge } from '@stellar/mpp';         │
│                                                     │
│  export const paywall = mppCharge({                │
│    asset:       'USDC',                            │
│    amount:      '0.01',                            │
│    destination: process.env.STELLAR_ADDRESS,       │
│  });                                                │
│                                                     │
│  // Drop into any Express route. That's it.        │
│  app.get('/api/data', paywall, (req, res) => {     │
│    res.json({ data: '...' });                      │
│  });                                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Outer wrapper:
- `background: #0D0D0D`, `border: 1px solid #1A1A1A`, rounded-xl, overflow hidden
- Explore inner glow variant (see Design Exploration Notes)

Header bar:
- `background: #111111`, `border-bottom: 1px solid #1A1A1A`, padding `px-4 py-3`, flex, align-items center
- Left: 3 dots — `10×10px`, rounded-full — colors `#FF5F57` / `#FEBC2E` / `#28C840`, gap 6px
- Center: `paywall.js` — `JetBrains Mono`, text-xs, color `#475569`
- Right: `Copy` button — icon `Copy` lucide 12px + label text, text-xs, color `#475569`, hover `#F8FAFC`

Code area: `padding: px-6 py-5`, `JetBrains Mono`, 13px, line-height 1.8, text-align left

Syntax highlighting (inline `<span>`):

| Token | Color | Tokens |
|---|---|---|
| Keywords | `#C084FC` | `import`, `export`, `const` |
| Strings | `#86EFAC` | `'USDC'`, `'0.01'`, `'@stellar/mpp'` |
| Properties | `#93C5FD` | `asset:`, `amount:`, `destination:` |
| Comments | `#475569` | `// Drop into any Express route` |
| Functions | `#FCD34D` | `mppCharge`, `get`, `json` |
| Plain text | `#E2E8F0` | everything else |

> The code shown is based on actual `@stellar/mpp` API from Stellar docs. Keep the structure accurate — technical reviewers will recognize it.

---

### SECTION 3 — Problem

**ID:** `problem`

**Container:** `max-width: 1100px`, `margin: 0 auto`, `padding: 120px 24px`, text-align center

**Label:** `THE PROBLEM` — `JetBrains Mono`, 11px, uppercase, letter-spacing 0.1em, color `#22D3EE`

**Headline:**
```
Micropayment monetization
is fundamentally broken.
```
Font-size: `clamp(30px, 4vw, 44px)`, font-weight 800, color white, max-width 600px, margin 12px auto 0

**Subtext:**
```
The protocol that fixes this launched in March 2026.
Most developers still can't access it.
```
Color: `#94A3B8`, font-size 17px, margin-top 16px, margin-bottom 56px

**3 Cards** — `display: grid`, `grid-template-columns: repeat(3, 1fr)`, gap 16px

Each card: `background: #0F0F0F`, `border: 1px solid #1A1A1A`, rounded-xl, padding 32px, text-align left
Explore the top highlight border from Design Exploration Notes.

Card 1:
- Stat: `$0.30 + 2.9%` — 28px, font-weight 800, `#7C3AED`, `JetBrains Mono`
- Sublabel: `per Stripe transaction` — 12px, `#475569`, `JetBrains Mono`
- Divider: `border-top: 1px solid #1A1A1A`, margin `20px 0`
- Body: "Charging $0.01 per API call? Traditional payment rails eat the entire margin before you see a cent."

Card 2:
- Stat: `2–4 weeks`
- Sublabel: `to integrate MPP manually`
- Body: "The protocol exists. The SDK exists. But wiring it into a real API requires deep knowledge of Stellar internals, HTTP 402 flows, and USDC — knowledge most developers don't have time to acquire."

Card 3:
- Stat: `$3–5T`
- Sublabel: `projected agentic commerce by 2030`
- Body: "Galaxy Research estimates $3–5 trillion in agentic commerce by 2030. MPP is the protocol that enables it. PayGate is the tool that makes it accessible."

> Stats are the visual anchor of each card — monospace font and high violet contrast is intentional.

---

### SECTION 4 — How It Works

**ID:** `how-it-works`

**Container:** `max-width: 1100px`, `margin: 0 auto`, `padding: 120px 24px`

**Label:** `HOW IT WORKS`

**Headline:**
```
Three inputs.
One file. Done.
```
Max-width 480px, font-size `clamp(30px, 4vw, 44px)`, font-weight 800

**Steps layout:** Vertical stack of 3 steps. Each step: 2-column grid (text ~55% / visual ~45%), `gap: 48px` between steps.

Left connector: thin vertical line `border-left: 1px solid #1A1A1A` spanning full height of all steps. Filled violet dot `10×10px` at the start of each step, offset to sit on the line.

---

**Step 1 — Fill the form**

Text:
- Step number: `01` — `JetBrains Mono`, 11px, `rgba(124,58,237,0.5)`
- Title: `Fill the form` — 22px, font-weight 700, white
- Body: "Enter your API endpoint URL, the path you want to gate, and your price per request in USDC. Nothing else."

Visual — mini form mockup (static):
```
┌────────────────────────────────┐
│  API Endpoint URL              │
│  https://api.yourservice.com   │
├────────────────────────────────┤
│  Path to gate                  │
│  /v1/data                      │
├────────────────────────────────┤
│  Price per request (USDC)      │
│  0.01                          │
└────────────────────────────────┘
```
Each field: `background: #141414`, `border: 1px solid #1A1A1A`, rounded-md, padding `px-3 py-2.5`
Label: 11px, `#475569`, `JetBrains Mono`

---

**Step 2 — Generate**

Text:
- Number: `02`
- Title: `Generate`
- Body: "Click Generate. PayGate processes your inputs and produces a complete, drop-in MPP middleware using `@stellar/mpp`. No boilerplate. No configuration."

Visual — button in success state:
```
[  ✓  Code Ready  ]
```
Style: `background: rgba(134,239,172,0.1)`, `border: 1px solid rgba(134,239,172,0.2)`, text `#86EFAC`, rounded-lg, padding `px-5 py-2.5`, font-size 14px

---

**Step 3 — Copy. Paste. Ship.**

Text:
- Number: `03`
- Title: `Copy. Paste. Ship.`
- Body: "One file. Drop it into your Express server. Every request to that endpoint now triggers an automatic USDC payment via Stellar before your handler runs."

Visual — compact 3-line code block:
```js
// server.js
import { paywall } from './paywall.js';
app.get('/api/data', paywall, handler);
```
Same terminal styling as hero block, compact version. 3 lines.

---

### SECTION 5 — Features

**ID:** `features`

**Container:** `max-width: 1100px`, `margin: 0 auto`, `padding: 120px 24px`

**Label:** `WHAT YOU GET`

**Headline:**
```
Built for developers
who want to ship.
```

**Grid:** `grid-template-columns: repeat(2, 1fr)`, gap 16px

Each card: `background: #0F0F0F`, `border: 1px solid #1A1A1A`, rounded-xl, padding 32px, hover `#141414`, transition `all 0.15s ease`

Icon container: `40×40px`, `background: rgba(124,58,237,0.12)`, `border: 1px solid rgba(124,58,237,0.2)`, rounded-lg — icon inside at 18px, color `#7C3AED`

**Card 1 — MPP Code Generator**
- Icon: `Code2`
- Title: `MPP Code Generator`
- Body: "Generates fully compliant `@stellar/mpp` middleware from a 3-field form. Node.js/Express ready. Zero additional configuration. One copy-paste away from a live paywall."

**Card 2 — Real-Time Earnings Dashboard**
- Icon: `BarChart3`
- Title: `Real-Time Earnings Dashboard`
- Body: "Monitor USDC earnings and API request counts live, pulled directly from Stellar. Every transaction is a verifiable on-chain hash you can inspect in Stellar Explorer."

**Card 3 — Zero Stellar Knowledge**
- Icon: `Zap`
- Title: `Zero Stellar Knowledge Required`
- Body: "No wallets to configure manually. No keypairs to manage. No USDC onboarding. PayGate abstracts the entire protocol — you bring the API, we handle the rest."

**Card 4 — Built on Open Standards**
- Icon: `Globe`
- Title: `Built on Open Standards`
- Body: "MPP is co-authored by Stripe and Tempo Labs, adopted by Cloudflare, and already live across 50+ services including OpenAI and Google Gemini. PayGate puts you on that stack in minutes."

> Card 4 body copy contains verifiable facts. Keep this copy exact — it's a key trust signal for technical reviewers who will cross-check.

---

### SECTION 6 — Final CTA

**Layout:** Full width, `padding: 120px 24px`, `text-align: center`, `position: relative`, `overflow: hidden`

Background: `linear-gradient(to bottom, #080808, #0D0816)`

Large glow centered absolutely: `width: 800px`, `height: 500px`, `opacity: 0.12`, `pointer-events: none`

**Headline:**

Line 1: `Your API is ready.` — white
Line 2: `The paywall isn't. Yet.` — gradient violet-to-cyan (same as hero)

Font-size: `clamp(36px, 5vw, 56px)`, font-weight 800, max-width 640px, `margin: 0 auto`

**Subtext:**
```
Follow PayGate's progress on GitHub.
```
Color: `#94A3B8`, font-size 18px, margin-top 20px

**CTA Button:**
- `"View on GitHub"` — same style as hero primary, slightly larger: `px-8 py-4`, font-size 16px, icon `Github` 18px

---

### SECTION 7 — Footer

`border-top: 1px solid #1A1A1A`, `padding: 32px 24px`, `text-align: center`

```
© 2026 PayGate · Built on Stellar · MPP        [Github icon]
```

Color: `#475569`, font-size 13px, `JetBrains Mono`
Github icon: 14px, color `#475569`, hover `#F8FAFC`, links to GitHub URL

---

## 5. Responsive Behavior

| Breakpoint | Changes |
|---|---|
| `< 768px` | Hero headline → `font-size: 36px` |
| `< 768px` | Problem cards → `grid-template-columns: 1fr` |
| `< 768px` | How It Works steps → hide visual column, text only |
| `< 768px` | Features grid → `grid-template-columns: 1fr` |
| `< 768px` | Hero code block → `overflow-x: scroll` |
| `< 768px` | Navbar → logo + CTA only |
| All | Max-width `1100px` with `padding: 0 24px` on all sections |

---

## 6. Animation & Motion

**Allowed:**
- Fade-in on scroll for each section — `opacity: 0 → 1`, `transform: translateY(16px) → translateY(0)`, 400ms, `ease-out`, use `IntersectionObserver`
- Hover transitions on all interactive elements — `all 0.15s ease`
- Optional: blinking cursor `|` after last line of hero code block — CSS `@keyframes blink`

**Not allowed:**
- Lottie, Three.js, or any animation library
- Video backgrounds or parallax
- Any transition longer than `0.3s`

---

## 7. Copy Rules

| Rule | Example |
|---|---|
| Concrete over abstract | `"2–4 weeks"` not `"takes a long time"` |
| Outcome-first | `"Start accepting USDC"` not `"enables payment functionality"` |
| No fluff | Never: revolutionary, powerful, seamless, cutting-edge |
| Developer voice | Short sentences. Direct. Like Slack, not press releases. |
| Numbers = trust | Every stat is sourced and verifiable |

---

## 8. What NOT to Include

- Any team section, names, bios, or org affiliations
- Any mention of Instawards, grants, SDF, or funding programs
- Testimonials or social proof (product is pre-launch)
- Pricing section
- Real product screenshots (use code mockups only)
- Animations heavier than fade-in
- Copy that sounds like a pitch deck

---

## 9. Final QA Checklist

Before delivering, verify:

- [ ] Dark background `#080808` is consistent across all sections — no white flashes
- [ ] All text meets contrast — `#94A3B8` on `#080808` passes WCAG AA (it does: 4.6:1)
- [ ] Code blocks use `JetBrains Mono` with correct syntax highlighting colors
- [ ] Dot-grid texture is subtle — barely visible is correct
- [ ] Hover states exist on: navbar CTA, hero buttons, feature cards, footer GitHub link
- [ ] Mobile tested at 375px — no horizontal overflow except code blocks
- [ ] "See How It Works" scrolls to `#how-it-works`
- [ ] No team names, grant mentions, or program references anywhere in the page
- [ ] All transitions use `0.15s ease`
- [ ] Glow elements have `pointer-events: none`
