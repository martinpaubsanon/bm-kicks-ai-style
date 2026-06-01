import { useEffect, useRef, useState } from "react";
import nikeAirMax from "@/assets/products/nike-air-max-90.jpg";
import nikePegasus from "@/assets/products/nike-pegasus-40.jpg";
import adidasUltra from "@/assets/products/adidas-ultraboost-23.jpg";
import newBalance from "@/assets/products/newbalance-freshfoam.jpg";
import brooksGhost from "@/assets/products/brooks-ghost-16.jpg";
import heroSneakers from "@/assets/hero-sneakers.jpg";

const SLIDES = [
  { src: heroSneakers, label: "BM Kicks" },
  { src: nikeAirMax, label: "Air Max 90" },
  { src: adidasUltra, label: "Ultraboost 23" },
  { src: nikePegasus, label: "Pegasus 40" },
  { src: newBalance, label: "Fresh Foam" },
  { src: brooksGhost, label: "Ghost 16" },
];

const COUNT = SLIDES.length;
const STEP = 360 / COUNT;

/**
 * True 3D rotating sneaker showcase.
 * Faces are arranged on a Y-axis ring; auto-rotates and is drag/swipe controllable.
 */
export const Sneaker3DCarousel = () => {
  const [angle, setAngle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [radius, setRadius] = useState(260);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const dragRef = useRef<{ x: number; startAngle: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Responsive radius based on container width
  useEffect(() => {
    const update = () => {
      const w = wrapRef.current?.clientWidth ?? 400;
      // radius ~ half of card width / tan(180/COUNT) — eyeballed for nice spacing
      const cardW = Math.min(260, w * 0.62);
      const r = cardW / (2 * Math.tan(Math.PI / COUNT)) * 0.9;
      setRadius(r);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Auto rotation loop
  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current === 0) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      if (!paused && !dragRef.current) {
        setAngle((a) => a - dt * 0.02); // ~7.2°/s → full turn in ~50s
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [paused]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, startAngle: angle };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    setAngle(dragRef.current.startAngle + dx * 0.4);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-[340px] md:h-[480px] select-none cursor-grab active:cursor-grabbing"
      style={{ perspective: "1400px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="3D sneaker showcase — drag to rotate"
      role="region"
    >
      {/* Soft platform glow */}
      <div className="pointer-events-none absolute inset-x-8 bottom-4 h-16 rounded-[50%] bg-primary/30 blur-3xl" />

      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(-${radius}px) rotateY(${angle}deg)`,
          transition: dragRef.current ? "none" : "transform 60ms linear",
        }}
      >
        {SLIDES.map((s, i) => {
          const rot = i * STEP;
          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2"
              style={{
                width: "min(260px, 62%)",
                aspectRatio: "1 / 1",
                marginLeft: "calc(min(260px, 62%) / -2)",
                marginTop: "calc(min(260px, 62%) / -2)",
                transform: `rotateY(${rot}deg) translateZ(${radius}px)`,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-card ring-1 ring-border/60">
                <img
                  src={s.src}
                  alt={s.label}
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="font-display uppercase text-sm tracking-widest text-foreground">
                    {s.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                    BM
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sneaker3DCarousel;
