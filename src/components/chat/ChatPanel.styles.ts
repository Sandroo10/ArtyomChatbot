import { cva } from "class-variance-authority";

export const chatContainer = cva(
  "w-full max-w-2xl mx-auto h-[85vh] max-h-[700px] flex flex-col metro-border bg-card/80 backdrop-blur-sm rounded-md overflow-hidden metro-glow"
);

export const chatHeader = cva(
  "flex items-center gap-4 p-4 border-b border-border bg-muted/30"
);

export const avatarButton = cva(
  "relative w-12 h-12 rounded-full border-2 border-primary/40 overflow-hidden shrink-0 hover:border-primary/70 transition-all group"
);

export const avatarInner = cva(
  "w-full h-full bg-primary/10 flex items-center justify-center font-mono text-primary text-lg group-hover:bg-primary/20 transition-all"
);

export const headerName = cva(
  "font-mono text-primary text-glow-amber tracking-wider text-sm"
);

export const headerSubtitle = cva(
  "font-mono text-xs text-muted-foreground tracking-wider"
);

export const statusIndicator = cva(
  "ml-auto flex items-center gap-2"
);

export const messagesArea = cva(
  "flex-1 overflow-y-auto p-4 space-y-4 metro-scrollbar"
);

export const messageBubble = cva(
  "max-w-[80%] px-4 py-3 rounded-sm font-body text-sm leading-relaxed",
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
  "p-4 border-t border-border bg-muted/20"
);

export const textInput = cva(
  "flex-1 bg-input border border-border rounded-sm px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all"
);

export const sendButton = cva(
  "w-12 h-12 flex items-center justify-center border border-border rounded-sm bg-muted/30 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
);
