"use client";

import { useState } from "react";
import NameEntryOverlay from "@/components/name-entry/NameEntryOverlay";
import ChatPanel from "@/components/chat/ChatPanel";

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <div className="fixed inset-0 z-0">
        <img src="/metro-bg.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 metro-vignette" />
      </div>

      <div className="fixed inset-0 z-[1] noise-overlay pointer-events-none" />

      <main
        className={
          userName
            ? "relative z-10 flex min-h-[100dvh] w-full items-end justify-center p-2 sm:min-h-screen sm:items-center sm:p-4"
            : "relative z-10 flex min-h-[100dvh] w-full items-center justify-center p-4"
        }
      >
        {!userName ? (
          <NameEntryOverlay onEnter={setUserName} />
        ) : (
          <div className="w-full max-w-2xl">
            <ChatPanel userName={userName} />
            <p className="mt-2 px-2 text-center text-[11px] italic text-muted-foreground/80 sm:mt-3 sm:text-xs">
              This is a fan-made, non-profit concept project. It is not affiliated with, endorsed by, or connected to
              Metro, Metro 2033, 4A Games, or Deep Silver.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
