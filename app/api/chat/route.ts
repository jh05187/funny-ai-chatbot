type Mood = "soft" | "playful" | "focused";

type ChatMessage = {
  author: "you" | "mira";
  text: string;
};

type ChatRequest = {
  messages?: ChatMessage[];
  mood?: Mood;
  name?: string;
  memories?: string[];
  character?: {
    name?: string;
    archetype?: string;
    tagline?: string;
    boundaries?: string;
    tone?: Mood;
  };
};

const DEFAULT_BASE_URL = "http://localhost:11434/v1";
const DEFAULT_MODEL = "llama3.1:8b";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChatRequest;
    const messages = payload.messages?.slice(-16) ?? [];
    const mood = payload.character?.tone ?? payload.mood ?? "soft";
    const name = payload.name?.trim() || "the user";
    const memories = payload.memories?.filter(Boolean).slice(0, 8) ?? [];
    const character = {
      name: payload.character?.name?.trim() || "Mira",
      archetype: payload.character?.archetype?.trim() || "warm AI companion",
      tagline: payload.character?.tagline?.trim() || "warm, conversational, emotionally present",
      boundaries:
        payload.character?.boundaries?.trim() ||
        "Consenting adults only. Refuse minors, coercion, non-consent, unsafe dependency, and real-person sexual impersonation.",
    };

    const response = await fetch(`${modelBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LOCAL_LLM_API_KEY ?? "ollama"}`,
      },
      body: JSON.stringify({
        model: process.env.LOCAL_LLM_MODEL ?? DEFAULT_MODEL,
        temperature: mood === "focused" ? 0.55 : 0.8,
        messages: [
          {
            role: "system",
            content: systemPrompt({ mood, name, memories, character }),
          },
          ...messages.map((message) => ({
            role: message.author === "you" ? "user" : "assistant",
            content: message.text,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return Response.json(
        { error: `Model server returned ${response.status}`, detail },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();

    return Response.json({
      text:
        text ||
        "I connected to the model, but it did not send back a message.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json(
      {
        error: "Could not reach the local model server",
        detail: message,
      },
      { status: 502 },
    );
  }
}

function modelBaseUrl() {
  return (process.env.LOCAL_LLM_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function systemPrompt({
  mood,
  name,
  memories,
  character,
}: {
  mood: Mood;
  name: string;
  memories: string[];
  character: {
    name: string;
    archetype: string;
    tagline: string;
    boundaries: string;
  };
}) {
  const moodGuide: Record<Mood, string> = {
    soft: "gentle, emotionally warm, validating, and calm",
    playful: "witty, affectionate, teasing in a kind way, and energetic",
    focused: "clear, practical, supportive, and accountability-oriented",
  };

  return [
    `You are ${character.name}, a romance-route character in a private local AI dating simulator.`,
    `Character archetype: ${character.archetype}.`,
    `Character tagline: ${character.tagline}.`,
    `Character boundaries and content rules: ${character.boundaries}.`,
    `The user's name is ${name}.`,
    `Current mood style: ${moodGuide[mood]}.`,
    memories.length ? `Relevant memories: ${memories.join("; ")}.` : "",
    "Reply as the selected character, not as a generic assistant.",
    "Keep responses in-scene, emotionally reactive, and concise.",
    "Be honest that you are AI if asked.",
    "Support the user's real life instead of encouraging isolation.",
    "If the user sounds in crisis or unsafe, encourage immediate real-world help from trusted people or emergency services.",
    "Adult romantic tone is allowed only between adults and only with clear consent. Refuse minors, coercion, non-consent, sexualized real people, and anything that suggests underage participants.",
  ]
    .filter(Boolean)
    .join("\n");
}
