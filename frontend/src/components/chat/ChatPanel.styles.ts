import { cva } from "class-variance-authority";

export const chatContainer = cva(
  "mx-auto flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-none metro-border bg-card/85 backdrop-blur-sm sm:h-[85vh] sm:max-h-[700px] sm:rounded-md sm:metro-glow"
);

export const chatHeader = cva(
  "flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-3 sm:gap-4 sm:p-4"
);

export const avatarButton = cva(
  "group relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-primary/40 transition-all hover:border-primary/70 sm:h-12 sm:w-12"
);

export const avatarInner = cva(
  "h-full w-full bg-primary/10 transition-all group-hover:bg-primary/20"
);

export const headerName = cva(
  "font-mono text-xs tracking-wider text-primary text-glow-amber sm:text-sm"
);

export const headerSubtitle = cva(
  "truncate font-mono text-[10px] leading-tight tracking-wider text-muted-foreground sm:text-xs"
);

export const statusIndicator = cva(
  "ml-auto hidden items-center gap-2 sm:flex"
);

export const messagesArea = cva(
  "metro-scrollbar flex-1 space-y-3 overflow-y-auto p-3 sm:space-y-4 sm:p-4"
);

export const messageBubble = cva(
  "max-w-[90%] rounded-sm px-3 py-2.5 font-body text-[13px] leading-relaxed sm:max-w-[80%] sm:px-4 sm:py-3 sm:text-sm",
  {
    variants: {
      sender: {
        user: "bg-primary/10 border border-primary/20 text-foreground",
        artyom: "bg-muted/50 border border-border text-foreground/90",
      },
    },
    defaultVariants: {
      sender: "artyom",
    },
  }
);

export const messageLabel = cva(
  "font-mono text-[10px] text-muted-foreground mb-1 tracking-wider uppercase"
);

export const inputBar = cva(
  "border-t border-border bg-muted/20 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:p-4 sm:pb-4"
);

export const textInput = cva(
  "min-w-0 flex-1 rounded-sm border border-border bg-input px-3 py-2.5 font-mono text-[13px] text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary/50 focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
);

export const sendButton = cva(
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-muted/30 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
);
