import type { EmotionFamily, Watering } from "../types";
import { drawTreeScene } from "./treeRenderer";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    if (ctx.measureText(current + char).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function generatePoster(
  watering: Watering,
  family: EmotionFamily,
  total: number,
  seed: number,
  dateLabel: string,
): string {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1440;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  drawTreeScene(
    ctx,
    width,
    height,
    { total: Math.max(total, 1), family, seed },
    0,
    true,
  );

  // Bottom scrim for legibility.
  const scrim = ctx.createLinearGradient(0, height * 0.56, 0, height);
  scrim.addColorStop(0, "rgba(5, 10, 9, 0)");
  scrim.addColorStop(0.45, "rgba(5, 10, 9, 0.64)");
  scrim.addColorStop(1, "rgba(5, 10, 9, 0.94)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  // Top wordmark.
  ctx.fillStyle = "rgba(255, 246, 220, 0.92)";
  ctx.font = '500 26px "Songti SC", "SimSun", serif';
  ctx.fillText("萤火", 64, 82);
  ctx.fillStyle = "rgba(255, 246, 220, 0.54)";
  ctx.font = '400 15px "Helvetica Neue", "PingFang SC", sans-serif';
  ctx.fillText("F I R E F L Y", 64, 108);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 246, 220, 0.62)";
  ctx.font = '400 18px "Helvetica Neue", "PingFang SC", sans-serif';
  ctx.fillText(dateLabel, width - 64, 82);
  ctx.fillStyle = "rgba(255, 246, 220, 0.4)";
  ctx.fillText("今日情绪", width - 64, 108);
  ctx.textAlign = "left";

  // Emotion badge.
  const badgeY = 984;
  ctx.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif';
  const badgeText = `${family.name} · ${watering.word}`;
  const badgeWidth = ctx.measureText(badgeText).width + 48;
  ctx.fillStyle = "rgba(255, 246, 220, 0.1)";
  roundRect(ctx, 64, badgeY, badgeWidth, 46, 23);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 246, 220, 0.22)";
  ctx.lineWidth = 1;
  roundRect(ctx, 64, badgeY, badgeWidth, 46, 23);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 246, 220, 0.86)";
  ctx.fillText(badgeText, 88, badgeY + 31);

  // Title.
  ctx.fillStyle = "#FFF7DF";
  ctx.font = '600 58px "Songti SC", "SimSun", serif';
  const titleLines = wrapText(ctx, family.posterTitle, 870);
  let titleY = 1110;
  for (const line of titleLines) {
    ctx.fillText(line, 64, titleY);
    titleY += 74;
  }

  // Body.
  ctx.fillStyle = "rgba(255, 246, 220, 0.76)";
  ctx.font = '400 25px "PingFang SC", "Microsoft YaHei", sans-serif';
  const bodyLines = wrapText(ctx, family.posterBody, 850);
  let bodyY = titleY + 8;
  for (const line of bodyLines) {
    ctx.fillText(line, 64, bodyY);
    bodyY += 40;
  }

  // Fine rule.
  ctx.strokeStyle = "rgba(255, 246, 220, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, 1352);
  ctx.lineTo(width - 64, 1352);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 246, 220, 0.44)";
  ctx.font = '400 14px "Helvetica Neue", "PingFang SC", sans-serif';
  ctx.fillText("萤火 · 让情绪有处可去，让陪伴有光", 64, 1386);
  ctx.textAlign = "right";
  ctx.fillText("AI 陪伴 · 不替代专业帮助", width - 64, 1386);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}
