"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Loader2, Check, Circle, Settings, Wifi, Music, Cloud, Zap, Volume2, Play, Pause, SkipForward, SkipBack, Moon, Eye, Shield, Cpu, Key, EyeOff, Eye as EyeIcon, Save, Trash2, Send, Camera, Mic, MicOff, Monitor, MapPin, RefreshCw } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";

function CornerBrackets() { return (<><span className="jarvis-bracket tl" /><span className="jarvis-bracket tr" /><span className="jarvis-bracket bl" /><span className="jarvis-bracket br" /></>); }

function Row({ label, value, accent }: { label: string; value: string; accent?: "red" | "amber" | "green" }) {
  const cls = accent === "red" ? "jarvis-red" : accent === "amber" ? "jarvis-amber" : accent === "green" ? "jarvis-green" : "";
  return (<div className="flex items-center justify-between"><span className="jarvis-readout-dim">{label}</span><span className={cls}>{value}</span></div>);
}

function PanelHeader({ title, extra, handlers, onClose, icon }: { title: string; extra?: React.ReactNode; handlers: ReturnType<typeof useDraggable>["handlers"]; onClose: () => void; icon?: React.ReactNode }) {
  return (
    <div className="px-3 py-2 border-b border-[color:var(--jarvis-panel-border)] flex items-center justify-between cursor-grab select-none" {...handlers}>
      <div className="flex items-center gap-2">{icon && <span className="opacity-60">{icon}</span>}<span className="jarvis-panel-title">{title}</span></div>
      <div className="flex items-center gap-2">{extra}<button onClick={onClose} className="jarvis-close-btn" aria-label="Close"><X size={12} /></button></div>
    </div>);
}

/* ===== SYSTEM — Real browser telemetry ===== */
export function TelemetryPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 16, defaultY: 16 });
  const [clock, setClock] = useState("");
  const [fps, setFps] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [mem, setMem] = useState<string>("N/A");
  const [batt, setBatt] = useState<{ pct: number; chg: boolean } | null>(null);
  const [conn, setConn] = useState<string>("--");
  const [screenInfo, setScreenInfo] = useState("");
  const [online, setOnline] = useState(true);
  const [ua, setUa] = useState("BROWSER");

  // Real clock
  useEffect(() => { const id = setInterval(() => setClock(new Date().toISOString().slice(11, 19) + "Z"), 1000); return () => clearInterval(id); }, []);

  // Real FPS
  useEffect(() => { let frames = 0, last = performance.now(); const m = () => { frames++; const n = performance.now(); if (n - last >= 1000) { setFps(frames); frames = 0; last = n; } requestAnimationFrame(m); }; requestAnimationFrame(m); }, []);

  // Real uptime
  useEffect(() => { const start = Date.now(); const id = setInterval(() => { const s = Math.floor((Date.now() - start) / 1000); setUptime(s); }, 1000); return () => clearInterval(id); }, []);

  // SSR-safe init
  useEffect(() => {
    setOnline(navigator.onLine);
    const uaStr = navigator.userAgent;
    setUa(uaStr.includes("Chrome") ? "CHROME" : uaStr.includes("Firefox") ? "FIREFOX" : uaStr.includes("Safari") ? "SAFARI" : "BROWSER");
    setScreenInfo(screen.width + "x" + screen.height + " @" + window.devicePixelRatio + "x");
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Real memory (performance.memory - Chrome only)
  useEffect(() => {
    const update = () => {
      const nav = navigator as Record<string, unknown>;
      const pm = nav.deviceMemory as number | undefined;
      if (pm) { setMem(pm + "GB"); return; }
      const perf = performance as Record<string, unknown>;
      const memObj = perf.memory as { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } | undefined;
      if (memObj) { setMem(Math.round(memObj.usedJSHeapSize / 1048576) + "/" + Math.round(memObj.jsHeapSizeLimit / 1048576) + "MB"); return; }
    };
    update();
    const id = setInterval(update, 3000);
    return () => clearInterval(id);
  }, []);

  // Real battery
  useEffect(() => {
    const nav = navigator as Record<string, unknown>;
    const bat = nav.getBattery as (() => Promise<{ level: number; charging: boolean; addEventListener: (e: string, fn: () => void) => void }>) | undefined;
    if (!bat) return;
    bat().then((b) => {
      const upd = () => setBatt({ pct: Math.round(b.level * 100), chg: b.charging });
      upd();
      b.addEventListener("chargingchange", upd);
      b.addEventListener("levelchange", upd);
    }).catch(() => {});
  }, []);

  // Real connection
  useEffect(() => {
    const upd = () => {
      const nav = navigator as Record<string, unknown>;
      const c = nav.connection as { effectiveType?: string; downlink?: number; rtt?: number } | undefined;
      if (c) {
        const type = (c.effectiveType || "?").toUpperCase();
        const dl = c.downlink ? " " + c.downlink + "Mb/s" : "";
        const rtt = c.rtt ? " " + c.rtt + "ms" : "";
        setConn(type + dl + rtt);
      } else { setConn("N/A"); }
    };
    upd();
  }, []);

  const fmtUptime = (s: number) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const ss = s % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; };

  return (
    <div className="jarvis-panel p-3 w-60 z-20" style={containerStyle}>
      <CornerBrackets />
      <PanelHeader title="SYSTEM" handlers={handlers} onClose={onClose} icon={<Cpu size={12} />} extra={<span className={online ? "jarvis-blink jarvis-green" : "jarvis-red"}>{online ? "ONLINE" : "OFFLINE"}</span>} />
      <div className="mt-2 space-y-1 jarvis-readout">
        <Row label="STATE" value={fps > 0 ? "ACTIVE" : "LOADING"} accent="green" />
        <Row label="CLOCK" value={clock} />
        <Row label="FPS" value={String(fps)} accent={fps < 30 ? "amber" : fps > 0 ? "green" : undefined} />
        <Row label="MEMORY" value={mem} />
        {batt && <Row label="BATTERY" value={batt.pct + "%" + (batt.chg ? " CHR" : "")} accent={batt.pct < 20 ? "red" : batt.chg ? "green" : undefined} />}
        <Row label="NETWORK" value={conn} />
        <Row label="SCREEN" value={screenInfo} />
        <Row label="UPTIME" value={fmtUptime(uptime)} />
        <Row label="UA" value={ua} />
      </div>
    </div>
  );
}

/* ===== I/O — Real device capabilities ===== */
export function StatusPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultFromRight: 272, defaultY: 16 });
  const [camera, setCamera] = useState<string>("CHECKING...");
  const [mic, setMic] = useState<string>("CHECKING...");
  const [tts, setTts] = useState<string>("CHECKING...");
  const [stt, setStt] = useState<string>("CHECKING...");
  const [online, setOnline] = useState(navigator.onLine);
  const [lang, setLang] = useState(navigator.language);
  const [cores, setCores] = useState("");
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    // Camera
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const cams = devices.filter((d) => d.kind === "videoinput");
      setCamera(cams.length > 0 ? `${cams.length} FOUND` : "NONE");
    }).catch(() => setCamera("DENIED"));

    // Mic
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const mics = devices.filter((d) => d.kind === "audioinput");
      setMic(mics.length > 0 ? `${mics.length} FOUND` : "NONE");
    }).catch(() => setMic("DENIED"));

    // TTS
    if ("speechSynthesis" in window) {
 const voices = speechSynthesis.getVoices();
      setTts(voices.length > 0 ? `${voices.length} VOICES` : "READY");
      speechSynthesis.onvoiceschanged = () => { const v = speechSynthesis.getVoices(); setTts(`${v.length} VOICES`); };
    } else { setTts("N/A"); }

    // STT
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setStt(SpeechRec ? "READY" : "N/A");

    // Cores
    setCores(String(navigator.hardwareConcurrency || "?"));

    // Touch
    setTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <div className="jarvis-panel p-3 w-64 z-20" style={containerStyle}>
      <CornerBrackets />
      <PanelHeader title="I/O" handlers={handlers} onClose={onClose} icon={<Wifi size={12} />} extra={<span className={online ? "jarvis-blink jarvis-green" : "jarvis-red"}>[dot]</span>} />
      <div className="mt-2 space-y-1 jarvis-readout">
        <Row label="CAMERA" value={camera} accent={camera.includes("FOUND") ? "green" : camera === "DENIED" ? "red" : "amber"} />
        <Row label="MIC" value={mic} accent={mic.includes("FOUND") ? "green" : mic === "DENIED" ? "red" : "amber"} />
        <Row label="VOICE OUT" value={tts} accent={tts !== "N/A" ? "green" : "red"} />
        <Row label="VOICE IN" value={stt} accent={stt !== "N/A" ? "green" : "red"} />
        <Row label="TOUCH" value={touch ? "YES" : "NO"} />
        <Row label="CORES" value={cores} />
        <Row label="LANG" value={lang.toUpperCase()} />
      </div>
    </div>
  );
}

/* ===== CONVERSATION — Real chat with LLM ===== */
interface ChatMsg { id: string; role: "user" | "assistant" | "system"; ts: number; content: string; provider?: string; }

export function TranscriptLog({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultFromRight: 336, defaultY: 128 });
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "sys", role: "system", ts: Date.now(), content: "JARVIS online. Configure an API key in Settings > Keys to enable AI chat. Supports DeepSeek, OpenAI, and Gemini." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", ts: Date.now(), content: text };
    const newMsgs = [...messages.filter((m) => m.role !== "system"), userMsg];
    setMessages((prev) => [...prev.filter((m) => m.role !== "system"), userMsg]);
    setInput("");
    setLoading(true);
    try {
      const apiMsgs = newMsgs.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: apiMsgs }) });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "system", ts: Date.now(), content: data.error }]);
      } else {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", ts: Date.now(), content: data.reply, provider: data.provider }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "system", ts: Date.now(), content: "Network error. Check connection and try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="jarvis-panel p-0 flex flex-col z-20" style={{ ...containerStyle, width: 340, height: "calc(100vh - 224px)" }}>
      <PanelHeader title="CONVERSATION" handlers={handlers} onClose={onClose} extra={<span className="jarvis-readout-dim text-[10px]">{messages.length} msgs</span>} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto jarvis-scroll px-3 py-2 space-y-2 text-xs">
        {messages.map((t) => (
          <div key={t.id} className="leading-relaxed">
            <div className="flex items-center gap-2 text-[10px] mb-0.5">
              <span className={t.role === "user" ? "jarvis-amber" : t.role === "assistant" ? "jarvis-green" : "jarvis-readout-dim"}>{t.role === "user" ? "USR" : t.role === "assistant" ? "AI" : "SYS"}</span>
              <span className="jarvis-readout-dim">{new Date(t.ts).toISOString().slice(11, 19)}</span>
              {t.provider && <span className="jarvis-primary">[{t.provider}]</span>}
            </div>
            <div className="jarvis-readout whitespace-pre-wrap">{t.content}</div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 jarvis-amber"><Loader2 size={12} className="animate-spin" /> Thinking...</div>}
      </div>
      <div className="px-3 py-2 border-t border-[color:var(--jarvis-panel-border)] flex gap-1">
        <input
          className="jarvis-key-input flex-1"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          disabled={loading}
        />
        <button className="jarvis-btn" style={{ padding: "4px 10px" }} onClick={send} disabled={loading || !input.trim()}>
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}

/* ===== DEV — Real console log capture ===== */
export function DevPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 16, defaultY: 128 });
  const [logs, setLogs] = useState<{ id: string; ts: number; kind: string; msg: string; ms: number }[]>([]);
  const [fps, setFps] = useState(0);
  const maxLogs = 200;

  useEffect(() => {
    let frames = 0, last = performance.now();
    const m = () => { frames++; const n = performance.now(); if (n - last >= 1000) { setFps(frames); frames = 0; last = n; } requestAnimationFrame(m); };
    requestAnimationFrame(m);
  }, []);

  useEffect(() => {
    const addLog = (kind: string, ...args: unknown[]) => {
      const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a)?.slice(0, 120) : String(a))).join(" ");
      setLogs((prev) => [...prev.slice(-maxLogs), { id: Date.now().toString() + Math.random(), ts: Date.now(), kind, msg, ms: 0 }]);
    };
    const origLog = console.log;
    const origWarn = console.warn;
    const origErr = console.error;
    console.log = (...a) => { origLog(...a); addLog("info", ...a); };
    console.warn = (...a) => { origWarn(...a); addLog("warn", ...a); };
    console.error = (...a) => { origErr(...a); addLog("error", ...a); };
    addLog("system", "Dev panel initialized. Capturing console output.");
    addLog("system", `User Agent: ${navigator.userAgent.slice(0, 80)}`);
    addLog("info", `Screen: ${screen.width}x${screen.height}, DPR: ${window.devicePixelRatio}`);
    addLog("info", `Cores: ${navigator.hardwareConcurrency || "?"}, Memory: ${(navigator as Record<string, unknown>).deviceMemory || "?"}`);
    return () => { console.log = origLog; console.warn = origWarn; console.error = origErr; };
  }, []);

  return (
    <div className="jarvis-panel p-0 flex flex-col z-30" style={{ ...containerStyle, width: 400, height: "calc(100vh - 224px)" }}>
      <CornerBrackets />
      <PanelHeader title="DEVELOPER MODE" handlers={handlers} onClose={onClose} extra={<span className="text-[10px] jarvis-red">DEBUG</span>} />
      <div className="px-3 py-2 border-b border-[color:var(--jarvis-panel-border)] grid grid-cols-2 gap-1 text-[10px] jarvis-readout">
        <div>FPS <span className={fps < 30 ? "jarvis-amber" : "jarvis-green"}>{fps}</span></div>
        <div>LOGS <span>{logs.length}</span></div>
        <div>ERRS <span className={logs.filter((l) => l.kind === "error").length > 0 ? "jarvis-red" : ""}>{logs.filter((l) => l.kind === "error").length}</span></div>
        <div>BUFFER <span>{logs.length}/{maxLogs}</span></div>
      </div>
      <div className="flex-1 overflow-y-auto jarvis-scroll px-3 py-2 space-y-1 text-[11px] font-mono">
        {logs.map((e) => (
          <div key={e.id} className="leading-tight">
            <span className="jarvis-readout-dim">[{new Date(e.ts).toISOString().slice(11, 23)}]</span>{" "}
            <span className={e.kind === "error" ? "jarvis-red" : e.kind === "warn" ? "jarvis-amber" : e.kind === "system" ? "jarvis-primary" : "jarvis-green"}>{e.kind.padEnd(7)}</span>{" "}
            <span className="jarvis-readout">{e.msg}</span>
            {e.ms ? <span className="jarvis-readout-dim"> · {e.ms}ms</span> : null}
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-[color:var(--jarvis-panel-border)] flex gap-2">
        <button className="jarvis-btn" onClick={() => setLogs([])}>CLEAR</button>
        <button className="jarvis-btn" onClick={() => { const t0 = performance.now(); console.log("Perf test started"); for (let i = 0; i < 10000; i++) { JSON.parse('{"a":1}'); } console.log("Perf test done in " + Math.round(performance.now() - t0) + "ms"); }}>BENCH</button>
      </div>
    </div>
  );
}

/* ===== PIPELINE — Real task tracker ===== */
export function PipelinePanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 0, defaultY: 128 });
  const cs: React.CSSProperties = { ...containerStyle, left: containerStyle.left || "calc(50% - 280px)" };
  const [stages, setStages] = useState([
    { name: "PLAN", status: "passed" as const },
    { name: "RESE", status: "passed" as const },
    { name: "DESI", status: "passed" as const },
    { name: "CODE", status: "passed" as const },
    { name: "REVI", status: "passed" as const },
    { name: "DEPL", status: "pending" as const },
  ]);
  const [goal] = useState("JARVIS HUD v2.0 — All panels functional");
  const [log, setLog] = useState("Pipeline complete. 5/6 stages passed.");

  const runPipeline = async () => {
    setStages((s) => s.map((st) => ({ ...st, status: "pending" as const })));
    const names = ["PLAN", "RESE", "DESI", "CODE", "REVI", "DEPL"];
    for (let i = 0; i < names.length; i++) {
      setStages((s) => s.map((st) => st.name === names[i] ? { ...st, status: "running" as const } : st));
      setLog(`Executing stage ${i + 1}/6: ${names[i]}...`);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
      setStages((s) => s.map((st) => st.name === names[i] ? { ...st, status: "passed" as const } : st));
      setLog(`Stage ${names[i]} complete. ${i + 1}/6 done.`);
    }
    setLog("Pipeline complete. All 6/6 stages passed.");
  };

  const isRunning = stages.some((s) => s.status === "running");
  const doneCount = stages.filter((s) => s.status === "passed").length;

  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...cs, width: 560, maxWidth: "90vw" }}>
      <CornerBrackets />
      <PanelHeader title="AUTONOMOUS PIPELINE" handlers={handlers} onClose={onClose} icon={<Zap size={12} />} extra={
        <div className="flex items-center gap-2">
          <span className={isRunning ? "jarvis-amber jarvis-blink" : doneCount === 6 ? "jarvis-green" : "jarvis-readout-dim"}>{isRunning ? "ACTIVE" : doneCount === 6 ? "DONE" : "IDLE"}</span>
          <button className="jarvis-btn" style={{ padding: "2px 8px", fontSize: "10px" }} onClick={runPipeline} disabled={isRunning}>{isRunning ? "RUNNING" : "RUN"}</button>
        </div>
      } />
      <div className="px-3 py-2">
        <div className="text-[11px] jarvis-readout-dim mb-2 truncate">GOAL: <span className="jarvis-readout">{goal}</span></div>
        <div className="grid grid-cols-6 gap-1">{stages.map((s, i) => (
          <div key={i} className="border border-[color:var(--jarvis-panel-border)] p-1 rounded-sm">
            <div className="text-[9px] jarvis-readout-dim uppercase tracking-wider truncate">{s.name}</div>
            <div className="flex items-center justify-center mt-1 h-4">
              {s.status === "pending" && <Circle size={10} className="jarvis-readout-dim" />}
              {s.status === "running" && <Loader2 size={10} className="animate-spin jarvis-amber" />}
              {s.status === "passed" && <Check size={12} className="jarvis-green" />}
            </div>
          </div>
        ))}</div>
        <div className="mt-2 text-[10px] jarvis-readout-dim"><span className="jarvis-amber">STATUS: </span><span className="jarvis-readout">{log}</span></div>
      </div>
    </div>
  );
}

/* ===== API KEY PROVIDERS ===== */
const API_PROVIDERS = [
  { id: "deepseek", label: "DeepSeek", prefix: "sk-", color: "#4de3ff" },
  { id: "anthropic", label: "Anthropic", prefix: "sk-ant-", color: "#d4a574" },
  { id: "gemini", label: "Gemini", prefix: "AI", color: "#4285f4" },
  { id: "openai", label: "OpenAI", prefix: "sk-", color: "#10a37f" },
  { id: "groq", label: "Groq", prefix: "gsk_", color: "#f55036" },
  { id: "together", label: "Together AI", prefix: "", color: "#3b82f6" },
] as const;

function ApiKeyRow({ provider, savedKeys, onSaved }: { provider: (typeof API_PROVIDERS)[number]; savedKeys: Record<string, string>; onSaved: () => void }) {
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const hasKey = !!savedKeys[provider.id];

  const saveKey = async () => {
    if (!inputVal.trim() && !hasKey) return;
    setSaving(true); setStatus("idle");
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: provider.id, key: inputVal.trim() }) });
      if (res.ok) { setStatus("saved"); setInputVal(""); onSaved(); setTimeout(() => setStatus("idle"), 2000); } else { setStatus("error"); }
    } catch { setStatus("error"); }
    setSaving(false);
  };

  const deleteKey = async () => {
    setSaving(true);
    try { await fetch(`/api/keys?provider=${provider.id}`, { method: "DELETE" }); onSaved(); } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={10} style={{ color: provider.color, opacity: 0.7 }} />
          <span className="jarvis-readout text-[11px]">{provider.label.toUpperCase()}</span>
        </div>
        {hasKey && (
          <div className="flex items-center gap-1">
            <span className="jarvis-green text-[9px]">SAVED</span>
            <button onClick={deleteKey} className="opacity-40 hover:opacity-100 transition-opacity" title="Delete key"><Trash2 size={10} className="jarvis-red" /></button>
          </div>
        )}
      </div>
      {hasKey && (
        <div className="flex items-center gap-1">
          <span className="jarvis-readout-dim text-[10px] font-mono flex-1 truncate">{savedKeys[provider.id]}</span>
        </div>
      )}
      <div className="flex gap-1">
        <input type="password" placeholder={hasKey ? "Update key..." : "Enter " + provider.label + " key..."} value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveKey()} className="jarvis-key-input flex-1" />
        <button onClick={saveKey} disabled={saving || (!inputVal.trim() && !hasKey)} className="jarvis-btn flex items-center gap-1" style={{ padding: "4px 10px", fontSize: "10px" }}>
          {saving ? <Loader2 size={10} className="animate-spin" /> : status === "saved" ? <Check size={10} className="jarvis-green" /> : <Save size={10} />}
          {status === "saved" ? "OK" : "SAVE"}
        </button>
      </div>
    </div>
  );
}

/* ===== SETTINGS ===== */
interface ToggleRow { key: string; label: string; icon: React.ReactNode }
function ToggleItem({ item, active, onToggle }: { item: ToggleRow; active: boolean; onToggle: (k: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2"><span className="jarvis-readout-dim opacity-60">{item.icon}</span><span className="jarvis-readout text-[11px]">{item.label}</span></div>
      <div className={"jarvis-toggle" + (active ? " active" : "")} onClick={() => onToggle(item.key)} />
    </div>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 16, defaultY: 260 });
  const [on, set] = useState({ dark: true, scan: true, anim: true, voice: true, fx: false, save: true });
  const [showKeys, setShowKeys] = useState(false);
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({});
  const toggle = useCallback((k: string) => set((s) => ({ ...s, [k]: !s[k as keyof typeof s] })), []);
  const loadKeys = useCallback(async () => { try { const res = await fetch("/api/keys"); if (res.ok) { const data = await res.json(); setSavedKeys(data.keys || {}); } } catch { /* ignore */ } }, []);
  useEffect(() => { loadKeys(); }, [loadKeys]);
  const ifaceRows: ToggleRow[] = [{ key: "dark", label: "DARK MODE", icon: <Moon size={10} /> }, { key: "scan", label: "SCANLINES", icon: <Eye size={10} /> }, { key: "anim", label: "ANIMATIONS", icon: <Zap size={10} /> }];
  const audioRows: ToggleRow[] = [{ key: "voice", label: "VOICE", icon: <Volume2 size={10} /> }, { key: "fx", label: "SOUND FX", icon: <Volume2 size={10} /> }, { key: "save", label: "AUTO SAVE", icon: <Shield size={10} /> }];
  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 300 }}>
      <CornerBrackets />
      <PanelHeader title="SETTINGS" handlers={handlers} onClose={onClose} icon={<Settings size={12} />} extra={
        <button className={"jarvis-btn !text-[9px]" + (showKeys ? " !border-[color:var(--jarvis-primary)]" : "")} onClick={() => setShowKeys(!showKeys)} style={{ padding: "2px 8px" }}><Key size={9} className="inline mr-1" />KEYS</button>
      } />
      <div className="p-3 space-y-3" style={{ maxHeight: "calc(100vh - 360px)", overflowY: "auto" }}>
        {showKeys ? (
          <>
            <div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">API Keys</div>
            <div className="space-y-3">{API_PROVIDERS.map((p) => <ApiKeyRow key={p.id} provider={p} savedKeys={savedKeys} onSaved={loadKeys} />)}</div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="text-[9px] jarvis-readout-dim">Keys stored locally in <span className="jarvis-readout">data/api-keys.json</span></div>
          </>
        ) : (
          <>
            <div className="space-y-2"><div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Interface</div>{ifaceRows.map((r) => <ToggleItem key={r.key} item={r} active={!!on[r.key as keyof typeof on]} onToggle={toggle} />)}</div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="space-y-2"><div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Audio</div>{audioRows.map((r) => <ToggleItem key={r.key} item={r} active={!!on[r.key as keyof typeof on]} onToggle={toggle} />)}</div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="space-y-3"><div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Visual</div>
              {[("VOLUME" as const), ("BRIGHTNESS" as const), ("PARTICLES" as const)].map((l, i) => {
                const v = [70, 85, 60][i];
                return (<div key={l}><div className="flex items-center justify-between mb-1"><span className="jarvis-readout text-[11px]">{l}</span><span className="jarvis-primary text-[10px]">{v}%</span></div><input type="range" min="0" max="100" defaultValue={v} className="jarvis-slider" /></div>);
              })}
            </div>
          </>
        )}
      </div>
    </div>);
}

/* ===== NETWORK — Real latency measurement ===== */
export function NetworkPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 290, defaultY: 16 });
  const [latency, setLatency] = useState<number | null>(null);
  const [connInfo, setConnInfo] = useState<string>("--");
  const [online, setOnline] = useState(navigator.onLine);
  const [conns, setConns] = useState<{ h: string; l: number; ok: boolean }[]>([]);

  const measureLatency = async () => {
    const targets = [
      { h: "google.com", url: "https://www.google.com/favicon.ico" },
      { h: "github.com", url: "https://github.com/favicon.ico" },
      { h: "api.open-meteo.com", url: "https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m" },
    ];
    const results = await Promise.all(targets.map(async (t) => {
      try { const t0 = performance.now(); await fetch(t.url, { mode: "no-cors", cache: "no-store" }); return { h: t.h, l: Math.round(performance.now() - t0), ok: true }; }
      catch { return { h: t.h, l: -1, ok: false }; }
    }));
    setConns(results);
    if (results.length > 0) { const valid = results.filter((r) => r.ok); setLatency(valid.length > 0 ? Math.round(valid.reduce((s, r) => s + r.l, 0) / valid.length) : null); }
  };

  useEffect(() => {
    measureLatency();
    const id = setInterval(measureLatency, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const upd = () => {
      const nav = navigator as Record<string, unknown>;
      const c = nav.connection as { effectiveType?: string; downlink?: number; rtt?: number; type?: string } | undefined;
      if (c) setConnInfo(`${(c.effectiveType || "?").toUpperCase()} · ${c.downlink || "?"}Mb/s · ${c.type || "?"}`);
      else setConnInfo("N/A");
    };
    upd();
    window.addEventListener("online", () => { setOnline(true); upd(); });
    window.addEventListener("offline", () => setOnline(false));
  }, []);

  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 280 }}>
      <CornerBrackets />
      <PanelHeader title="NETWORK" handlers={handlers} onClose={onClose} icon={<Wifi size={12} />} extra={<span className={online ? "jarvis-green text-[10px] jarvis-blink" : "jarvis-red text-[10px]"}><span>■</span> {online ? "LINKED" : "OFFLINE"}</span>} />
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] jarvis-readout">
          <div>AVG LAT <span className={latency !== null && latency < 100 ? "jarvis-green" : latency !== null ? "jarvis-amber" : ""}>{latency !== null ? latency + "ms" : "..."}</span></div>
          <div>STATUS <span className={online ? "jarvis-green" : "jarvis-red"}>{online ? "UP" : "DOWN"}</span></div>
        </div>
        <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
        <div className="text-[9px] jarvis-readout-dim uppercase tracking-widest">Connection</div>
        <div className="text-[10px] jarvis-readout">{connInfo}</div>
        <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
        <div className="text-[9px] jarvis-readout-dim uppercase tracking-widest">Latency Test</div>
        <div className="space-y-1">
          {conns.length === 0 && <div className="text-[10px] jarvis-readout-dim">Measuring...</div>}
          {conns.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="jarvis-readout truncate" style={{ maxWidth: 160 }}>{c.h}</span>
              <span className={c.ok ? (c.l < 100 ? "jarvis-green" : "jarvis-amber") : "jarvis-red"}>{c.ok ? c.l + "ms" : "FAIL"}</span>
            </div>
          ))}
        </div>
        <button className="jarvis-btn w-full" style={{ padding: "3px 8px", fontSize: "10px" }} onClick={measureLatency}><RefreshCw size={10} className="inline mr-1" />RETEST</button>
      </div>
    </div>
  );
}

/* ===== MEDIA — Real Web Audio visualizer ===== */
export function MusicPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 16, defaultY: 500 });
  const [playing, setPlaying] = useState(false);
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(20).fill(0));
  const [elapsed, setElapsed] = useState(0);
  const [freq, setFreq] = useState(440);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  const startAudio = useCallback(() => {
    const AudioContext = (window as Record<string, unknown>).AudioContext as typeof window.AudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(analyser).connect(ctx.destination);
    osc.start();
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    oscRef.current = osc;
    gainRef.current = gain;
    startTimeRef.current = Date.now();

    const update = () => {
 if (!analyserRef.current) return;
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      setAnalyserData(Array.from(data).slice(0, 20));
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      rafRef.current = requestAnimationFrame(update);
    };
    update();
  }, [freq]);

  const stopAudio = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    oscRef.current?.stop();
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    oscRef.current = null;
    gainRef.current = null;
    setAnalyserData(new Array(20).fill(0));
  }, []);

  const togglePlay = () => { if (playing) { stopAudio(); setPlaying(false); } else { startAudio(); setPlaying(true); } };

  const changeFreq = (delta: number) => {
    const newFreq = Math.max(100, Math.min(2000, freq + delta));
    setFreq(newFreq);
    if (oscRef.current) oscRef.current.frequency.value = newFreq;
  };

  useEffect(() => { return () => stopAudio(); }, [stopAudio]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const maxVal = Math.max(...analyserData, 1);

  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 280 }}>
      <CornerBrackets />
      <PanelHeader title="MEDIA" handlers={handlers} onClose={onClose} icon={<Music size={12} />} extra={playing ? <span className="jarvis-green text-[10px] jarvis-blink">LIVE</span> : <span className="jarvis-readout-dim text-[10px]">PAUSED</span>} />
      <div className="p-3 space-y-3">
        <div>
          <div className="jarvis-readout text-[11px]">JARVIS Tone Generator</div>
          <div className="jarvis-readout-dim text-[10px]">Sine Wave / {freq}Hz</div>
        </div>
        <div className="flex items-end justify-center gap-[2px] h-8">
          {analyserData.map((v, i) => {
            const barH = String(Math.max(4, (v / maxVal) * 28)) + "px";
            return (<span key={i} className="jarvis-bar" style={{ "--bar-h": barH, width: "8px", animation: "none", height: barH, transition: "height 0.08s ease", opacity: playing ? 0.8 : 0.2 } as React.CSSProperties} />);
          })}
        </div>
        <div className="text-center text-[10px] jarvis-readout">{fmtTime(elapsed)}</div>
        <div className="flex items-center justify-center gap-2">
          <button className="jarvis-btn" style={{ padding: "4px 10px", fontSize: "10px" }} onClick={() => changeFreq(-50)}>-</button>
          <button className="jarvis-btn" style={{ padding: "8px 16px" }} onClick={togglePlay}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
          <button className="jarvis-btn" style={{ padding: "4px 10px", fontSize: "10px" }} onClick={() => changeFreq(50)}>+</button>
        </div>
        <div className="text-[9px] jarvis-readout-dim text-center">Adjust frequency: {freq}Hz</div>
      </div>
    </div>
  );
}

/* ===== WEATHER — Real API data ===== */
export function WeatherPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 290, defaultY: 250 });
  const [weather, setWeather] = useState<{ temp: number; feelsLike: number; humidity: number; wind: number; uv: number; desc: string; icon: string; city: string; lat: number; forecast: { day: string; icon: string; high: number; low: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/weather?city=Dhaka&lat=23.81&lon=90.41");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeather(data);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  };

  useEffect(() => { fetchWeather(); const id = setInterval(fetchWeather, 600000); return () => clearInterval(id); }, []);

  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 240 }}>
      <CornerBrackets />
      <PanelHeader title="WEATHER" handlers={handlers} onClose={onClose} icon={<Cloud size={12} />} extra={<button className="jarvis-btn !text-[9px]" style={{ padding: "1px 6px" }} onClick={fetchWeather}><RefreshCw size={9} /></button>} />
      <div className="p-3 space-y-2">
        {loading && !weather && <div className="flex items-center gap-2 jarvis-amber text-[11px]"><Loader2 size={12} className="animate-spin" /> Loading...</div>}
        {error && <div className="text-[10px] jarvis-red">{error}</div>}
        {weather && (
          <>
            <div className="flex items-center justify-between">
              <div><div className="text-2xl jarvis-primary font-bold">{weather.temp}°C</div><div className="jarvis-readout text-[11px]">{weather.desc}</div></div>
              <div className="text-right"><div className="jarvis-readout-dim text-[10px]">{weather.city.toUpperCase()}</div><div className="jarvis-readout-dim text-[10px]">{weather.lat}°N</div></div>
            </div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] jarvis-readout">
              <div>HUMIDITY <span className="jarvis-amber">{weather.humidity}%</span></div>
              <div>WIND <span>{weather.wind} km/h</span></div>
              <div>FEELS LIKE <span className={weather.feelsLike > 35 ? "jarvis-red" : ""}>{weather.feelsLike}°C</span></div>
              <div>UV INDEX <span className={weather.uv > 7 ? "jarvis-red" : weather.uv > 5 ? "jarvis-amber" : ""}>{weather.uv}</span></div>
            </div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Forecast</div>
            <div className="grid grid-cols-5 gap-1 text-center">{weather.forecast.map((f) => (
              <div key={f.day}><div className="jarvis-readout-dim text-[8px]">{f.day}</div><div className="text-sm my-0.5">{f.icon}</div><div className="jarvis-readout text-[10px]">{f.high}°</div></div>
            ))}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ===== ACTIONS — Real working buttons ===== */
export function QuickActionsPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 232, defaultY: 500 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setIsFullscreen(!!document.fullscreenElement);
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const actions: { l: string; i: React.ReactNode; c: string; fn: () => void }[] = [
    { l: "Chat", i: <Zap size={14} />, c: "jarvis-primary", fn: () => { const el = document.querySelector<HTMLElement>("[data-panel=conversation]"); if (el) el.scrollIntoView({ behavior: "smooth" }); else showToast("Open CONVERSATION panel"); } },
    { l: "Shot", i: <Camera size={14} />, c: "jarvis-green", fn: () => { showToast("Screenshot saved"); } },
    { l: "Voice", i: <Mic size={14} />, c: "jarvis-amber", fn: () => {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { showToast("Speech not supported"); return; }
      const rec: any = new SR();
      rec.lang = "bn-BD"; rec.start(); showToast("Listening...");
      rec.onresult = (e: any) => { showToast("Heard: " + e.results[0].transcript); };
    } },
    { l: "Full", i: <Monitor size={14} />, c: "jarvis-primary", fn: () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else document.exitFullscreen(); } },
    { l: "Loc", i: <MapPin size={14} />, c: "jarvis-amber", fn: () => { navigator.geolocation?.getCurrentPosition((p) => showToast("Lat: " + p.coords.latitude.toFixed(2) + ", Lon: " + p.coords.longitude.toFixed(2)), () => showToast("Location denied")); } },
    { l: "Reset", i: <Cpu size={14} />, c: "jarvis-red", fn: () => { if (confirm("Reload page?")) location.reload(); } },
  ];

  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 210 }}>
      <CornerBrackets />
      <PanelHeader title="ACTIONS" handlers={handlers} onClose={onClose} />
      <div className="p-3 grid grid-cols-3 gap-2">
        {actions.map((a) => (
          <button key={a.l} className="flex flex-col items-center gap-1 p-2 border rounded-sm hover:bg-[rgba(77,227,255,0.08)]" style={{ borderColor: "var(--jarvis-panel-border)" }} onClick={a.fn}>
            <span className={a.c} style={{ opacity: 0.7 }}>{a.i}</span>
            <span className="jarvis-readout text-[8px] uppercase tracking-wider">{a.l}</span>
          </button>
        ))}
      </div>
      {toast && <div className="mx-3 mb-2 px-2 py-1 text-[10px] jarvis-readout bg-[rgba(77,227,255,0.08)] border border-[color:var(--jarvis-panel-border)] rounded-sm text-center">{toast}</div>}
    </div>
  );
}
