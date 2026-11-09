import { useEffect, useRef } from "react";

interface Firefly {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  drift: number;
  alpha: number;
}

export function FireflyField({
  density = 44,
  className = "",
}: {
  density?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let particles: Firefly[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00015 + Math.random() * 0.0004,
        drift: 4 + Math.random() * 18,
        alpha: 0.2 + Math.random() * 0.5,
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const x = p.x + Math.sin(time * p.speed + p.phase) * p.drift;
        const y = p.y + Math.cos(time * p.speed * 0.8 + p.phase) * p.drift * 0.55;
        const pulse = 0.45 + Math.sin(time * 0.0012 + p.phase) * 0.3;
        const radius = p.r * 9;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, `rgba(255, 226, 155, ${p.alpha * pulse})`);
        g.addColorStop(0.3, `rgba(232, 180, 92, ${p.alpha * pulse * 0.28})`);
        g.addColorStop(1, "rgba(232, 180, 92, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 247, 218, ${Math.min(0.95, p.alpha + 0.25)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className={`firefly-field ${className}`} aria-hidden="true" />;
}
