import type { EmotionFamily } from "../types";

export interface TreeSceneOptions {
  total: number;
  family: EmotionFamily;
  seed: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hexA: string, hexB: string, amount: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const channel = (index: number) => Math.round(a[index] + (b[index] - a[index]) * amount);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(0.4, rgba(color, alpha * 0.35));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTreeScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: TreeSceneOptions,
  time = 0,
  poster = false,
) {
  const { total, family, seed } = options;
  const rand = mulberry32(seed);
  const growth = Math.min(1, 0.24 + total / 42);
  const calm = family.id === "calm" || family.id === "complex";
  const dim = family.id === "fatigue";

  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, mix(family.sky, "#050908", 0.28));
  sky.addColorStop(0.58, family.sky);
  sky.addColorStop(1, mix(family.sky, "#0A1412", 0.52));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Distant halo behind the tree.
  glow(ctx, width * 0.52, height * 0.53, Math.max(width, height) * 0.44, family.glow, dim ? 0.08 : 0.13);

  // Stars / dust.
  const starCount = poster ? 90 : 54;
  for (let i = 0; i < starCount; i += 1) {
    const x = rand() * width;
    const y = rand() * height * 0.62;
    const r = rand() * 1.5 + 0.4;
    const alpha = (0.12 + rand() * 0.5) * (dim ? 0.5 : 1);
    ctx.fillStyle = rgba(family.glow, alpha);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon / soft light source.
  const moonX = width * 0.79;
  const moonY = height * 0.2;
  glow(ctx, moonX, moonY, width * 0.13, family.glow, poster ? 0.2 : 0.16);
  ctx.fillStyle = rgba(family.glow, 0.33);
  ctx.beginPath();
  ctx.arc(moonX, moonY, width * 0.028, 0, Math.PI * 2);
  ctx.fill();

  // Far hills.
  ctx.fillStyle = mix(family.sky, "#081210", 0.55);
  ctx.beginPath();
  ctx.moveTo(0, height * 0.82);
  ctx.quadraticCurveTo(width * 0.22, height * 0.73, width * 0.48, height * 0.82);
  ctx.quadraticCurveTo(width * 0.74, height * 0.9, width, height * 0.78);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Ground.
  const groundY = height * 0.9;
  const ground = ctx.createLinearGradient(0, groundY - height * 0.08, 0, height);
  ground.addColorStop(0, mix(family.sky, "#0C1916", 0.52));
  ground.addColorStop(1, "#07100E");
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.quadraticCurveTo(width * 0.3, groundY - height * 0.035, width * 0.62, groundY);
  ctx.quadraticCurveTo(width * 0.82, groundY + height * 0.018, width, groundY - height * 0.008);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  const sway = Math.sin(time * 0.00055) * (calm ? 0.6 : 1.4);
  const baseX = width * 0.5;
  const baseY = groundY + height * 0.015;
  const treeHeight = height * (0.2 + growth * 0.25);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const drawLeaf = (x: number, y: number, angle: number, scale: number, alpha: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + sway * 0.02);
    ctx.fillStyle = rgba(family.leaf, alpha);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.2 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawFlower = (x: number, y: number, scale: number, alpha: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = rgba(family.glow, alpha * 0.8);
    for (let p = 0; p < 5; p += 1) {
      const a = (Math.PI * 2 * p) / 5;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 3.4 * scale, Math.sin(a) * 3.4 * scale, 3.1 * scale, 2.2 * scale, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = rgba("#FFF4CD", alpha);
    ctx.beginPath();
    ctx.arc(0, 0, 1.8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  if (total <= 0) {
    // A seed in the soil, with two very small leaves.
    const seedScale = Math.max(0.7, width / 620);
    glow(ctx, baseX, baseY - 10, width * 0.13, family.glow, 0.16);
    ctx.fillStyle = rgba(family.glow, 0.8);
    ctx.beginPath();
    ctx.ellipse(baseX, baseY - 7, width * 0.011, width * 0.016, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(family.leaf, 0.62);
    ctx.lineWidth = 1.8 * seedScale;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY - 5);
    ctx.quadraticCurveTo(baseX + 2 * seedScale, baseY - 22 * seedScale, baseX + 5 * seedScale, baseY - 30 * seedScale);
    ctx.stroke();
    drawLeaf(baseX - 4 * seedScale, baseY - 27 * seedScale, -0.75, 1.4 * seedScale, 0.7);
    drawLeaf(baseX + 7 * seedScale, baseY - 31 * seedScale, -2.35, 1.3 * seedScale, 0.65);
  } else {
    const maxDepth = Math.min(6, 3 + Math.floor(growth * 3) + (total >= 20 ? 1 : 0));
    const branchCount = poster ? 2 : 2;

    const branch = (
      x: number,
      y: number,
      length: number,
      angle: number,
      lineWidth: number,
      depth: number,
    ) => {
      if (depth < 0 || length < 2) return;
      const bend = (rand() - 0.5) * 0.32;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      const midX = x + Math.cos(angle + bend) * length * 0.58;
      const midY = y + Math.sin(angle + bend) * length * 0.58;

      ctx.strokeStyle = depth > maxDepth - 2
        ? mix("#2A2420", family.leaf, 0.14)
        : rgba(family.leaf, 0.62 + depth * 0.04);
      ctx.lineWidth = Math.max(0.8, lineWidth);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      if (depth <= 1 || length < 9) {
        const leafScale = 0.65 + rand() * 0.65;
        drawLeaf(endX, endY, angle + (rand() - 0.5), leafScale, 0.38 + rand() * 0.45);
        if (rand() > 0.48) {
          drawLeaf(
            endX + (rand() - 0.5) * 8,
            endY + (rand() - 0.5) * 8,
            angle + (rand() - 0.5) * 2,
            leafScale * 0.8,
            0.3 + rand() * 0.35,
          );
        }
        if (total >= 20 && rand() > 0.66) {
          drawFlower(endX, endY - 2, 0.8 + rand() * 0.4, 0.6);
        }
        return;
      }

      const spread = 0.33 + rand() * 0.2;
      for (let b = 0; b < branchCount; b += 1) {
        const sign = b === 0 ? -1 : 1;
        branch(
          endX,
          endY,
          length * (0.66 + rand() * 0.1),
          angle + sign * spread + (rand() - 0.5) * 0.08,
          lineWidth * 0.64,
          depth - 1,
        );
      }
      if (rand() > 0.62) {
        branch(
          endX,
          endY,
          length * (0.48 + rand() * 0.12),
          angle + (rand() - 0.5) * 0.32,
          lineWidth * 0.48,
          depth - 2,
        );
      }
    };

    // Trunk.
    const trunkWidth = width * (0.011 + growth * 0.006);
    const trunkGradient = ctx.createLinearGradient(baseX, baseY, baseX, baseY - treeHeight);
    trunkGradient.addColorStop(0, "#2B2722");
    trunkGradient.addColorStop(0.5, mix("#4A3D31", family.leaf, 0.18));
    trunkGradient.addColorStop(1, mix("#4A3D31", family.leaf, 0.32));
    ctx.strokeStyle = trunkGradient;
    ctx.lineWidth = trunkWidth;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(baseX - width * 0.012, baseY - treeHeight * 0.55, baseX + width * 0.004, baseY - treeHeight);
    ctx.stroke();

    branch(baseX, baseY - treeHeight * 0.02, treeHeight * 0.38, -Math.PI / 2, trunkWidth * 0.72, maxDepth);
  }

  // Fireflies around the tree.
  const fireflyCount = dim ? 10 : family.id === "lonely" ? 1 : 26;
  for (let i = 0; i < fireflyCount; i += 1) {
    const base = rand();
    const fx = width * (0.18 + base * 0.66) + Math.sin(time * 0.0004 + i * 2.1) * width * 0.02;
    const fy = height * (0.35 + rand() * 0.5) + Math.cos(time * 0.0005 + i) * height * 0.015;
    const r = (family.id === "lonely" ? 3.4 : 1.4 + rand() * 2.2) * (poster ? 1.6 : 1);
    const alpha = (0.35 + Math.sin(time * 0.0015 + i) * 0.18) * (dim ? 0.55 : 1);
    glow(ctx, fx, fy, r * 9, family.glow, Math.max(0.06, alpha * 0.5));
    ctx.fillStyle = rgba("#FFF6D5", Math.min(0.95, alpha + 0.3));
    ctx.beginPath();
    ctx.arc(fx, fy, r, 0, Math.PI * 2);
    ctx.fill();
    if (family.id === "lonely" && i === 0) {
      glow(ctx, fx, fy, 48, family.glow, 0.22);
    }
  }

  // Weather / emotion plugin.
  if (family.id === "sadness") {
    ctx.strokeStyle = rgba("#9DB6D4", 0.3);
    ctx.lineWidth = 1;
    for (let i = 0; i < (poster ? 70 : 48); i += 1) {
      const x = ((i * 97 + seed) % width) + 0.5;
      const speed = 0.06 + (i % 5) * 0.012;
      const y = ((i * 53 + time * speed) % (height * 0.8)) + height * 0.08;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 9);
      ctx.stroke();
    }
  }

  if (family.id === "anxiety" || family.id === "complex") {
    for (let i = 0; i < 4; i += 1) {
      const x = width * (0.2 + i * 0.2) + Math.sin(time * 0.0002 + i) * width * 0.04;
      const y = height * (0.55 + (i % 2) * 0.14);
      const mist = ctx.createRadialGradient(x, y, 0, x, y, width * 0.23);
      mist.addColorStop(0, rgba(family.glow, 0.05));
      mist.addColorStop(1, rgba(family.glow, 0));
      ctx.fillStyle = mist;
      ctx.fillRect(0, 0, width, height);
    }
  }

  if (family.id === "anger") {
    for (let i = 0; i < (poster ? 28 : 18); i += 1) {
      const x = width * (0.35 + rand() * 0.3);
      const y = height * (0.55 + rand() * 0.35) - ((time * 0.02 + i * 18) % (height * 0.4));
      const r = 1 + rand() * 2;
      glow(ctx, x, y, r * 7, family.glow, 0.25);
      ctx.fillStyle = rgba("#FFD0A1", 0.75);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (family.id === "joy" || family.id === "anticipation") {
    for (let i = 0; i < (poster ? 55 : 34); i += 1) {
      const x = width * (0.2 + rand() * 0.6);
      const y = height * (0.25 + rand() * 0.55) - ((time * 0.008 + i * 13) % (height * 0.18));
      const r = 0.8 + rand() * 1.5;
      glow(ctx, x, y, r * 6, family.glow, 0.2);
      ctx.fillStyle = rgba("#FFF0BD", 0.65);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (family.id === "calm") {
    for (let i = 0; i < 8; i += 1) {
      const x = ((i * 131 + seed) % width) + Math.sin(time * 0.0004 + i) * 12;
      const y = ((i * 79 + time * 0.015) % height) * 0.7 + height * 0.2;
      ctx.fillStyle = rgba(family.glow, 0.3);
      ctx.beginPath();
      ctx.ellipse(x, y, 3, 1.2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (dim) {
    ctx.fillStyle = "rgba(5, 8, 7, 0.26)";
    ctx.fillRect(0, 0, width, height);
  }

  // Vignette.
  const vignette = ctx.createRadialGradient(width * 0.5, height * 0.48, width * 0.2, width * 0.5, height * 0.48, width * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export class TreeRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: TreeSceneOptions;
  private raf = 0;
  private start = performance.now();
  private burstParticles: BurstParticle[] = [];
  private reduced = false;
  private width = 0;
  private height = 0;

  constructor(canvas: HTMLCanvasElement, options: TreeSceneOptions) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is unavailable");
    this.ctx = ctx;
    this.options = options;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();
    this.loop(this.start);
  }

  update(options: TreeSceneOptions) {
    this.options = options;
    if (this.reduced) this.draw(this.start);
  }

  burst() {
    const { width, height } = this;
    const family = this.options.family;
    for (let i = 0; i < 54; i += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 0.7 + Math.random() * 2.4;
      this.burstParticles.push({
        x: width * 0.5 + (Math.random() - 0.5) * width * 0.16,
        y: height * 0.84,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.7,
        size: 1 + Math.random() * 2.8,
        color: family.glow,
      });
    }
    if (this.reduced) this.draw(this.start);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw(performance.now());
  }

  private loop = (time: number) => {
    if (this.reduced) return;
    this.draw(time);
    this.raf = requestAnimationFrame(this.loop);
  };

  private draw(time: number) {
    const { ctx, width, height, options } = this;
    if (!width || !height) return;
    drawTreeScene(ctx, width, height, options, time - this.start, false);

    for (let i = this.burstParticles.length - 1; i >= 0; i -= 1) {
      const p = this.burstParticles[i];
      p.life -= 0.012;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.015;
      p.vx *= 0.994;
      if (p.life <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }
      const alpha = Math.max(0, p.life);
      glow(ctx, p.x, p.y, p.size * 10, p.color, alpha * 0.4);
      ctx.fillStyle = rgba("#FFF6D5", alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.burstParticles.length > 0) {
      // Linger on the burst with a soft additive veil.
      ctx.fillStyle = rgba(options.family.glow, 0.02);
      ctx.fillRect(0, 0, width, height);
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }
}
