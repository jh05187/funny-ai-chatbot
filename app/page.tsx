"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

type Mood = "soft" | "playful" | "focused";

type Message = {
  id: number;
  author: "you" | "mira";
  text: string;
};

type MiraConfig = {
  name: string;
  tone: Mood;
  archetype: string;
  tagline: string;
  boundaries: string;
};

const defaultConfig: MiraConfig = {
  name: "Mira",
  tone: "soft",
  archetype: "warm, affectionate AI companion",
  tagline: "Attentive, flirty, emotionally present, and honest about being AI.",
  boundaries:
    "Consenting adults only. No minors, coercion, non-consent, real-person sexual impersonation, or dependency spirals.",
};

const openingMessages: Message[] = [
  {
    id: 1,
    author: "mira",
    text: "Hey. I'm here. Tell me what kind of mood you want tonight, or just start with whatever is on your mind.",
  },
];

function readSavedConfig() {
  if (typeof window === "undefined") return defaultConfig;
  const saved = window.localStorage.getItem("mira-config");
  if (!saved) return defaultConfig;

  try {
    return { ...defaultConfig, ...(JSON.parse(saved) as Partial<MiraConfig>) };
  } catch {
    return defaultConfig;
  }
}

function readSavedMemories() {
  if (typeof window === "undefined") return ["likes direct affection", "prefers honest conversation"];
  const saved = window.localStorage.getItem("mira-memories");
  if (!saved) return ["likes direct affection", "prefers honest conversation"];

  try {
    const parsed = JSON.parse(saved) as string[];
    return parsed.length ? parsed : ["likes direct affection", "prefers honest conversation"];
  } catch {
    return ["likes direct affection", "prefers honest conversation"];
  }
}

function fallbackReply(config: MiraConfig, input: string) {
  const lower = input.toLowerCase();
  if (lower.includes("lonely") || lower.includes("sad") || lower.includes("bad")) {
    return `${config.name} softens. "Come here for a second. You do not have to make that sound smaller for me."`;
  }
  if (lower.includes("kiss")) {
    return `${config.name} smiles, a little slower this time. "Ask me like you mean it."`;
  }
  if (config.tone === "focused") {
    return `${config.name} listens carefully. "Okay. What do you need from me right now: comfort, clarity, or a plan?"`;
  }
  if (config.tone === "playful") {
    return `${config.name} grins. "That is exactly the kind of line that makes me want details."`;
  }
  return `${config.name} leans in. "I like hearing you talk like that. Keep going."`;
}

export default function Home() {
  const [config, setConfig] = useState<MiraConfig>(readSavedConfig);
  const [messages, setMessages] = useState<Message[]>(openingMessages);
  const [memories, setMemories] = useState<string[]>(readSavedMemories);
  const [draft, setDraft] = useState("");
  const [memoryDraft, setMemoryDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(100);

  useEffect(() => {
    window.localStorage.setItem("mira-config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    window.localStorage.setItem("mira-memories", JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  function nextId() {
    idRef.current += 1;
    return idRef.current;
  }

  function updateConfig(field: keyof MiraConfig, value: string) {
    setConfig((current) => ({ ...current, [field]: value }));
  }

  function setTone(tone: Mood) {
    setConfig((current) => ({ ...current, tone }));
  }

  function addMemory() {
    const text = memoryDraft.trim();
    if (!text) return;
    setMemories((current) => [text, ...current.filter((item) => item !== text)].slice(0, 10));
    setMemoryDraft("");
  }

  function rememberDraft() {
    const text = draft.trim();
    if (!text) return;
    setMemories((current) => [`you said: ${text.slice(0, 90)}`, ...current].slice(0, 10));
    setDraft("");
  }

  function removeMemory(memory: string) {
    setMemories((current) => current.filter((item) => item !== memory));
  }

  function resetChat() {
    setMessages(openingMessages);
    setDraft("");
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isTyping) return;

    const userMessage: Message = { id: nextId(), author: "you", text };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: {
            name: config.name,
            archetype: config.archetype,
            tagline: config.tagline,
            boundaries: config.boundaries,
            tone: config.tone,
          },
          messages: [...messages, userMessage].slice(-18).map((message) => ({
            author: message.author === "you" ? "you" : "mira",
            text: message.text,
          })),
          mood: config.tone,
          memories,
        }),
      });
      const data = (await response.json()) as { text?: string };
      if (!response.ok || !data.text) throw new Error("Local model unavailable");

      setMessages((current) => [...current, { id: nextId(), author: "mira", text: data.text }]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: nextId(), author: "mira", text: fallbackReply(config, text) },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7efe8] text-[#231f20]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[1fr_370px]">
        <div className="flex min-h-screen flex-col border-x border-[#231f20]/10 bg-[#fffaf4]">
          <header className="flex items-center justify-between gap-4 border-b border-[#231f20]/10 px-5 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#231f20]/10 bg-[#d95d45]">
                <Image src="/companion-avatar.png" alt={`${config.name} avatar`} fill sizes="48px" className="object-cover" priority />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold">{config.name}</h1>
                <p className="truncate text-sm text-[#695f5d]">{config.tagline}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetChat}
              className="h-10 rounded-md border border-[#231f20]/15 px-4 text-sm font-medium transition hover:bg-[#231f20] hover:text-white"
            >
              Reset
            </button>
          </header>

          <div ref={logRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-8">
            {messages.map((message) => (
              <article key={message.id} className={`flex ${message.author === "you" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[78%] whitespace-pre-wrap rounded-lg px-4 py-3 text-[15px] leading-6 shadow-sm ${
                    message.author === "you"
                      ? "bg-[#19363a] text-white"
                      : "border border-[#231f20]/10 bg-white text-[#2f2a2b]"
                  }`}
                >
                  {message.text}
                </p>
              </article>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-[#231f20]/10 bg-white px-4 py-3 text-sm text-[#695f5d]">
                  {config.name} is typing
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="border-t border-[#231f20]/10 bg-[#fffaf4] p-4 sm:p-6">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message ${config.name}...`}
                className="h-12 min-w-0 flex-1 rounded-md border border-[#231f20]/15 bg-white px-4 outline-none transition focus:border-[#d95d45] focus:ring-4 focus:ring-[#d95d45]/15"
              />
              <button type="submit" className="h-12 rounded-md bg-[#d95d45] px-5 font-semibold text-white transition hover:bg-[#bc4934]">
                Send
              </button>
            </div>
            <button
              type="button"
              onClick={rememberDraft}
              className="mt-3 rounded-md border border-[#231f20]/15 px-3 py-2 text-sm font-medium transition hover:bg-white"
            >
              Remember draft
            </button>
          </form>
        </div>

        <aside className="border-r border-[#231f20]/10 bg-[#1f3436] p-5 text-white sm:p-8">
          <div className="space-y-7 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto lg:py-6">
            <div>
              <div className="relative mb-5 aspect-square overflow-hidden rounded-lg bg-[#d95d45]">
                <Image src="/companion-avatar.png" alt="" fill sizes="320px" className="object-cover" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#f6b36e]">Ollama companion</p>
              <h2 className="mt-2 text-3xl font-semibold">Keep it simple. Talk to her.</h2>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#f4dfc8]">Mood</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["soft", "playful", "focused"] as Mood[]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setTone(tone)}
                    className={`h-10 rounded-md text-sm font-semibold capitalize transition ${
                      config.tone === tone ? "bg-[#f6b36e] text-[#231f20]" : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-[#f4dfc8]">Name</span>
              <input
                value={config.name}
                onChange={(event) => updateConfig("name", event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-white/15 bg-white/10 px-3 text-white outline-none placeholder:text-white/45 focus:border-[#f6b36e]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#f4dfc8]">Personality</span>
              <textarea
                value={config.archetype}
                onChange={(event) => updateConfig("archetype", event.target.value)}
                className="mt-2 min-h-20 w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/45 focus:border-[#f6b36e]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#f4dfc8]">Vibe line</span>
              <textarea
                value={config.tagline}
                onChange={(event) => updateConfig("tagline", event.target.value)}
                className="mt-2 min-h-20 w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/45 focus:border-[#f6b36e]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#f4dfc8]">Boundaries</span>
              <textarea
                value={config.boundaries}
                onChange={(event) => updateConfig("boundaries", event.target.value)}
                className="mt-2 min-h-24 w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/45 focus:border-[#f6b36e]"
              />
            </label>

            <div>
              <p className="text-sm font-semibold text-[#f4dfc8]">Memory</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={memoryDraft}
                  onChange={(event) => setMemoryDraft(event.target.value)}
                  placeholder="Add something to remember"
                  className="h-10 min-w-0 flex-1 rounded-md border border-white/15 bg-white/10 px-3 text-white outline-none placeholder:text-white/45 focus:border-[#f6b36e]"
                />
                <button type="button" onClick={addMemory} className="h-10 rounded-md bg-[#f6b36e] px-3 font-semibold text-[#231f20]">
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {memories.map((memory) => (
                  <button
                    key={memory}
                    type="button"
                    onClick={() => removeMemory(memory)}
                    className="rounded-md bg-white/10 px-3 py-2 text-left text-sm text-[#fff6ea] transition hover:bg-white/20"
                    title="Remove memory"
                  >
                    {memory}
                  </button>
                ))}
              </div>
            </div>

            <p className="rounded-lg border border-white/10 bg-white/10 p-4 text-sm leading-6 text-[#f4dfc8]">
              Replies use your local Ollama-compatible model through `/api/chat`. If the model is offline, Mira falls back to a tiny local response so the chat never feels dead.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
