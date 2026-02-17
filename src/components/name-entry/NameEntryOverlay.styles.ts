import { cva } from "class-variance-authority";

export const overlay = cva(
  "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 p-4 noise-overlay sm:p-6"
);

export const formContainer = cva(
  "relative z-10 w-full max-w-md"
);

export const formCard = cva(
  "relative rounded-md metro-border bg-card/90 p-5 sm:p-8"
);

export const systemLabel = cva(
  "mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-glow-hud sm:mb-4 sm:text-xs sm:tracking-[0.3em]"
);

export const title = cva(
  "font-mono text-xl tracking-wider text-primary text-glow-amber sm:text-2xl"
);

export const inputField = cva(
  "w-full rounded-sm border border-border bg-input px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary/60 focus:metro-glow focus:outline-none sm:px-4 sm:py-3"
);

export const submitButton = cva(
  "w-full rounded-sm border border-primary/40 bg-primary/20 py-3 font-mono text-xs uppercase tracking-[0.14em] text-primary text-glow-amber transition-all sm:text-sm sm:tracking-[0.2em]",
  {
    variants: {
      state: {
        active: "hover:border-primary/60 hover:bg-primary/30",
        inactive: "cursor-not-allowed opacity-35",
      },
    },
    defaultVariants: {
      state: "inactive",
    },
  }
);

export const statusLine = cva(
  "mt-5 text-center font-mono text-[10px] tracking-wider text-muted-foreground/50 sm:mt-6 sm:text-xs"
);

export const decorationLine = cva(
  "absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
);
