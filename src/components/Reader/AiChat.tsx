"use client";
import { AiApi } from "@/apis/aiApi";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
  bookContext: string | null;
  currentPage: number;
  getPageText: (page: number) => Promise<string>;
  isDarkMode: boolean;
  language: string;
}

const AiChat: React.FC<AiChatProps> = ({
  isOpen,
  onClose,
  bookContext,
  currentPage,
  getPageText,
  isDarkMode,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiApi = new AiApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const [prevPage, currPage, nextPage] = await Promise.all([
        getPageText(currentPage - 1),
        getPageText(currentPage),
        getPageText(currentPage + 1),
      ]);

      const dynamicContext = `
        PAGE ${currentPage - 1}: ${prevPage}
        PAGE ${currentPage}: ${currPage}
        PAGE ${currentPage + 1}: ${nextPage}
      `.trim();

      // Optimize history: Take last 10 messages and truncate long contents
      const MAX_HISTORY_MESSAGES = 10;
      const MAX_MESSAGE_LENGTH = 1500;

      const optimizedHistory = messages
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => {
          let content = m.content;
          if (content.length > MAX_MESSAGE_LENGTH) {
            content =
              content.substring(0, MAX_MESSAGE_LENGTH) +
              "... [truncated for context]";
          }
          return {
            role: m.role === "user" ? ("user" as const) : ("model" as const),
            parts: [{ text: content }],
          };
        });

      const response = await aiApi.chatWithBook(
        userMessage,
        optimizedHistory,
        bookContext || "",
        dynamicContext,
        currentPage,
        language,
      );

      if (response) {
        setMessages((prev) => [...prev, { role: "model", content: response }]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An error occurred. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "model", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed z-[100] flex flex-col transition-all duration-300 border ${
          isDarkMode
            ? "bg-dark-background border-dark-secondary/50 filter invert hue-rotate-180"
            : "bg-white border-gray-200"
        } backdrop-blur-xl shadow-orange-500/10 shadow-2xl overflow-hidden
      /* Mobile Portrait: Centered higher up and taller */
      bottom-[15dvh] left-1/2 -translate-x-1/2 w-[94%] max-h-[80dvh] h-auto max-w-[600px] rounded-2xl
      /* Landscape / Tablet / Desktop: Side-Docked Right */
      md:right-6 md:bottom-12 md:left-auto md:translate-x-0 md:w-[450px] md:h-[85vh] md:max-h-[85vh]
      `}
      >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDarkMode
            ? "border-dark-secondary/20 bg-dark-background"
            : "border-gray-100 bg-gray-50/50"
        }`}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-lg ${isDarkMode ? "bg-dark-secondary/10 text-dark-secondary" : "bg-light-secondary/10 text-light-secondary"}`}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3
              className={`font-semibold ${isDarkMode ? "text-dark-foreground" : "text-gray-800"}`}
            >
              AI Reading Guide
            </h3>
            <p
              className={`text-[10px] ${isDarkMode ? "text-dark-foreground/60" : "text-gray-500"}`}
            >
              Current: Page {currentPage}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-500/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <MessageCircle
              size={48}
              className={`mb-4 ${isDarkMode ? "text-dark-secondary/20" : "text-light-secondary/20"}`}
            />
            <p
              className={`text-sm ${isDarkMode ? "text-dark-foreground/60" : "text-gray-500"}`}
            >
              I can help you understand this book, summarize sections, or answer
              specific questions about the content.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                m.role === "user"
                  ? isDarkMode
                    ? "bg-dark-secondary text-white rounded-tr-none shadow-lg shadow-orange-500/20"
                    : "bg-light-secondary text-white rounded-tr-none shadow-lg shadow-orange-500/20"
                  : isDarkMode
                    ? "bg-dark-secondary/10 text-dark-foreground rounded-tl-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
              }`}
            >
              <div className="flex items-start space-x-2">
                {m.role === "model" && (
                  <Bot size={14} className="mt-1 flex-shrink-0" />
                )}
                <p className="whitespace-pre-wrap leading-relaxed">
                  {m.content}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`p-3 rounded-2xl rounded-tl-none text-sm ${
                isDarkMode ? "bg-dark-secondary/10" : "bg-gray-100"
              }`}
            >
              <Loader2
                size={16}
                className={`animate-spin ${isDarkMode ? "text-dark-secondary" : "text-light-secondary"}`}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className={`p-4 border-t ${
          isDarkMode ? "border-dark-secondary/20" : "border-gray-100"
        }`}
      >
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the book..."
            className={`w-full p-3 pr-12 rounded-xl text-sm outline-none transition-all border ${
              isDarkMode
                ? "bg-dark-background border-dark-secondary/30 focus:border-dark-secondary text-dark-foreground"
                : "bg-gray-50 border-gray-200 focus:bg-white focus:border-light-secondary text-gray-800"
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              input.trim() && !isLoading
                ? isDarkMode
                  ? "bg-dark-secondary text-white hover:opacity-90"
                  : "bg-light-secondary text-white hover:opacity-90"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
    </>
  );
};

export default AiChat;
