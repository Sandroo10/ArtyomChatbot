import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import CharacterModal from "@/components/character/CharacterModal";
import {
  chatContainer,
  chatHeader,
  avatarButton,
  avatarInner,
  headerName,
  headerSubtitle,
  statusIndicator,
  messagesArea,
  messageBubble,
  messageLabel,
  inputBar,
  textInput,
  sendButton,
} from "./ChatPanel.styles";

interface Message {
  id: number;
  sender: "user" | "artyom";
  text: string;
}

interface ChatApiMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatReplyPayload {
  text: string;
  limit?: {
    blocked_until?: string | null;
  };
}

interface ChatPanelProps {
  userName: string;
}

class ChatApiError extends Error {
  status: number;
  retryAfterSeconds?: number;
  blockedUntil?: string;

  constructor(message: string, status: number, retryAfterSeconds?: number, blockedUntil?: string) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
    this.blockedUntil = blockedUntil;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
const ACTION_OR_THOUGHT_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
const CLIENT_ID_STORAGE_KEY = "metro_chat_client_id";

function getOrCreateClientId() {
  if (typeof window === "undefined") {
    return "unknown-client";
  }

  const existing = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const newId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, newId);
  return newId;
}

function mapMessagesForApi(messages: Message[], userName: string): ChatApiMessage[] {
  const conversation: ChatApiMessage[] = messages.map((message) => ({
    role: message.sender === "user" ? "user" : "assistant",
    content: message.text,
  }));

  // Name is sent in the first message so the backend can personalize Artyom's reply.
  return [{ role: "user", content: `My name is ${userName}.` }, ...conversation];
}

async function requestArtyomReply(messages: Message[], userName: string): Promise<ChatReplyPayload> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": getOrCreateClientId(),
    },
    body: JSON.stringify({
      messages: mapMessagesForApi(messages, userName),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = payload && payload.details ? payload.details : "Chat request failed.";
    const retryAfterSeconds =
      payload && typeof payload.retry_after_seconds === "number"
        ? payload.retry_after_seconds
        : undefined;
    const blockedUntil =
      payload && typeof payload.blocked_until === "string" ? payload.blocked_until : undefined;

    throw new ChatApiError(reason, response.status, retryAfterSeconds, blockedUntil);
  }

  const text = payload && typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    throw new Error("Empty reply from chat provider.");
  }

  return payload as ChatReplyPayload;
}

function renderMessageText(text: string) {
  return text.split(ACTION_OR_THOUGHT_PATTERN).map((part, index) => {
    const isDoubleWrapped = part.startsWith("**") && part.endsWith("**");
    const isSingleWrapped = part.startsWith("*") && part.endsWith("*");

    if (isDoubleWrapped || isSingleWrapped) {
      const markerLength = isDoubleWrapped ? 2 : 1;
      const content = part.slice(markerLength, part.length - markerLength);

      return (
        <span key={index} className="italic opacity-75">
          {content}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

const ChatPanel = ({ userName }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "artyom",
      text: `${userName}... You made it. The tunnels are not kind to newcomers, but you're here now. Speak - I'm listening.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAwaitingReply]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAwaitingReply) return;

    if (isLimitReached) {
      setIsLimitReached(true);
      setShowLimitModal(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsAwaitingReply(true);

    try {
      const responsePayload = await requestArtyomReply(updatedMessages, userName);
      const responseText = responsePayload.text.trim();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "artyom",
          text: responseText,
        },
      ]);

      if (responsePayload.limit?.blocked_until) {
        setIsLimitReached(true);
        setShowLimitModal(true);
      }
    } catch (error) {
      if (error instanceof ChatApiError && error.status === 429) {
        setMessages((prev) => prev.filter((message) => message.id !== userMsg.id));
        setIsLimitReached(true);
        setShowLimitModal(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "artyom",
            text: "Sorry Soldier, Signal is breaking up. I could not answer just now. Try again.",
          },
        ]);
      }
    } finally {
      setIsAwaitingReply(false);
    }
  };

  return (
    <>
      <CharacterModal open={showModal} onClose={() => setShowModal(false)} />
      {showLimitModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Message limit reached"
        >
          <div className="w-full max-w-md rounded-md border border-border bg-card/95 p-6 sm:p-7">
            <p className="font-mono text-sm leading-relaxed text-foreground sm:text-base">
              Your adventures are halted here, Anya will accompany Artyom for now.
            </p>
            <p className="mt-3 text-sm italic text-muted-foreground">
              this is the message limit for this beta version. Come back in 5 hours.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLimitModal(false)}
                className="rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-all hover:border-muted-foreground hover:text-foreground"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={chatContainer()}>
        <div className={chatHeader()}>
          <button
            onClick={() => setShowModal(true)}
            className={avatarButton()}
            aria-label="View Artyom data log"
          >
            <div className={avatarInner()}>
              <img
                src="/artem%20metro%202033%20redux.webp"
                alt="Artyom"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 rounded-full border border-primary/10 group-hover:metro-glow" />
          </button>
          <div className="min-w-0">
            <h2 className={headerName()}>ARTYOM</h2>
            <p className={headerSubtitle()}>Hero of Metro / D6 Soldier / Survivor</p>
          </div>
          <div className={statusIndicator()}>
            <div className="h-2 w-2 rounded-full bg-metro-hud flicker" />
            <span className="font-mono text-xs text-metro-hud text-glow-hud">ONLINE</span>
          </div>
        </div>

        <div className={messagesArea()}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`animate-fade-slide-up ${msg.sender === "user" ? "flex justify-end" : "flex justify-start"}`}
            >
              <div className={messageBubble({ sender: msg.sender })}>
                <div className={messageLabel()}>{msg.sender === "user" ? `[${userName}]` : "[ARTYOM]"}</div>
                <div className="whitespace-pre-wrap">{renderMessageText(msg.text)}</div>
              </div>
            </div>
          ))}

          {isAwaitingReply && (
            <div className="flex justify-start animate-fade-slide-up">
              <div className={messageBubble({ sender: "artyom" })}>
                <div className={messageLabel()}>[ARTYOM]</div>
                Listening through tunnel static...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={inputBar()}>
          <div className="flex items-end gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak into the darkness..."
              className={textInput()}
              aria-label="Type your message"
              disabled={isAwaitingReply || isLimitReached}
            />
            <button
              type="submit"
              disabled={!input.trim() || isAwaitingReply || isLimitReached}
              className={sendButton()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatPanel;
