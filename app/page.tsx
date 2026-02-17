"use client";

import { useState } from "react";
import NameEntryOverlay from "@/components/name-entry/NameEntryOverlay";

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-background">
      {!userName ? (
        <NameEntryOverlay onEnter={setUserName} />
      ) : (
        <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome, {userName}</h1>
            <p className="mt-2 text-muted-foreground">Chat experience will be added in the next commit.</p>
          </div>
        </main>
      )}
    </div>
  );
}
