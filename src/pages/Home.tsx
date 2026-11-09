import type { Page, Store } from "../types";
import { greeting, growthStage, todayKey } from "../lib/storage";
import { EMOTION_BY_ID } from "../data/emotions";
import { FireflyField } from "../components/FireflyField";
import { EmotionTree } from "../components/EmotionTree";
import { Icon, type IconName } from "../components/Icon";

const ENTRIES: {
  id: string;
  number: string;
  title: string;
  copy: string;
  icon: IconName;
  page: Page;
  action?: "profile";
}[] = [
  {
    id: "vent",
    number: "01",
    title: "说一说",
    copy: "把心里的话放下。文字或语音都可以。",
    icon: "feather",
    page: "vent",
  },
  {
    id: "heart",
    number: "02",
    title: "被听见",
    copy: "让我先认识你，再用你舒服的方式回应。",
    icon: "heart",
    page: "vent",
    action: "profile",
  },
  {
    id: "tree",
    number: "03",
    title: "种一棵树",
    copy: "给今天的情绪浇一次水。",
    icon: "tree",
    page: "tree",
  },
];

export function Home({
  store,
  navigate,
  openProfile,
}: {
  store: Store;
  navigate: (page: Page) => void;
  openProfile: () => void;
}) {
  const dateGreeting = greeting();
  const watered = store.tree.lastDate === todayKey();
  const last = store.tree.history[0];
  const family = last ? EMOTION_BY_ID[last.family] : EMOTION_BY_ID.calm;
  const stage = growthStage(store.tree.total);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" />
        <FireflyField density={54} />
        <div className="hero-content">
          <p className="hero-kicker">
            FIREFLY <span>/</span> 夜间花园
          </p>
          <h1 className="hero-title">萤火</h1>
          <p className="hero-tagline">让情绪有处可去，让陪伴有光。</p>
          <p className="hero-sub">先不急着好起来。先在这里坐一会儿。</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-light" onClick={() => navigate("vent")}>
              走进树洞
              <Icon name="arrow-right" size={17} />
            </button>
            <button type="button" className="btn btn-ghost-light" onClick={() => navigate("tree")}>
              看看今天的树
            </button>
          </div>
        </div>
        <div className="hero-note">
          <span className="hero-line" />
          AI 陪伴 · 不替代专业帮助
        </div>
        <div className="hero-scroll">往下走，灯还亮着</div>
      </section>

      <section className="home-body">
        <div className="home-intro">
          <p className="eyebrow">TONIGHT</p>
          <h2>
            {dateGreeting.title} <span>{dateGreeting.sub}</span>
          </h2>
          <p className="home-question">今晚，你想把情绪放在哪里？</p>
        </div>

        <div className="entry-grid">
          {ENTRIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="entry-card"
              onClick={() => (entry.action === "profile" ? openProfile() : navigate(entry.page))}
            >
              <span className="entry-number">{entry.number}</span>
              <span className="entry-icon">
                <Icon name={entry.icon} size={24} />
              </span>
              <span className="entry-title">{entry.title}</span>
              <span className="entry-copy">{entry.copy}</span>
              <span className="entry-arrow">
                <Icon name="arrow-right" size={16} />
              </span>
            </button>
          ))}
        </div>

        <div className="home-lower">
          <article className="today-card">
            <div className="today-copy">
              <p className="eyebrow">YOUR TREE</p>
              <h3>{watered ? "今天已经浇过了。" : "树在等一小片雨。"}</h3>
              <p>
                {watered
                  ? "它记得今天的情绪。你可以看看今晚的光。"
                  : `已经陪它走过 ${store.tree.total} 天。今天不用做什么，浇一次水就好。`}
              </p>
              <div className="today-meta">
                <span className="stage-pill">{stage.name}</span>
                <span className="muted small">
                  {stage.next === null ? "满树萤火" : `再 ${stage.next} 次，进入下一段生长`}
                </span>
              </div>
              <button type="button" className="text-link" onClick={() => navigate("tree")}>
                {watered ? "看看今天的树" : "去浇一次水"}
                <Icon name="arrow-right" size={15} />
              </button>
            </div>
            <div className="today-tree">
              <EmotionTree total={store.tree.total} family={family} seed={store.tree.seed} />
            </div>
          </article>

          <article className="quote-card">
            <span className="quote-mark">“</span>
            <blockquote>树不评价天气，它只是记得每一场雨。</blockquote>
            <p>—— 萤火 · 情绪树</p>
            <div className="quote-orbit" />
          </article>
        </div>

        <footer className="home-footer">
          <span>萤火 / FIREFLY</span>
          <span>让情绪有处可去，让陪伴有光。</span>
        </footer>
      </section>
    </div>
  );
}
