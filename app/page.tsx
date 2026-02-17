"use client";

import { useState } from "react";
import NameEntryOverlay from "@/components/name-entry/NameEntryOverlay";
import ChatPanel from "@/components/chat/ChatPanel";

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-background">
      {!userName ? (
        <NameEntryOverlay onEnter={setUserName} />
      ) : (
        <main className="flex min-h-screen items-center justify-center p-4">
          <ChatPanel userName={userName} />
        </main>
      )}
    </div>
  );
}
