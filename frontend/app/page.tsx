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
            ? "relative z-10 flex min-h-[100dvh] w-full items-stretch justify-center p-0 sm:min-h-screen sm:items-center sm:p-4"
            : "relative z-10 flex min-h-[100dvh] w-full items-center justify-center p-4"
        }
      >
        {!userName ? <NameEntryOverlay onEnter={setUserName} /> : <ChatPanel userName={userName} />}
      </main>
    </div>
  );
}
