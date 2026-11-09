import { useEffect, useState } from "react";
import type { EmotionFamily, Watering } from "../types";
import { formatDateCN } from "../lib/storage";
import { generatePoster } from "../lib/poster";
import { Modal } from "./Modal";
import { Icon } from "./Icon";

export function PosterModal({
  open,
  onClose,
  watering,
  family,
  total,
  seed,
}: {
  open: boolean;
  onClose: () => void;
  watering: Watering | null;
  family: EmotionFamily | null;
  total: number;
  seed: number;
}) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open || !watering || !family) return;
    setUrl("");
    const timer = window.setTimeout(() => {
      setUrl(generatePoster(watering, family, total, seed, formatDateCN(new Date())));
    }, 120);
    return () => window.clearTimeout(timer);
  }, [open, watering, family, total, seed]);

  const download = () => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `萤火-${watering?.date ?? "today"}-${family?.name ?? "情绪"}.png`;
    link.click();
  };

  return (
    <Modal open={open} onClose={onClose} label="今晚的萤火海报" className="poster-modal">
      <div className="poster-copy">
        <p className="eyebrow">A LITTLE LIGHT</p>
        <h2>今晚的萤火</h2>
        <p className="muted">
          这不是打卡，也不是成绩单。只是今天被接住之后，留下的一点证据。
        </p>
        <div className="poster-note">
          <Icon name="shield" size={16} />
          <span>海报不包含你的倾诉内容与备注，只保留情绪与一句话。</span>
        </div>
        <div className="poster-actions">
          <button type="button" className="btn btn-primary" onClick={download} disabled={!url}>
            <Icon name="download" size={16} />
            保存这张光
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            回到树
          </button>
        </div>
      </div>
      <div className="poster-frame">
        {url ? (
          <img src={url} alt={`${family?.name ?? ""}情绪海报`} />
        ) : (
          <div className="poster-loading">
            <span className="loading-dot" />
            在给今晚的光一点时间
          </div>
        )}
      </div>
    </Modal>
  );
}
