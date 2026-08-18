import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const KEYS_FILE = path.join(process.cwd(), "data", "api-keys.json");

async function getKeys(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(KEYS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch { return {}; }
}

async function callDeepSeek(messages: { role: string; content: string }[], key: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 512, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response";
}

async function callOpenAI(messages: { role: string; content: string }[], key: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 512, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response";
}

async function callGemini(messages: { role: string; content: string }[], key: string): Promise<string> {
  const geminiMsgs = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: geminiMsgs, generationConfig: { maxOutputTokens: 512 } }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }
    const keys = await getKeys();

    let reply: string | null = null;
    let provider = "none";

    if (keys.deepseek) { try { reply = await callDeepSeek(messages, keys.deepseek); provider = "deepseek"; } catch (e) { console.error("DeepSeek:", e); } }
    if (!reply && keys.openai) { try { reply = await callOpenAI(messages, keys.openai); provider = "openai"; } catch (e) { console.error("OpenAI:", e); } }
    if (!reply && keys.gemini) { try { reply = await callGemini(messages, keys.gemini); provider = "gemini"; } catch (e) { console.error("Gemini:", e); } }

    if (!reply) {
      return NextResponse.json({ error: "No API key configured. Add a key in Settings > Keys.", provider: "none" }, { status: 400 });
    }
    return NextResponse.json({ reply, provider });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
