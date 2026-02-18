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

interface ChatPanelProps {
  userName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

function mapMessagesForApi(messages: Message[], userName: string): ChatApiMessage[] {
  const conversation: ChatApiMessage[] = messages.map((message) => ({
    role: message.sender === "user" ? "user" : "assistant",
    content: message.text,
  }));

  // Name is sent in the first message so the backend can personalize Artyom's reply.
  return [{ role: "user", content: `My name is ${userName}.` }, ...conversation];
}

async function requestArtyomReply(messages: Message[], userName: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: mapMessagesForApi(messages, userName),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = payload && payload.details ? payload.details : "Chat request failed.";
    throw new Error(reason);
  }

  const text = payload && typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    throw new Error("Empty reply from chat provider.");
  }

  return text;
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
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAwaitingReply]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAwaitingReply) return;

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
      const responseText = await requestArtyomReply(updatedMessages, userName);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "artyom",
          text: responseText,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "artyom",
          text: "Sorry Soldier, Signal is breaking up. I could not answer just now. Try again.",
        },
      ]);
    } finally {
      setIsAwaitingReply(false);
    }
  };

  return (
    <>
      <CharacterModal open={showModal} onClose={() => setShowModal(false)} />

      <div className={chatContainer()}>
        <div className={chatHeader()}>
          <button
            onClick={() => setShowModal(true)}
            className={avatarButton()}
            aria-label="View Artyom data log"
          >
            <div className={avatarInner()}>A</div>
            <div className="absolute inset-0 rounded-full border border-primary/10 group-hover:metro-glow" />
          </button>
          <div className="min-w-0">
            <h2 className={headerName()}>ARTYOM</h2>
            <p className={headerSubtitle()}>Metro Wanderer / Survivor</p>
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
                {msg.text}
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
              disabled={isAwaitingReply}
            />
            <button
              type="submit"
              disabled={!input.trim() || isAwaitingReply}
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
