import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const KEYS_FILE = path.join(process.cwd(), "data", "api-keys.json");

export async function GET() {
  try {
    const raw = await fs.readFile(KEYS_FILE, "utf-8").catch(() => "{}");
    const keys = JSON.parse(raw);
    // Mask all values for security
    const masked: Record<string, string> = {};
    for (const [k, v] of Object.entries(keys)) {
      const s = String(v);
      if (s.length > 8) {
        masked[k] = s.slice(0, 6) + "****" + s.slice(-4);
      } else if (s.length > 0) {
        masked[k] = "****";
      }
    }
    return NextResponse.json({ keys: masked, hasKeys: Object.keys(keys).length > 0 });
  } catch {
    return NextResponse.json({ keys: {}, hasKeys: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, key } = body;
    if (!provider || typeof provider !== "string") {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }
    const raw = await fs.readFile(KEYS_FILE, "utf-8").catch(() => "{}");
    const keys: Record<string, string> = JSON.parse(raw);
    if (key === "" || key === undefined || key === null) {
      delete keys[provider];
    } else {
      keys[provider] = String(key);
    }
    await fs.mkdir(path.dirname(KEYS_FILE), { recursive: true });
    await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2), "utf-8");
    return NextResponse.json({ success: true, provider, saved: !!key });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");
    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }
    const raw = await fs.readFile(KEYS_FILE, "utf-8").catch(() => "{}");
    const keys: Record<string, string> = JSON.parse(raw);
    delete keys[provider];
    await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2), "utf-8");
    return NextResponse.json({ success: true, deleted: provider });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
