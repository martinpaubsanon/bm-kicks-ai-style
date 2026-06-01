import { useEffect, useRef, useState } from "react";
import hero from "@/assets/hero-sneakers.jpg";

/**
 * Smooth 360° showcase of the hero sneaker.
 * Uses CSS 3D transforms with continuous rotation on the Y axis
 * for a true turntable feel — no frame stepping.
 */
export const HeroSneaker360 = () => {
  const [angle, setAngle] = useState(0);
  const pausedRef = useRef(false);
  const dragRef = useRef<{ x: number; startAngle: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Continuous rotation loop — ~18°/s → full turn in 20s, butter-smooth.
  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (!pausedRef.current && !dragRef.current) {
        setAngle((a) => (a + dt * 18) % 360);
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
    dragRef.current = { x: e.clientX, startAngle: angle };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const width = containerRef.current?.clientWidth ?? 320;
    const dx = e.clientX - dragRef.current.x;
    // one container width of drag → full 360°
    setAngle(((dragRef.current.startAngle + (dx / width) * 360) % 360 + 360) % 360);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  // Subtle lighting that tracks the rotation so the shoe feels lit, not just spun.
  const lightX = 50 + Math.sin((angle * Math.PI) / 180) * 30;
  const shading = Math.abs(Math.sin((angle * Math.PI) / 180));

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
      aria-label="Hero sneaker — drag to spin"
      role="region"
      style={{ perspective: "1400px" }}
    >
      {/* Ambient glow */}
      <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl opacity-60 group-hover:opacity-90 transition-opacity" />

      {/* Rotating stage */}
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden shadow-card will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${angle}deg)`,
        }}
      >
        <img
          src={hero}
          alt="Premium sneakers from BM Kicks"
          width={1024}
          height={1024}
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover [backface-visibility:hidden]"
        />
        {/* Mirrored backface so the shoe looks 3D from any angle */}
        <img
          src={hero}
          alt=""
          aria-hidden="true"
          width={1024}
          height={1024}
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg) scaleX(-1)" }}
        />

        {/* Dynamic lighting overlay — moves with rotation */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay transition-[background] duration-100"
          style={{
            background: `radial-gradient(circle at ${lightX}% 40%, hsl(0 0% 100% / 0.35), transparent 55%)`,
          }}
        />
        {/* Side shading for depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(90deg, hsl(0 0% 0% / ${shading * 0.25}), transparent 40%, transparent 60%, hsl(0 0% 0% / ${shading * 0.25}))`,
          }}
        />
      </div>

      {/* 360 indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong text-[10px] uppercase tracking-[0.25em] font-bold text-foreground/80 z-20">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        360° · Drag to spin
      </div>

      {/* Reflective platform */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-2 w-[72%] h-8 rounded-[50%] bg-primary/30 blur-2xl" />
    </div>
  );
};

export default HeroSneaker360;
