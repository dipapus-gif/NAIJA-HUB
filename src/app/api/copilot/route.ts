import { NextResponse } from "next/server";
import { COPILOT_SYSTEM_PROMPT, localCopilotReply } from "@/lib/copilot";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  let messages: Msg[] = [];
  try {
    const body = await request.json();
    messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m: Msg) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-10)
      .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });

  const key = process.env.AI_GATEWAY_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.COPILOT_MODEL || "anthropic/claude-haiku-4.5",
          max_tokens: 400,
          messages: [{ role: "system", content: COPILOT_SYSTEM_PROMPT }, ...messages],
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text === "string" && text.trim()) return NextResponse.json({ ok: true, reply: text.trim(), mode: "ai" });
      } else {
        console.error("copilot gateway status", res.status);
      }
    } catch (e) {
      console.error("copilot gateway error", e);
    }
  }
  return NextResponse.json({ ok: true, reply: localCopilotReply(last.content), mode: "local" });
}
