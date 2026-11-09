import { useState } from "react";
import type { Store } from "../types";
import { formatShortDate, growthStage } from "../lib/storage";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";

const COMFORT_LABEL: Record<string, string> = {
  listen: "被倾听",
  affirm: "被肯定",
  company: "被陪伴",
  quiet: "先安静",
};
const TONE_LABEL: Record<string, string> = {
  gentle: "温柔",
  light: "轻松",
  steady: "沉稳",
  direct: "直接",
};

export function Me({
  store,
  openProfile,
  resetAll,
  onDisablePersonalization,
  showToast,
}: {
  store: Store;
  openProfile: () => void;
  resetAll: () => void;
  onDisablePersonalization: () => void;
  showToast: (message: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const stage = growthStage(store.tree.total);
  const profile = store.profile;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "萤火-我的数据.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("数据已经导出。带走自己的东西，是应该的。");
  };

  return (
    <div className="page me-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">YOUR ROOM</p>
          <h1>我的</h1>
          <p className="page-sub">你的画像、你的树、你的数据，都在这里。</p>
        </div>
        <div className="page-head-note">
          <Icon name="shield" size={16} />
          <span>只保存在这台设备</span>
        </div>
      </header>

      <div className="me-grid">
        <section className="me-card me-profile">
          <div className="me-card-head">
            <div>
              <p className="eyebrow">ABOUT YOU</p>
              <h2>我记得的你</h2>
            </div>
            <button type="button" className="icon-btn" onClick={openProfile} aria-label="编辑画像">
              <Icon name="edit" size={17} />
            </button>
          </div>

          {profile.completed ? (
            <>
              <div className="profile-big">
                <span className="profile-avatar">{profile.name.trim().slice(0, 1) || "萤"}</span>
                <div>
                  <h3>{profile.name || "朋友"}</h3>
                  <p>{profile.stage || "此时此地"} · 个性化解锁</p>
                </div>
              </div>
              <div className="profile-tags">
                {profile.interests.length > 0 ? (
                  profile.interests.map((interest) => <span key={interest}>{interest}</span>)
                ) : (
                  <span>还没有兴趣标签</span>
                )}
              </div>
              <dl className="profile-facts">
                <div>
                  <dt>安慰偏好</dt>
                  <dd>{COMFORT_LABEL[profile.comfort] ?? "被陪伴"}</dd>
                </div>
                <div>
                  <dt>语气</dt>
                  <dd>{TONE_LABEL[profile.tone] ?? "温柔"}</dd>
                </div>
                <div>
                  <dt>雷区</dt>
                  <dd>{profile.avoid || "还没有填写"}</dd>
                </div>
                <div>
                  <dt>边界</dt>
                  <dd>{profile.boundaries || "还没有填写"}</dd>
                </div>
              </dl>
              <button type="button" className="text-link profile-disable" onClick={onDisablePersonalization}>
                暂时关闭个性化，只用通用模式
              </button>
            </>
          ) : (
            <div className="profile-empty">
              <span className="profile-avatar">萤</span>
              <h3>还没有画像</h3>
              <p>填写称呼、兴趣与安慰偏好，回应会更像在跟你说话。也可以一直使用通用关切模式。</p>
              <button type="button" className="btn btn-primary" onClick={openProfile}>
                开始画像
                <Icon name="arrow-right" size={16} />
              </button>
            </div>
          )}
        </section>

        <section className="me-card me-stats">
          <p className="eyebrow">YOUR DAYS</p>
          <h2>一些很小的记录</h2>
          <div className="stat-row">
            <div>
              <strong>{store.vents.length}</strong>
              <span>次倾诉</span>
            </div>
            <div>
              <strong>{store.tree.total}</strong>
              <span>天浇灌</span>
            </div>
            <div>
              <strong>{stage.name}</strong>
              <span>树的阶段</span>
            </div>
          </div>
          <div className="stat-last">
            <span>最近一次浇灌</span>
            <strong>{store.tree.lastDate ? formatShortDate(store.tree.lastDate) : "还没有"}</strong>
          </div>
          <p className="me-quote">“树不评价天气，它只是记得每一场雨。”</p>
        </section>

        <section className="me-card me-safety">
          <div className="me-card-head">
            <div>
              <p className="eyebrow">SAFETY</p>
              <h2>如果你现在很危险</h2>
            </div>
            <Icon name="shield" size={22} />
          </div>
          <p>
            萤火是 AI 陪伴，不是心理咨询师、精神科医生或急救服务。如果你或身边的人正处于危险中，
            请立即联系当地急救（120）或报警（110）。
          </p>
          <div className="safety-links">
            <a href="tel:12356">12356 · 全国心理援助热线</a>
            <a href="tel:120">120 · 急救</a>
            <a href="tel:110">110 · 报警</a>
          </div>
        </section>

        <section className="me-card me-data">
          <div className="me-card-head">
            <div>
              <p className="eyebrow">PRIVACY</p>
              <h2>你的数据</h2>
            </div>
            <Icon name="shield" size={22} />
          </div>
          <p>
            默认私密。倾诉、画像、浇灌记录只保存在当前浏览器的 localStorage 里，不会上传到服务器。
            换设备或清理浏览器数据后，这些内容会消失。
          </p>
          <div className="data-actions">
            <button type="button" className="btn btn-ghost" onClick={exportData}>
              <Icon name="download" size={16} />
              导出我的数据
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
              <Icon name="trash" size={16} />
              清空全部
            </button>
          </div>
          <p className="muted tiny">
            当前版本没有服务器端账号系统。正式上线前，需要补充加密存储、删除审计与合规评估。
          </p>
        </section>
      </div>

      <footer className="me-footer">
        <span>萤火 v0.2 · 产品原型</span>
        <span>让情绪有处可去，让陪伴有光。</span>
      </footer>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} label="确认清空全部数据" className="confirm-modal">
        <p className="eyebrow">ARE YOU SURE</p>
        <h2>要清空全部吗？</h2>
        <p className="muted">
          这会删除你的画像、倾诉记录和树的成长记录。删除后无法恢复。
        </p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>
            再想想
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              resetAll();
              setConfirmOpen(false);
            }}
          >
            确认清空
          </button>
        </div>
      </Modal>
    </div>
  );
}
