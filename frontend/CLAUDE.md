# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PayGate landing page — a single-file React component for an MPP (Micropayment Protocol) code generator and monitoring dashboard targeting Node.js developers on Stellar.

The full design specification is in `PayGate_LandingPage_Brief.md`. Read it before making any visual or copy changes.

## Output Constraints

- **Single file:** All code lives in one `.jsx` file
- **Styling:** Tailwind CSS utility classes only — no external CSS files, no `<style>` tags (except the Google Fonts `@import` and `@keyframes blink` if used)
- **Icons:** `lucide-react` only (`Github`, `Code2`, `BarChart3`, `Zap`, `Globe`, `Copy`)
- **Fonts:** Loaded via Google Fonts — `Inter` (400/600/700/800) and `JetBrains Mono` (400/500)
- **No additional libraries** beyond React, Tailwind, and lucide-react

## Color System

Always defined as `const colors = {...}` at the top of the file and referenced inline via `style={{}}` props — never hardcode hex values elsewhere in the component:

```js
const colors = {
  bg: '#080808', surface: '#0F0F0F', surfaceHover: '#141414',
  border: '#1A1A1A', borderHover: '#2A2A2A',
  accent: '#7C3AED', accentDim: 'rgba(124,58,237,0.12)', accentGlow: 'rgba(124,58,237,0.20)',
  cyan: '#22D3EE',
  text1: '#F8FAFC', text2: '#94A3B8', text3: '#475569',
  codeBg: '#0D0D0D',
  green: '#86EFAC', blue: '#93C5FD', purple: '#C084FC',
}
```

## Architecture

Seven sections in order: Navbar → Hero → Problem → How It Works → Features → Final CTA → Footer.

- **Navbar:** `position: sticky`, `top: 0`, `z-index: 50`, backdrop-blur, logo uses `{ PayGate }` with violet brackets in JetBrains Mono
- **Hero:** Full-viewport, centered, with absolute glow div behind the code block. Static terminal mockup with syntax-highlighted spans. "See How It Works" scrolls to `#how-it-works`
- **Problem:** 3-column grid of stat cards; responsive to 1-column on mobile
- **How It Works (`id="how-it-works"`):** Vertical steps with left connector line and filled violet dots; 2-column layout (text + visual mockup) collapses to text-only on mobile
- **Features:** 2×2 card grid with violet icon containers; collapses to 1-column on mobile
- **Final CTA:** Full-width, gradient background, centered
- **Footer:** Single-line, JetBrains Mono, links to GitHub

## Key Implementation Details

**Scroll animation:** Use `IntersectionObserver` to fade each section in (`opacity: 0→1`, `translateY(16px→0)`, 400ms ease-out). No animation libraries.

**Hover transitions:** All interactive elements use `transition: all 0.15s ease`. Cards change `background` to `surfaceHover` and `border` to `borderHover`. Buttons shift background color only — no scale transforms. Primary CTA hover adds `boxShadow: '0 0 24px rgba(124,58,237,0.45)'`.

**Background texture:** Apply to full page — `backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)'`, `backgroundSize: '24px 24px'`.

**Syntax highlighting in code blocks:** Done with inline `<span style={{color: ...}}>` — keywords purple `#C084FC`, strings green `#86EFAC`, properties blue `#93C5FD`, comments muted `#475569`, functions amber `#FCD34D`, plain text `#E2E8F0`.

**Responsive breakpoint:** `768px` — hero code block scrolls horizontally, problem/features grids collapse to 1 column, How It Works hides the visual column, hero headline drops to 36px.

**Glow elements:** Must have `pointerEvents: 'none'` and `position: 'absolute'`, `zIndex: 0`. All section content sits at `zIndex: 1`.

## Copy Rules

Stats and technical claims in the brief are exact and verifiable — do not rephrase or soften them. Card 4 body in Features ("co-authored by Stripe and Tempo Labs…") must stay verbatim. The hero badge references March 2026 MPP launch — keep the specificity.

Do not add: team/bio sections, testimonials, pricing, Instawards/SDF/grant mentions, or any copy that sounds like a pitch deck.
