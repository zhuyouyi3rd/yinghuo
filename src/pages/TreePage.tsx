import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { EmotionFamily, EmotionFamilyId, TreeState, Watering } from "../types";
import { EMOTIONS, EMOTION_BY_ID } from "../data/emotions";
import { formatShortDate, growthStage, todayKey, uid } from "../lib/storage";
import { EmotionTree } from "../components/EmotionTree";
import { Modal } from "../components/Modal";
import { PosterModal } from "../components/PosterModal";
import { Icon } from "../components/Icon";

const INTENSITY = ["一丝", "有些", "明显", "强烈", "快装不下了"];

export function TreePage({
  tree,
  water,
  showToast,
}: {
  tree: TreeState;
  water: (watering: Watering) => void;
  showToast: (message: string) => void;
}) {
  const [selectedFamily, setSelectedFamily] = useState<EmotionFamilyId>("calm");
  const [word, setWord] = useState(EMOTION_BY_ID.calm.words[0]);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [waterOpen, setWaterOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterWatering, setPosterWatering] = useState<Watering | null>(null);
  const [posterFamily, setPosterFamily] = useState<EmotionFamily | null>(null);

  const wateredToday = tree.lastDate === todayKey();
  const last = tree.history[0];
  const stage = growthStage(tree.total);
  const displayFamily = EMOTION_BY_ID[wateredToday && last ? last.family : selectedFamily];
  const current = EMOTION_BY_ID[selectedFamily];

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem("firefly.prefillEmotion") as EmotionFamilyId | null;
      if (prefill && EMOTION_BY_ID[prefill]) {
        setSelectedFamily(prefill);
        setWord(EMOTION_BY_ID[prefill].words[0]);
        sessionStorage.removeItem("firefly.prefillEmotion");
      }
    } catch {
      // no-op
    }
  }, []);

  const history = useMemo(() => tree.history.slice(0, 7), [tree.history]);

  const chooseFamily = (family: EmotionFamily) => {
    setSelectedFamily(family.id);
    setWord(family.words[0]);
  };

  const openWater = () => {
    if (wateredToday) return;
    setStep(0);
    setWaterOpen(true);
  };

  const submitWater = () => {
    if (wateredToday) {
      showToast("今天已经浇过了。树记得。");
      return;
    }
    if (!word) {
      showToast("先选一个最接近的情绪词。");
      return;
    }
    const watering: Watering = {
      id: uid(),
      date: todayKey(),
      family: selectedFamily,
      word,
      intensity,
      note: note.trim(),
      quoteTitle: current.posterTitle,
      quoteBody: current.posterBody,
    };
    water(watering);
    setBurstKey((value) => value + 1);
    setWaterOpen(false);
    setNote("");
    setPosterWatering(watering);
    setPosterFamily(current);
    window.setTimeout(() => setPosterOpen(true), 1500);
  };

  const viewTodayPoster = () => {
    if (!last) {
      showToast("今天还没有留下光。先浇一次水吧。");
      return;
    }
    setPosterWatering(last);
    setPosterFamily(EMOTION_BY_ID[last.family]);
    setPosterOpen(true);
  };

  return (
    <div className="page tree-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">EMOTION TREE</p>
          <h1>情绪树</h1>
          <p className="page-sub">每天浇一次。树不评价天气，它只是记得每一场雨。</p>
        </div>
        <div className="page-head-note">
          <Icon name="leaf" size={16} />
          <span>{stage.name} · 累计 {tree.total} 天</span>
        </div>
      </header>

      <section className="tree-hero">
        <div className="tree-stage-card">
          <div className="tree-canvas-wrap">
            <EmotionTree
              total={tree.total}
              family={displayFamily}
              seed={tree.seed}
              burstKey={burstKey}
            />
            <div className="tree-canvas-head">
              <span className="tree-stagename">{stage.name}</span>
              <span className="tree-day">DAY {String(tree.total).padStart(2, "0")}</span>
            </div>
            <div className="tree-canvas-foot">
              <span>{displayFamily.name} · {displayFamily.short}</span>
              <span>{wateredToday ? "今天已经浇过" : "等一场小雨"}</span>
            </div>
          </div>
          <div className="tree-caption">
            <p>
              {tree.total === 0
                ? "它现在还是一颗种子。第一次浇灌，会让它看见一点光。"
                : stage.next === null
                  ? "它已经长成一棵萤火之树。你随时可以回来坐一会儿。"
                  : `再 ${stage.next} 次浇灌，它会进入下一段生长。断几天也没关系。`}
            </p>
            <span className="tree-seed">SEED · {tree.seed}</span>
          </div>
        </div>

        <aside className="tree-side">
          <div className={`tree-today ${wateredToday ? "is-watered" : ""}`}>
            <p className="eyebrow">TODAY</p>
            <h2>{wateredToday ? "今天已经浇过了。" : "今天，树在等一场雨。"}</h2>
            <p>
              {wateredToday && last
                ? `你把“${last.word}”放进了树里。它记得，也会替你守着。`
                : "不用挑一个“正确”的情绪。选一个最接近的，就够了。"}
            </p>
            {wateredToday ? (
              <button type="button" className="btn btn-primary" onClick={viewTodayPoster}>
                <Icon name="spark" size={16} />
                看看今天的光
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={openWater}>
                <Icon name="sprout" size={16} />
                给树浇水
              </button>
            )}
            <span className="tree-side-note">每天一次 · 断签不会枯萎</span>
          </div>

          <div className="tree-mini-history">
            <div className="mini-head">
              <span>最近七天</span>
              <span className="muted tiny">只属于你</span>
            </div>
            <div className="day-dots">
              {Array.from({ length: 7 }).map((_, index) => {
                const item = history[index];
                return (
                  <div key={index} className={`day-dot ${item ? "has-emotion" : ""}`}>
                    <span
                      className="day-dot-core"
                      style={{ background: item ? EMOTION_BY_ID[item.family].color : undefined }}
                    />
                    <small>{item ? item.word : "—"}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tree-side-quote">
            <span className="quote-glyph">“</span>
            <p>树不评价天气，它只是记得每一场雨。</p>
          </div>
        </aside>
      </section>

      <section className="tree-stages">
        <div className="section-head">
          <div>
            <p className="eyebrow">GROWTH</p>
            <h2>它会慢慢长大</h2>
          </div>
          <span className="muted small">按累计天数，不按连续天数</span>
        </div>
        <div className="stage-track">
          {[
            ["种子", 0],
            ["初芽", 1],
            ["抽枝", 4],
            ["含苞", 10],
            ["初花", 20],
            ["成荫", 35],
            ["萤火", 60],
          ].map(([name, threshold], index) => {
            const active = tree.total >= Number(threshold);
            const currentStage = stage.index === index;
            return (
              <div key={name} className={`stage-track-item ${active ? "is-active" : ""} ${currentStage ? "is-current" : ""}`}>
                <span className="stage-dot" />
                <strong>{name}</strong>
                <small>{threshold === 0 ? "起点" : `${threshold} 天`}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tree-note-card">
        <div>
          <p className="eyebrow">A NOTE</p>
          <h3>这不是打卡。</h3>
          <p>
            不展示别人的树，不做排行榜，不因为断签枯萎。你不在的时候，树只是进入休眠；
            回来时，它会说“你回来了”，而不是“你错过了几天”。
          </p>
        </div>
        <div className="note-stamp">
          <Icon name="leaf" size={26} />
          <span>慢慢来</span>
        </div>
      </section>

      <Modal open={waterOpen} onClose={() => setWaterOpen(false)} label="给树浇水" className="water-modal">
        <div className="water-head">
          <div>
            <p className="eyebrow">DAILY WATER</p>
            <h2>{step === 0 ? "今天最像哪一种情绪？" : "它有多重？"}</h2>
            <p className="muted small">
              {step === 0
                ? "不用选“应该”的情绪，只选最接近的。"
                : `${current.name} · ${word}。没有正确答案。`}
            </p>
          </div>
          <div className="water-progress">
            <span className={step >= 0 ? "is-on" : ""} />
            <span className={step >= 1 ? "is-on" : ""} />
          </div>
        </div>

        {step === 0 ? (
          <div className="emotion-grid">
            {EMOTIONS.map((family) => (
              <button
                key={family.id}
                type="button"
                className={`emotion-card ${selectedFamily === family.id ? "is-active" : ""}`}
                onClick={() => chooseFamily(family)}
                style={{ "--emotion": family.color } as CSSProperties}
              >
                <span className="emotion-dot" />
                <strong>{family.name}</strong>
                <small>{family.short}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="water-step">
            <div className="word-row">
              {current.words.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`word-chip ${word === item ? "is-active" : ""}`}
                  onClick={() => setWord(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="intensity-block">
              <div className="intensity-head">
                <span>强度</span>
                <span className="muted small">{INTENSITY[intensity - 1]}</span>
              </div>
              <div className="intensity-row">
                {INTENSITY.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={`intensity-dot ${intensity >= index + 1 ? "is-on" : ""}`}
                    onClick={() => setIntensity(index + 1)}
                    aria-label={label}
                    title={label}
                  />
                ))}
              </div>
            </div>
            <label className="field">
              <span>留一句话 <em>（可以不填，只属于你）</em></span>
              <input
                value={note}
                maxLength={30}
                onChange={(event) => setNote(event.target.value)}
                placeholder="今天，我想说……"
              />
            </label>
            <p className="water-privacy">
              <Icon name="shield" size={14} />
              备注默认不上海报，也不会被转发。
            </p>
          </div>
        )}

        <div className="water-foot">
          <button type="button" className="btn btn-ghost" onClick={() => setWaterOpen(false)}>
            今天不浇了
          </button>
          {step === 0 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setStep(1);
              }}
            >
              就是它
              <Icon name="arrow-right" size={16} />
            </button>
          ) : (
            <div className="water-foot-right">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
                换一种
              </button>
              <button type="button" className="btn btn-primary" onClick={submitWater}>
                <Icon name="sprout" size={16} />
                浇下这一杯
              </button>
            </div>
          )}
        </div>
      </Modal>

      <PosterModal
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        watering={posterWatering}
        family={posterFamily}
        total={tree.total}
        seed={tree.seed}
      />
    </div>
  );
}
