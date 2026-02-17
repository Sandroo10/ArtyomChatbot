import { useState, useRef, useEffect } from "react";
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

const ARTYOM_RESPONSES = [
  "The tunnels remember everything... even the things we try to forget.",
  "Keep your flashlight close. Darkness here is not just absence of light — it's alive.",
  "I've seen stations fall. I've seen them rise again. The Metro endures.",
  "Trust is a rare currency down here. Spend it wisely.",
  "Every echo in these tunnels was once a voice. Remember that.",
  "The surface is death. The Metro is survival. That's all there is.",
  "Some say there's still hope above. I stopped looking up long ago.",
  "Ammunition speaks louder than words in these corridors.",
];

interface ChatPanelProps {
  userName: string;
}

const ChatPanel = ({ userName }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "artyom",
      text: `${userName}... You made it. The tunnels are not kind to newcomers, but you're here now. Speak — I'm listening.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const response =
        ARTYOM_RESPONSES[responseIndex.current % ARTYOM_RESPONSES.length];
      responseIndex.current++;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "artyom", text: response },
      ]);
    }, 800 + Math.random() * 1200);
  };

  return (
    <>
      <CharacterModal open={showModal} onClose={() => setShowModal(false)} />

      <div className={chatContainer()}>
        {/* Header */}
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
            <div className="w-2 h-2 rounded-full bg-metro-hud flicker" />
            <span className="font-mono text-xs text-metro-hud text-glow-hud">
              ONLINE
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className={messagesArea()}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`animate-fade-slide-up ${
                msg.sender === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }`}
            >
              <div className={messageBubble({ sender: msg.sender })}>
                <div className={messageLabel()}>
                  {msg.sender === "user" ? `[${userName}]` : "[ARTYOM]"}
                </div>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className={inputBar()}>
          <div className="flex items-end gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak into the darkness…"
              className={textInput()}
              aria-label="Type your message"
            />
            <button
              type="submit"
              disabled={!input.trim()}
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
