"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    type: "stock" | "comparison" | "screener";
    symbol?: string;
    symbols?: string[];
    filters?: Record<string, unknown>;
    title?: string;
  };
}

export default function VolumeCallAIDrawer({ isOpen, onClose, context }: AIDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Context formatting
  const subtitle =
    context.type === "stock"
      ? context.title || context.symbol
      : context.type === "comparison"
      ? (context.symbols || []).join(" vs ")
      : "Stock Screener Filters";

  const prompts =
    context.type === "stock"
      ? [
          `Why is P/E of ${context.symbol || ""} high?`,
          `How has net profit grown?`,
          `Explain its debt level.`,
          `What does this company do?`,
        ]
      : context.type === "comparison"
      ? [
          "Why is one stock more expensive?",
          "Which has stronger profitability?",
          "Compare latest quarterly results.",
          "What are the biggest risks?",
        ]
      : [
          "What does this screen look for?",
          "Which metrics are most restrictive?",
          "Explain these results.",
        ];

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock background scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/stocks/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: context.type,
          symbol: context.symbol,
          symbols: context.symbols,
          filters: context.filters,
          userMessage: userText,
          history: messages,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let errData: Record<string, unknown> = {};
        try { errData = JSON.parse(text); } catch {}
        throw new Error((errData.error as string | undefined) || "Failed to generate AI response.");
      }

      const text = await res.text();
      if (!text || text.trim() === "") {
        throw new Error("Received empty response from AI service.");
      }
      let data: { answer?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Failed to parse AI response.");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || "No response generated." }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer container */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-[460px] h-full bg-[#0a0a0a] border-l border-neutral-850 text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-teal-400 font-extrabold flex items-center gap-1.5 text-base tracking-wide uppercase">
              <Sparkles className="h-4 w-4 fill-teal-400" />
              VolumeCall AI
            </span>
            <span className="text-xs text-neutral-450 mt-1 uppercase tracking-wider font-mono">
              {subtitle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-6">
              <div className="h-12 w-12 rounded-full bg-teal-950/40 border border-teal-800/40 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-teal-400" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-neutral-200">Ask VolumeCall Assistant</h4>
                <p className="text-xs text-neutral-450 max-w-[280px]">
                  Analyze stock valuations, growth efficiency, debt health, or news developments.
                </p>
              </div>
              {/* Prompt suggestions */}
              <div className="w-full flex flex-wrap gap-2 justify-center pt-2">
                {prompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p)}
                    className="text-xs px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-teal-700 hover:bg-neutral-850 text-neutral-300 font-semibold cursor-pointer text-left max-w-full transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col space-y-1 ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-xs leading-relaxed font-medium ${
                      m.role === "user"
                        ? "bg-teal-750 text-white rounded-tr-none"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center space-x-2 text-neutral-500 text-xs font-semibold">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer Input Area */}
        <div className="p-4 border-t border-neutral-800 bg-[#060606] space-y-3">
          {messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {prompts.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="text-[10px] whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-teal-700 text-neutral-400 font-bold transition-all cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about valuation, growth, risks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:border-teal-750 font-semibold"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-teal-705 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
