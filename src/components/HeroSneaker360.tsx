import { useEffect, useRef, useState } from "react";
import frame0 from "@/assets/hero-sneakers.jpg";
import frame1 from "@/assets/hero-turntable-1.jpg";
import frame2 from "@/assets/hero-turntable-2.jpg";
import frame3 from "@/assets/hero-turntable-3.jpg";
import frame4 from "@/assets/hero-turntable-4.jpg";
import frame5 from "@/assets/hero-turntable-5.jpg";

const FRAMES = [frame0, frame1, frame2, frame3, frame4, frame5];
const ROT_SPEED = 0.4; // frames per second of progress → full turn in ~15s

/**
 * Smooth 360° turntable of the hero sneaker.
 * Advances a fractional index every frame and cross-fades between
 * adjacent pre-rendered angles for a continuous, non-jarring rotation.
 */
export const HeroSneaker360 = () => {
  const [progress, setProgress] = useState(0); // float in [0, FRAMES.length)
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const dragRef = useRef<{ x: number; startProgress: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (!pausedRef.current && !dragRef.current) {
        const next = (progressRef.current + dt * ROT_SPEED) % FRAMES.length;
        progressRef.current = next;
        setProgress(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, startProgress: progressRef.current };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const width = containerRef.current?.clientWidth ?? 320;
    const dx = e.clientX - dragRef.current.x;
    const next =
      ((dragRef.current.startProgress + (dx / width) * FRAMES.length) % FRAMES.length +
        FRAMES.length) %
      FRAMES.length;
    progressRef.current = next;
    setProgress(next);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const base = Math.floor(progress);
  const t = progress - base; // 0..1 blend toward next frame

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto aspect-square select-none cursor-grab active:cursor-grabbing group"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      aria-label="Hero sneaker 360° — drag to spin"
      role="region"
    >
      {/* Ambient glow */}
      <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl opacity-60 group-hover:opacity-90 transition-opacity" />

      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-card">
        {FRAMES.map((src, i) => {
          let opacity = 0;
          if (i === base) opacity = 1 - t;
          else if (i === (base + 1) % FRAMES.length) opacity = t;
          return (
            <img
              key={i}
              src={src}
              alt={i === 0 ? "Premium sneakers from BM Kicks" : ""}
              aria-hidden={i !== 0}
              width={1024}
              height={1024}
              fetchPriority={i === 0 ? "high" : "low"}
              loading="eager"
              decoding="async"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover will-change-[opacity]"
              style={{ opacity }}
            />
          );
        })}

        {/* 360 indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong text-[10px] uppercase tracking-[0.25em] font-bold text-foreground/80 z-20">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          360° · Drag to spin
        </div>
      </div>

      {/* Reflective platform */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-2 w-[72%] h-8 rounded-[50%] bg-primary/30 blur-2xl" />
    </div>
  );
};

export default HeroSneaker360;
