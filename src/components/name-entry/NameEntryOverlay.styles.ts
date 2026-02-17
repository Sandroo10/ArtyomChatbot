import { cva } from "class-variance-authority";

export const overlay = cva(
  "fixed inset-0 z-50 flex items-center justify-center bg-background/95 noise-overlay"
);

export const formContainer = cva(
  "relative z-10 w-full max-w-md px-6"
);

export const formCard = cva(
  "metro-border bg-card/90 p-8 rounded-md relative"
);

export const systemLabel = cva(
  "font-mono text-xs text-muted-foreground tracking-[0.3em] uppercase mb-4 text-glow-hud"
);

export const title = cva(
  "font-mono text-2xl text-primary text-glow-amber tracking-wider"
);

export const inputField = cva(
  "w-full bg-input border border-border rounded-sm px-4 py-3 font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:metro-glow transition-all"
);

export const submitButton = cva(
  "w-full bg-primary/20 border border-primary/40 text-primary font-mono tracking-[0.2em] uppercase py-3 rounded-sm hover:bg-primary/30 hover:border-primary/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-glow-amber"
);

export const statusLine = cva(
  "mt-6 text-center font-mono text-xs text-muted-foreground/50 tracking-wider"
);

export const decorationLine = cva(
  "absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
);
