import { cva } from "class-variance-authority";

export const modalBackdrop = cva(
  "fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
);

export const modalCard = cva(
  "relative w-full max-w-lg mx-4 metro-border bg-card/95 rounded-md p-8 animate-fade-slide-up"
);

export const sectionLabel = cva(
  "font-mono text-xs text-metro-hud tracking-[0.3em] uppercase mb-6 text-glow-hud"
);

export const characterName = cva(
  "font-mono text-xl text-primary text-glow-amber tracking-wider mb-2"
);

export const classification = cva(
  "font-mono text-xs text-muted-foreground tracking-wider mb-6"
);

export const bodyText = cva(
  "space-y-4 text-foreground/80 leading-relaxed text-sm font-body"
);

export const closeButton = cva(
  "font-mono text-xs text-muted-foreground tracking-[0.2em] uppercase border border-border px-4 py-2 rounded-sm hover:text-foreground hover:border-muted-foreground transition-all"
);
