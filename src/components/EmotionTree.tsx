import { useEffect, useRef } from "react";
import type { EmotionFamily } from "../types";
import { TreeRenderer } from "../lib/treeRenderer";

export function EmotionTree({
  total,
  family,
  seed,
  burstKey = 0,
  className = "",
}: {
  total: number;
  family: EmotionFamily;
  seed: number;
  burstKey?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<TreeRenderer | null>(null);
  const burstRef = useRef(burstKey);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new TreeRenderer(canvas, { total, family, seed });
    rendererRef.current = renderer;
    const observer = new ResizeObserver(() => renderer.resize());
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
    // The renderer is intentionally created once; state changes are pushed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rendererRef.current?.update({ total, family, seed });
  }, [total, family, seed]);

  useEffect(() => {
    if (burstKey !== burstRef.current) {
      burstRef.current = burstKey;
      rendererRef.current?.burst();
    }
  }, [burstKey]);

  return <canvas ref={canvasRef} className={`emotion-tree-canvas ${className}`} aria-label="你的情绪树" />;
}
