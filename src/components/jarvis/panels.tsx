"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Loader2, Check, Circle, Settings, Wifi, Music, Cloud, Zap, Volume2, Play, Pause, SkipForward, SkipBack, Moon, Eye, Shield, Cpu, Key, EyeOff, Eye as EyeIcon, Save, Trash2 } from "lucide-react";
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

/* SYSTEM */
export function TelemetryPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 16, defaultY: 16 });
  const [tick, setTick] = useState(0); const [clock, setClock] = useState(""); const [fps, setFps] = useState(60);
  useEffect(() => { const id = setInterval(() => setTick((t) => (t + 1) % 100), 1500); return () => clearInterval(id); }, []);
  useEffect(() => { const id = setInterval(() => setClock(new Date().toISOString().slice(11, 19) + "Z"), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { let frames = 0, last = performance.now(); const m = () => { frames++; const n = performance.now(); if (n - last >= 1000) { setFps(frames); frames = 0; last = n; } requestAnimationFrame(m); }; requestAnimationFrame(m); }, []);
  const cpu = 8 + ((tick * 7) % 18), mem = 412 + ((tick * 13) % 80), net = 12 + ((tick * 5) % 30);
  return (<div className="jarvis-panel p-3 w-56 z-20" style={containerStyle}><CornerBrackets /><PanelHeader title="SYSTEM" handlers={handlers} onClose={onClose} icon={<Cpu size={12} />} extra={<span className="jarvis-blink jarvis-green">● ONLINE</span>} /><div className="mt-2 space-y-1 jarvis-readout"><Row label="STATE" value="IDLE" /><Row label="CLOCK" value={clock} /><Row label="FPS" value={String(fps)} accent={fps < 30 ? "amber" : undefined} /><Row label="CPU" value={`${cpu}%`} /><Row label="MEM" value={`${mem}MB`} /><Row label="NET" value={`${net}kb/s`} /></div></div>);
}

/* I/O */
export function StatusPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultFromRight: 272, defaultY: 16 });
  return (<div className="jarvis-panel p-3 w-64 z-20" style={containerStyle}><CornerBrackets /><PanelHeader title="I/O" handlers={handlers} onClose={onClose} icon={<Wifi size={12} />} extra={<span className="jarvis-blink">●</span>} /><div className="mt-2 space-y-1 jarvis-readout"><Row label="CAMERA" value="OFFLINE" accent="amber" /><Row label="MIC" value="IDLE" /><Row label="VOICE" value="BROWSER TTS" /><Row label="MOOD" value="NEUTRAL" /><Row label="GESTURE" value="NONE" /></div></div>);
}

/* CONVERSATION */
const SAMPLE_TRANSCRIPT = [
  { id: "1", role: "user" as const, ts: Date.now() - 120000, content: "Hello JARVIS, what can you do?" },
  { id: "2", role: "assistant" as const, ts: Date.now() - 115000, content: "Good evening, sir. I am your AI assistant. I can process natural language queries, perform web searches, execute code, and manage autonomous pipelines." },
  { id: "3", role: "system" as const, ts: Date.now() - 100000, content: "Voice recognition module loaded. Speech synthesis online." },
  { id: "4", role: "user" as const, ts: Date.now() - 80000, content: "Show me the draggable panel demo." },
  { id: "5", role: "assistant" as const, ts: Date.now() - 75000, content: "All HUD panels are now fully draggable. Grab any panel by its title bar and move it." },
];

export function TranscriptLog({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultFromRight: 336, defaultY: 128 });
  return (<div className="jarvis-panel p-0 flex flex-col z-20" style={{ ...containerStyle, width: 320, height: "calc(100vh - 224px)" }}><PanelHeader title="CONVERSATION" handlers={handlers} onClose={onClose} extra={<span className="jarvis-readout-dim text-[10px]">{SAMPLE_TRANSCRIPT.length} msgs</span>} /><div className="flex-1 overflow-y-auto jarvis-scroll px-3 py-2 space-y-2 text-xs">{SAMPLE_TRANSCRIPT.map((t) => (<div key={t.id} className="leading-relaxed"><div className="flex items-center gap-2 text-[10px] mb-0.5"><span className={t.role === "user" ? "jarvis-amber" : t.role === "assistant" ? "jarvis-green" : "jarvis-readout-dim"}>{t.role === "user" ? "USR" : t.role === "assistant" ? "ASR" : "SYS"}</span><span className="jarvis-readout-dim">{new Date(t.ts).toISOString().slice(11, 19)}</span></div><div className="jarvis-readout whitespace-pre-wrap">{t.content}</div></div>))}</div></div>);
}

/* DEV */
const DEV_LOG = [
  { id: "1", ts: Date.now() - 50000, kind: "system", msg: "Orchestrator initialized", ms: 12 },
  { id: "2", ts: Date.now() - 45000, kind: "info", msg: "LLM call: claude-sonnet-4-6", ms: 1840 },
  { id: "3", ts: Date.now() - 40000, kind: "info", msg: "Tool call: web-search", ms: 320 },
  { id: "4", ts: Date.now() - 35000, kind: "warn", msg: "Rate limit approaching (85%)", ms: 0 },
  { id: "5", ts: Date.now() - 20000, kind: "system", msg: "Pipeline stage 2/6 complete", ms: 0 },
];

export function DevPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 16, defaultY: 128 });
  return (
    <div className="jarvis-panel p-0 flex flex-col z-30" style={{ ...containerStyle, width: 384, height: "calc(100vh - 224px)" }}>
      <CornerBrackets />
      <PanelHeader title="DEVELOPER MODE" handlers={handlers} onClose={onClose} extra={<span className="text-[10px] jarvis-red">DEBUG</span>} />
      <div className="px-3 py-2 border-b border-[color:var(--jarvis-panel-border)] grid grid-cols-2 gap-1 text-[10px] jarvis-readout">
        <div>FPS <span className="jarvis-green">60</span></div>
        <div>MOOD <span className="jarvis-amber">NEUTRAL</span></div>
        <div>GESTURE <span className="jarvis-amber">NONE</span></div>
        <div>BUFFER {DEV_LOG.length}/400</div>
      </div>
      <div className="flex-1 overflow-y-auto jarvis-scroll px-3 py-2 space-y-1 text-[11px] font-mono">
        {DEV_LOG.map((e) => (
          <div key={e.id} className="leading-tight">
            <span className="jarvis-readout-dim">[{new Date(e.ts).toISOString().slice(11, 23)}]</span>{" "}
            <span className={e.kind === "error" ? "jarvis-red" : e.kind === "warn" ? "jarvis-amber" : "jarvis-green"}>{e.kind.padEnd(7)}</span>{" "}
            <span className="jarvis-readout">{e.msg}</span>
            {e.ms ? <span className="jarvis-readout-dim"> · {e.ms}ms</span> : null}
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-[color:var(--jarvis-panel-border)] flex gap-2">
        <button className="jarvis-btn">MEMORY</button><button className="jarvis-btn">CLEAR</button>
      </div>
    </div>);
}

/* PIPELINE */
const PIPELINE = [
  { name: "PLAN", status: "passed" }, { name: "RESE", status: "passed" }, { name: "DESI", status: "passed" },
  { name: "CODE", status: "running" }, { name: "REVI", status: "pending" }, { name: "DEPL", status: "pending" },
];

export function PipelinePanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 0, defaultY: 128 });
  const cs: React.CSSProperties = { ...containerStyle, left: containerStyle.left || "calc(50% - 280px)" };
  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...cs, width: 560, maxWidth: "90vw" }}>
      <CornerBrackets />
      <PanelHeader title="AUTONOMOUS PIPELINE" handlers={handlers} onClose={onClose} icon={<Zap size={12} />} extra={
        <div className="flex items-center gap-2"><span className="jarvis-amber text-[10px] jarvis-blink">● ACTIVE</span><button className="jarvis-btn danger" style={{padding:"2px 8px",fontSize:"10px"}}>ABORT</button></div>
      } />
      <div className="px-3 py-2">
        <div className="text-[11px] jarvis-readout-dim mb-2 truncate">GOAL: <span className="jarvis-readout">Build draggable HUD panel system</span></div>
        <div className="grid grid-cols-6 gap-1">{PIPELINE.map((s, i) => (
          <div key={i} className="border border-[color:var(--jarvis-panel-border)] p-1 rounded-sm">
            <div className="text-[9px] jarvis-readout-dim uppercase tracking-wider truncate">{s.name}</div>
            <div className="flex items-center justify-center mt-1 h-4">
              {s.status === "pending" && <Circle size={10} className="jarvis-readout-dim" />}
              {s.status === "running" && <Loader2 size={10} className="animate-spin jarvis-amber" />}
              {s.status === "passed" && <Check size={12} className="jarvis-green" />}
            </div>
          </div>
        ))}</div>
        <div className="mt-2 text-[10px] jarvis-readout-dim"><span className="jarvis-amber">CODEGEN: </span><span className="jarvis-readout">Generating useDraggable hook…</span></div>
      </div>
    </div>);
}

/* API KEY PROVIDERS */
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
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const hasKey = !!savedKeys[provider.id];

  const saveKey = async () => {
    if (!inputVal.trim() && !hasKey) return;
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id, key: inputVal.trim() }),
      });
      if (res.ok) { setStatus("saved"); setInputVal(""); onSaved(); setTimeout(() => setStatus("idle"), 2000); }
      else { setStatus("error"); }
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
            <button onClick={deleteKey} className="opacity-40 hover:opacity-100 transition-opacity" title="Delete key">
              <Trash2 size={10} className="jarvis-red" />
            </button>
          </div>
        )}
      </div>
      {hasKey && (
        <div className="flex items-center gap-1">
          <span className="jarvis-readout-dim text-[10px] font-mono flex-1 truncate">{savedKeys[provider.id]}</span>
          <button onClick={() => setShowKey(!showKey)} className="opacity-40 hover:opacity-100 transition-opacity">
            {showKey ? <EyeOff size={10} className="jarvis-readout-dim" /> : <EyeIcon size={10} className="jarvis-readout-dim" />}
          </button>
        </div>
      )}
      <div className="flex gap-1">
        <input
          type="password"
          placeholder={hasKey ? "Update key..." : `Enter ${provider.label} key...`}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveKey()}
          className="jarvis-key-input flex-1"
        />
        <button
          onClick={saveKey}
          disabled={saving || (!inputVal.trim() && !hasKey)}
          className="jarvis-btn flex items-center gap-1"
          style={{ padding: "4px 10px", fontSize: "10px" }}
        >
          {saving ? <Loader2 size={10} className="animate-spin" /> : status === "saved" ? <Check size={10} className="jarvis-green" /> : <Save size={10} />}
          {status === "saved" ? "OK" : "SAVE"}
        </button>
      </div>
    </div>
  );
}

/* SETTINGS */
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
  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      if (res.ok) { const data = await res.json(); setSavedKeys(data.keys || {}); }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { loadKeys(); }, [loadKeys]);
  const ifaceRows: ToggleRow[] = [{ key: "dark", label: "DARK MODE", icon: <Moon size={10} /> }, { key: "scan", label: "SCANLINES", icon: <Eye size={10} /> }, { key: "anim", label: "ANIMATIONS", icon: <Zap size={10} /> }];
  const audioRows: ToggleRow[] = [{ key: "voice", label: "VOICE", icon: <Volume2 size={10} /> }, { key: "fx", label: "SOUND FX", icon: <Volume2 size={10} /> }, { key: "save", label: "AUTO SAVE", icon: <Shield size={10} /> }];
  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 300 }}>
      <CornerBrackets />
      <PanelHeader title="SETTINGS" handlers={handlers} onClose={onClose} icon={<Settings size={12} />} extra={
        <button className={"jarvis-btn !text-[9px]" + (showKeys ? " !border-[color:var(--jarvis-primary)]" : "")} onClick={() => setShowKeys(!showKeys)} style={{ padding: "2px 8px" }}>
          <Key size={9} className="inline mr-1" />KEYS
        </button>
      } />
      <div className="p-3 space-y-3" style={{ maxHeight: "calc(100vh - 360px)", overflowY: "auto" }}>
        {showKeys ? (
          <>
            <div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">API Keys</div>
            <div className="space-y-3">
              {API_PROVIDERS.map((p) => (
                <ApiKeyRow key={p.id} provider={p} savedKeys={savedKeys} onSaved={loadKeys} />
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="text-[9px] jarvis-readout-dim">Keys stored locally in <span className="jarvis-readout">data/api-keys.json</span></div>
          </>
        ) : (
          <>
            <div className="space-y-2"><div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Interface</div>
              {ifaceRows.map((r) => <ToggleItem key={r.key} item={r} active={!!on[r.key as keyof typeof on]} onToggle={toggle} />)}
            </div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="space-y-2"><div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Audio</div>
              {audioRows.map((r) => <ToggleItem key={r.key} item={r} active={!!on[r.key as keyof typeof on]} onToggle={toggle} />)}
            </div>
            <div style={{ borderTop: "1px solid var(--jarvis-panel-border)" }} />
            <div className="space-y-3"><div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Visual</div>
              {[(["VOLUME",70] as const),(["BRIGHTNESS",85] as const),(["PARTICLES",60] as const)].map(([l,v]) => (
                <div key={l}><div className="flex items-center justify-between mb-1"><span className="jarvis-readout text-[11px]">{l}</span><span className="jarvis-primary text-[10px]">{v}%</span></div><input type="range" min="0" max="100" defaultValue={v} className="jarvis-slider" /></div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>);
}

/* NETWORK */
export function NetworkPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 290, defaultY: 16 });
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => (t + 1) % 100), 2000); return () => clearInterval(id); }, []);
  const lat = 12 + ((tick * 7) % 35), dl = 85 + ((tick * 11) % 40), ul = 22 + ((tick * 5) % 15);
  const conns = [{h:"api.openai.com",s:true,l:lat},{h:"cdn.jsdelivr.net",s:true,l:lat+5},{h:"wss://stream.z.ai",s:true,l:lat+12},{h:"db.vector.mem",s:true,l:2},{h:"models.local",s:false,l:0}];
  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 280 }}>
      <CornerBrackets />
      <PanelHeader title="NETWORK" handlers={handlers} onClose={onClose} icon={<Wifi size={12} />} extra={<span className="jarvis-green text-[10px] jarvis-blink">● LINKED</span>} />
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] jarvis-readout">
          <div>LATENCY <span className={lat<30?"jarvis-green":"jarvis-amber"}>{lat}ms</span></div>
          <div>DOWN <span className="jarvis-green">{dl}Mb/s</span></div>
          <div>UPLOAD <span className="jarvis-primary">{ul}Mb/s</span></div>
          <div>PACKETS <span>{1247+((tick*31)%500)}</span></div>
        </div>
        <div style={{borderTop:"1px solid var(--jarvis-panel-border)"}} />
        <div className="text-[9px] jarvis-readout-dim uppercase tracking-widest">Connections</div>
        <div className="space-y-1">{conns.map((c,i) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <span className="jarvis-readout truncate" style={{maxWidth:160}}>{c.h}</span>
            <span className={c.s?"jarvis-green":"jarvis-amber"}>{c.s?`${c.l}ms`:"STBY"}</span>
          </div>
        ))}</div>
        <div style={{borderTop:"1px solid var(--jarvis-panel-border)"}} />
        <div className="text-[10px]"><span className="jarvis-readout-dim">PROTOCOL </span><span className="jarvis-readout">WSS/TLS 1.3</span></div>
      </div>
    </div>);
}

/* MEDIA */
export function MusicPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 16, defaultY: 500 });
  const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(35);
  useEffect(() => { if (!playing) return; const id = setInterval(() => setProgress((p) => p >= 100 ? 0 : p + 0.3), 300); return () => clearInterval(id); }, [playing]);
  const bars = [12,20,8,24,16,10,18,14,22,6,16,20];
  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 260 }}>
      <CornerBrackets />
      <PanelHeader title="MEDIA" handlers={handlers} onClose={onClose} icon={<Music size={12} />} extra={playing ? <span className="jarvis-green text-[10px] jarvis-blink">● PLAYING</span> : <span className="jarvis-readout-dim text-[10px]">PAUSED</span>} />
      <div className="p-3 space-y-3">
        <div><div className="jarvis-readout text-[11px]">AC/DC — Back In Black</div><div className="jarvis-readout-dim text-[10px]">Highway to Hell</div></div>
        <div className="flex items-end justify-center gap-1 h-6">
          {bars.map((h, i) => <span key={i} className="jarvis-bar" style={{"--bar-h":`${h}px`,animationDuration:`${0.4+i*0.05}s`,opacity:playing?0.8:0.2} as React.CSSProperties} />)}
        </div>
        <div><div className="jarvis-progress"><div className="jarvis-progress-fill" style={{ width: `${progress}%` }} /></div><div className="flex justify-between text-[9px] jarvis-readout-dim mt-1"><span>1:24</span><span>4:15</span></div></div>
        <div className="flex items-center justify-center gap-3">
          <button className="jarvis-btn" style={{padding:"6px 8px"}}><SkipBack size={12} /></button>
          <button className="jarvis-btn" style={{padding:"8px 12px"}} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
          <button className="jarvis-btn" style={{padding:"6px 8px"}}><SkipForward size={12} /></button>
        </div>
      </div>
    </div>);
}

/* WEATHER */
export function WeatherPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 290, defaultY: 250 });
  const forecast = [{d:"MON",e:"☀",t:"34"},{d:"TUE",e:"⛅",t:"31"},{d:"WED",e:"🌧",t:"28"},{d:"THU",e:"⛈",t:"27"},{d:"FRI",e:"☀",t:"33"}];
  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 220 }}>
      <CornerBrackets />
      <PanelHeader title="WEATHER" handlers={handlers} onClose={onClose} icon={<Cloud size={12} />} />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div><div className="text-2xl jarvis-primary font-bold">32°C</div><div className="jarvis-readout text-[11px]">Partly Cloudy</div></div>
          <div className="text-right"><div className="jarvis-readout-dim text-[10px]">DHAKA</div><div className="jarvis-readout-dim text-[10px]">23.81°N</div></div>
        </div>
        <div style={{borderTop:"1px solid var(--jarvis-panel-border)"}} />
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] jarvis-readout">
          <div>HUMIDITY <span className="jarvis-amber">78%</span></div><div>WIND <span>12 km/h</span></div>
          <div>FEELS LIKE <span className="jarvis-red">38°C</span></div><div>UV INDEX <span className="jarvis-red">8</span></div>
        </div>
        <div style={{borderTop:"1px solid var(--jarvis-panel-border)"}} />
        <div className="text-[9px] jarvis-readout-dim uppercase tracking-widest mb-1">Forecast</div>
        <div className="grid grid-cols-5 gap-1 text-center">{forecast.map((f) => (
          <div key={f.d}><div className="jarvis-readout-dim text-[8px]">{f.d}</div><div className="text-sm my-0.5">{f.e}</div><div className="jarvis-readout text-[10px]">{f.t}°</div></div>
        ))}</div>
      </div>
    </div>);
}

/* ACTIONS */
export function QuickActionsPanel({ onClose }: { onClose: () => void }) {
  const { containerStyle, handlers } = useDraggable({ defaultX: 232, defaultY: 500 });
  const actions: {l:string;i:React.ReactNode;c:string}[] = [
    {l:"New Chat",i:<Zap size={14}/>,c:"jarvis-primary"},{l:"Screenshot",i:<Eye size={14}/>,c:"jarvis-green"},
    {l:"Voice",i:<Volume2 size={14}/>,c:"jarvis-amber"},{l:"Fullscreen",i:<Shield size={14}/>,c:"jarvis-primary"},
    {l:"Lock",i:<Settings size={14}/>,c:"jarvis-amber"},{l:"Reset",i:<Cpu size={14}/>,c:"jarvis-red"},
  ];
  return (
    <div className="jarvis-panel p-0 z-20" style={{ ...containerStyle, width: 200 }}>
      <CornerBrackets />
      <PanelHeader title="ACTIONS" handlers={handlers} onClose={onClose} />
      <div className="p-3 grid grid-cols-3 gap-2">{actions.map((a) => (
        <button key={a.l} className="flex flex-col items-center gap-1 p-2 border rounded-sm hover:bg-[rgba(77,227,255,0.08)]" style={{borderColor:"var(--jarvis-panel-border)"}}>
          <span className={a.c} style={{opacity:0.7}}>{a.i}</span>
          <span className="jarvis-readout text-[8px] uppercase tracking-wider">{a.l}</span>
        </button>
      ))}</div>
    </div>);
}
