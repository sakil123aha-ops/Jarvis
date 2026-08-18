"use client";

import { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { ArcReactorCSS } from "@/components/jarvis/ArcReactorCSS";
import { TelemetryPanel, StatusPanel, TranscriptLog, DevPanel, PipelinePanel, SettingsPanel, NetworkPanel, MusicPanel, WeatherPanel, QuickActionsPanel } from "@/components/jarvis/panels";

type PanelId = "telemetry" | "status" | "transcript" | "dev" | "pipeline" | "settings" | "network" | "music" | "weather" | "actions";

const META: Record<PanelId, { label: string; short: string }> = {
  telemetry: { label: "SYSTEM panel", short: "SYS" }, status: { label: "I/O panel", short: "I/O" }, transcript: { label: "CONVERSATION", short: "CHAT" }, dev: { label: "DEV panel", short: "DEV" }, pipeline: { label: "PIPELINE", short: "PIPE" }, settings: { label: "SETTINGS", short: "SET" }, network: { label: "NETWORK", short: "NET" }, music: { label: "MEDIA", short: "MUS" }, weather: { label: "WEATHER", short: "WTH" }, actions: { label: "ACTIONS", short: "ACT" },
};

export default function Home() {
  const [closed, setClosed] = useState<Set<PanelId>>(new Set());
  const close = (id: PanelId) => setClosed((s) => new Set(s).add(id));
  const restore = (id: PanelId) => setClosed((s) => { const n = new Set(s); n.delete(id); return n; });
  const [showDev, setShowDev] = useState(false);

  const particles = useMemo(() => Array.from({ length: 25 }, (_, i) => ({ id: i, left: `${Math.random()*100}%`, size: 1+Math.random()*2, duration: 8+Math.random()*15, delay: Math.random()*10 })), []);

  return (
    <main className="jarvis-root">
      <div className="jarvis-ambient-bg" />
      <div className="jarvis-hex-bg" />
      <div className="jarvis-grid-bg" />
      <div className="jarvis-scanline absolute inset-0 z-10" aria-hidden="true" />
      <div className="jarvis-vignette" />
      <div className="jarvis-particles-bg">{particles.map((p) => (<span key={p.id} className="jarvis-particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />))}</div>
      <ArcReactorCSS />

      {!closed.has("telemetry") && <TelemetryPanel onClose={() => close("telemetry")} />}
      {!closed.has("status") && <StatusPanel onClose={() => close("status")} />}
      {!closed.has("transcript") && <TranscriptLog onClose={() => close("transcript")} />}
      {!closed.has("pipeline") && <PipelinePanel onClose={() => close("pipeline")} />}
      {!closed.has("settings") && <SettingsPanel onClose={() => close("settings")} />}
      {!closed.has("network") && <NetworkPanel onClose={() => close("network")} />}
      {!closed.has("music") && <MusicPanel onClose={() => close("music")} />}
      {!closed.has("weather") && <WeatherPanel onClose={() => close("weather")} />}
      {!closed.has("actions") && <QuickActionsPanel onClose={() => close("actions")} />}
      {showDev && !closed.has("dev") && <DevPanel onClose={() => { close("dev"); setShowDev(false); }} />}

      <div className="absolute bottom-4 left-4 z-30 flex gap-2 items-center flex-wrap">
        <button className="jarvis-btn" onClick={() => setShowDev((s) => !s)}>{showDev ? "■ HIDE DEV" : "DEV"}</button>
        {closed.size > 0 && (
          <div className="flex gap-1 ml-2 pl-2 border-l border-[color:var(--jarvis-panel-border)] flex-wrap">
            {Array.from(closed).map((id) => (<button key={id} className="jarvis-btn !text-[10px]" onClick={() => restore(id)} title={META[id].label}><RotateCcw size={10} className="inline mr-1" />{META[id].short}</button>))}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[10px] tracking-[0.3em] jarvis-readout-dim jarvis-flicker">
        JARVIS · DRAGGABLE HUD · PANELS {10 - closed.size}/10 ACTIVE
      </div>
    </main>
  );
}
