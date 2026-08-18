"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

interface DragState { isDragging: boolean; x: number; y: number; }

export function useDraggable(opts: { defaultX?: number; defaultY?: number; defaultFromRight?: number } = {}) {
  const { defaultX = 0, defaultY = 0, defaultFromRight } = opts;
  const [pos, setPos] = useState<DragState>({ isDragging: false, x: defaultX, y: defaultY });
  const offsetRef = useRef({ dx: 0, dy: 0 });
  const fromRightRef = useRef(defaultFromRight);

  useEffect(() => {
    if (fromRightRef.current !== undefined) {
      setPos((p) => ({ ...p, x: window.innerWidth - fromRightRef.current! }));
    }
  }, []);

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).parentElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    offsetRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    setPos((p) => ({ ...p, isDragging: true }));
    const onMouseMove = (ev: globalThis.MouseEvent) => {
      setPos({ isDragging: true, x: ev.clientX - offsetRef.current.dx, y: ev.clientY - offsetRef.current.dy });
    };
    const onMouseUp = () => { setPos((p) => ({ ...p, isDragging: false })); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const el = (e.currentTarget as HTMLElement).parentElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    offsetRef.current = { dx: touch.clientX - rect.left, dy: touch.clientY - rect.top };
    setPos((p) => ({ ...p, isDragging: true }));
    const onTouchMove = (ev: TouchEvent) => { const t = ev.touches[0]; setPos({ isDragging: true, x: t.clientX - offsetRef.current.dx, y: t.clientY - offsetRef.current.dy }); };
    const onTouchEnd = () => { setPos((p) => ({ ...p, isDragging: false })); window.removeEventListener("touchmove", onTouchMove); window.removeEventListener("touchend", onTouchEnd); };
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
  }, []);

  const containerStyle: React.CSSProperties = { position: "absolute" as const, left: pos.x, top: pos.y, zIndex: pos.isDragging ? 40 : undefined, cursor: pos.isDragging ? "grabbing" : undefined, userSelect: pos.isDragging ? "none" : undefined };

  return { containerStyle, handlers: { onMouseDown, onTouchStart }, isDragging: pos.isDragging };
}
