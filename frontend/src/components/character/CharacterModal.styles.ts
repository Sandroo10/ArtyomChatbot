import { cva } from "class-variance-authority";

export const modalBackdrop = cva(
  "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/90 p-4 backdrop-blur-sm sm:p-6"
);

export const modalCard = cva(
  "metro-scrollbar relative mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-md metro-border bg-card/95 p-5 animate-fade-slide-up sm:p-8"
);

export const sectionLabel = cva(
  "mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-metro-hud text-glow-hud sm:mb-6 sm:text-xs sm:tracking-[0.3em]"
);

export const characterName = cva(
  "mb-2 font-mono text-lg tracking-wider text-primary text-glow-amber sm:text-xl"
);

export const classification = cva(
  "mb-5 font-mono text-[10px] tracking-wide text-muted-foreground sm:mb-6 sm:text-xs sm:tracking-wider"
);

export const bodyText = cva(
  "space-y-4 font-body text-sm leading-relaxed text-foreground/80"
);

export const closeButton = cva(
  "rounded-sm border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-all hover:border-muted-foreground hover:text-foreground sm:px-4 sm:text-xs sm:tracking-[0.2em]"
);
