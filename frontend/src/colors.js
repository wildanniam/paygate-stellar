export const PALETTE = {
  bg: {
    canvas: '#050609',
    app: '#080A0F',
    elevated: '#0A0D14',
  },
  surface: {
    1: '#0D1117',
    2: '#111722',
    3: '#151C2A',
    hover: '#182133',
  },
  border: {
    subtle: '#222A38',
    strong: '#344055',
    focus: '#7C3AED',
  },
  text: {
    primary: '#F7F8FB',
    secondary: '#A5ADBD',
    muted: '#6B7487',
    faint: '#475569',
  },
  brand: {
    purple: '#7C3AED',
    purpleSoft: '#A78BFA',
    purpleDim: 'rgba(124,58,237,0.14)',
    purpleGlow: 'rgba(124,58,237,0.24)',
  },
  flow: {
    blue: '#38BDF8',
    cyan: '#22D3EE',
  },
  state: {
    green: '#22C55E',
    greenSoft: '#86EFAC',
    amber: '#F59E0B',
    amberSoft: '#FCD34D',
    red: '#F87171',
    redSoft: '#FCA5A5',
  },
};

export const FONT = {
  sans: "'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
};

export const SHADOW = {
  focus: '0 0 0 3px rgba(124,58,237,0.28)',
  panel: '0 18px 60px rgba(0,0,0,0.28)',
  glow: '0 0 32px rgba(124,58,237,0.18)',
};

export const C = {
  bg: PALETTE.bg.canvas,
  appBg: PALETTE.bg.app,
  surface: PALETTE.surface[1],
  surface2: PALETTE.surface[2],
  surface3: PALETTE.surface[3],
  surfaceHover: PALETTE.surface.hover,
  border: PALETTE.border.subtle,
  borderHover: PALETTE.border.strong,
  accent: PALETTE.brand.purple,
  accentSoft: PALETTE.brand.purpleSoft,
  accentDim: PALETTE.brand.purpleDim,
  accentGlow: PALETTE.brand.purpleGlow,
  cyan: PALETTE.flow.cyan,
  flowBlue: PALETTE.flow.blue,
  text1: PALETTE.text.primary,
  text2: PALETTE.text.secondary,
  text3: PALETTE.text.muted,
  textFaint: PALETTE.text.faint,
  codeBg: '#090D14',
  green: PALETTE.state.greenSoft,
  greenStrong: PALETTE.state.green,
  blue: PALETTE.flow.blue,
  purple: PALETTE.brand.purpleSoft,
  amber: PALETTE.state.amberSoft,
  amberStrong: PALETTE.state.amber,
  red: PALETTE.state.redSoft,
  redStrong: PALETTE.state.red,
  status: {
    active: {
      color: PALETTE.state.greenSoft,
      bg: 'rgba(34,197,94,0.10)',
      border: 'rgba(34,197,94,0.24)',
    },
    pending: {
      color: PALETTE.state.amberSoft,
      bg: 'rgba(245,158,11,0.10)',
      border: 'rgba(245,158,11,0.24)',
    },
    paid: {
      color: PALETTE.flow.blue,
      bg: 'rgba(56,189,248,0.10)',
      border: 'rgba(56,189,248,0.24)',
    },
    muted: {
      color: PALETTE.text.muted,
      bg: 'rgba(165,173,189,0.08)',
      border: 'rgba(165,173,189,0.16)',
    },
    danger: {
      color: PALETTE.state.redSoft,
      bg: 'rgba(248,113,113,0.10)',
      border: 'rgba(248,113,113,0.24)',
    },
  },
};

export const MONO = { fontFamily: FONT.mono };
export const SANS = { fontFamily: FONT.sans };
