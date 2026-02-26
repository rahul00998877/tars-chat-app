"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

export default function ChatPage() {
  const { user } = useUser();

  const rooms = ["General", "Random"];
  const [room, setRoom] = useState("General");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages per room
  useEffect(() => {
    const saved = localStorage.getItem(room);
    setMessages(saved ? JSON.parse(saved) : []);
  }, [room]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const saveMessages = (updated: any[]) => {
    setMessages(updated);
    localStorage.setItem(room, JSON.stringify(updated));
  };

  const fakeAIResponse = () => {
    const replies = [
      "Interesting 🤔",
      "Tell me more!",
      "Nice point 👍",
      "That sounds great 🚀",
      "Explain further?"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    if (editingIndex !== null) {
      const updated = [...messages];
      updated[editingIndex].text = input;
      updated[editingIndex].edited = true;
      saveMessages(updated);
      setEditingIndex(null);
      setInput("");
      return;
    }

    const newMessage = {
      text: input,
      sender: user?.firstName || "You",
      time: new Date().toLocaleTimeString(),
      status: "sent",
      reactions: [],
    };

    const updated = [...messages, newMessage];
    saveMessages(updated);
    setInput("");

    setIsTyping(true);

    setTimeout(() => {
      const aiMessage = {
        text: fakeAIResponse(),
        sender: "Tars AI 🤖",
        time: new Date().toLocaleTimeString(),
      };

      const finalMessages = [
        ...updated.map((msg) =>
          msg.status === "sent" ? { ...msg, status: "seen" } : msg
        ),
        aiMessage,
      ];

      saveMessages(finalMessages);
      setIsTyping(false);
    }, 1500);
  };

  const editMessage = (index: number) => {
    setEditingIndex(index);
    setInput(messages[index].text);
  };

  const deleteMessage = (index: number) => {
    const updated = messages.filter((_, i) => i !== index);
    saveMessages(updated);
  };

  const addReaction = (index: number, emoji: string) => {
    const updated = [...messages];
    updated[index].reactions = [
      ...(updated[index].reactions || []),
      emoji,
    ];
    saveMessages(updated);
  };

  const clearChat = () => {
    localStorage.removeItem(room);
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

      {/* Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur border-r border-gray-700 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-blue-400 mb-6">
          Tars Chat
        </h2>

        <div className="space-y-3">
          {rooms.map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              className={`w-full text-left px-4 py-2 rounded-lg transition flex justify-between ${
                room === r
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <span># {r}</span>
              <span className="text-xs bg-black/40 px-2 rounded-full">
                {JSON.parse(localStorage.getItem(r) || "[]").length}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={clearChat}
          className="mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
        >
          Clear Chat
        </button>

        <div className="mt-auto pt-6">
          <UserButton />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-black/30 backdrop-blur">
          <h1 className="text-xl font-semibold">
            # {room}
          </h1>
          <p className="text-sm text-green-400">
            ● Online
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-sm px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
                msg.sender === user?.firstName
                  ? "ml-auto bg-blue-600"
                  : "bg-gray-700"
              }`}
            >
              <div className="flex justify-between text-sm font-semibold">
                <span>{msg.sender}</span>

                {msg.sender === user?.firstName && (
                  <div className="space-x-2 text-xs">
                    <button onClick={() => editMessage(index)}>Edit</button>
                    <button onClick={() => deleteMessage(index)}>Delete</button>
                  </div>
                )}
              </div>

              <div className="mt-1 text-sm">{msg.text}</div>

              <div className="flex justify-between items-center mt-2 text-xs text-gray-300">
                <span>
                  {msg.time}
                  {msg.edited && " (edited)"}
                </span>
                <span>
                  {msg.status === "sent" && "✓"}
                  {msg.status === "seen" && "✓✓"}
                </span>
              </div>

              {/* Reactions */}
              <div className="mt-2 flex gap-2 text-sm">
                {["👍", "❤️", "😂", "😮"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(index, emoji)}
                    className="hover:scale-110 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="mt-1 text-sm">
                {msg.reactions?.join(" ")}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="bg-gray-700 px-4 py-2 rounded-xl w-fit animate-pulse">
              Tars AI is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-700 bg-black/40 backdrop-blur flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              editingIndex !== null ? "Edit message..." : `Message #${room}`
            }
            className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            {editingIndex !== null ? "Update" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}