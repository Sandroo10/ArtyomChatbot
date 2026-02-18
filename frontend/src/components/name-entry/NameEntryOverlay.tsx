import { useState } from "react";
import {
  overlay,
  formContainer,
  formCard,
  systemLabel,
  title,
  inputField,
  submitButton,
  statusLine,
} from "./NameEntryOverlay.styles";

interface NameEntryOverlayProps {
  onEnter: (name: string) => void;
}

const NameEntryOverlay = ({ onEnter }: NameEntryOverlayProps) => {
  const [name, setName] = useState("");
  const normalizedName = name.trim();
  const canEnter = normalizedName.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEnter) return;
    onEnter(normalizedName);
  };

  return (
    <div className={overlay()}>
      <div className={formContainer()}>
        <form onSubmit={handleSubmit} className={formCard()}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="mb-6 text-center sm:mb-8">
            <div className={systemLabel()}>// SYSTEM TERMINAL v2.033</div>
            <h1 className={title()}>IDENTIFICATION REQUIRED</h1>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <label
                htmlFor="name-input"
                className="mb-2 block font-mono text-xs tracking-wide text-muted-foreground sm:text-sm sm:tracking-wider"
              >
                Survivor, state your name…
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputField()}
                placeholder="Enter designation..."
                autoFocus
                aria-label="Enter your survivor name"
              />
            </div>

            <button
              type="submit"
              aria-disabled={!canEnter}
              className={submitButton({ state: canEnter ? "active" : "inactive" })}
              aria-label="Enter the Metro chat"
            >
              Enter the Metro
            </button>
          </div>

          <div className={statusLine()}>
            &gt; CONNECTION ESTABLISHED{" "}
            <span className="animate-terminal-blink">_</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </form>
      </div>
    </div>
  );
};

export default NameEntryOverlay;
