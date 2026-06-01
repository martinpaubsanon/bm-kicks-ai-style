import { useEffect, useRef, useState } from "react";
import frame0 from "@/assets/hero-sneakers.jpg";
import frame1 from "@/assets/hero-turntable-1.jpg";
import frame2 from "@/assets/hero-turntable-2.jpg";
import frame3 from "@/assets/hero-turntable-3.jpg";
import frame4 from "@/assets/hero-turntable-4.jpg";
import frame5 from "@/assets/hero-turntable-5.jpg";

const FRAMES = [frame0, frame1, frame2, frame3, frame4, frame5];
const FRAME_MS = 220; // ~4.5 fps → smooth turntable feel, full 360 in ~1.3s

/**
 * True 360° turntable of the hero sneaker.
 * Cycles through pre-rendered angles; drag horizontally to scrub manually.
 */
export const HeroSneaker360 = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef<{ x: number; startIndex: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % FRAMES.length);
    }, FRAME_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, startIndex: index };
    setPaused(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const width = containerRef.current?.clientWidth ?? 300;
    const dx = e.clientX - dragRef.current.x;
    // full carousel rotation across one container width of drag
    const delta = Math.round((dx / width) * FRAMES.length);
    const next = ((dragRef.current.startIndex + delta) % FRAMES.length + FRAMES.length) % FRAMES.length;
    setIndex(next);
  };
  const onPointerUp = () => {
    dragRef.current = null;
    setPaused(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto aspect-square select-none cursor-grab active:cursor-grabbing group"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero sneaker 360 view — drag to rotate"
      role="region"
    >
      {/* Ambient glow */}
      <div className="absolute -inset-2 rounded-3xl bg-primary/20 blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />

      {/* Preload all frames; toggle opacity for instant swap */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-card">
        {FRAMES.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? "Premium sneakers from BM Kicks" : ""}
            aria-hidden={i !== 0}
            width={1024}
            height={1024}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "eager"}
            decoding="async"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}

        {/* 360 indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong text-[10px] uppercase tracking-[0.25em] font-bold text-foreground/80">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          360° · Drag to spin
        </div>
      </div>

      {/* Reflective platform */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-6%] w-[70%] h-6 rounded-[50%] bg-primary/30 blur-2xl" />
    </div>
  );
};

export default HeroSneaker360;
