import { useEffect, useMemo, useState } from "react";
import type { ComfortStyle, Profile, Tone } from "../types";
import { Modal } from "./Modal";
import { Icon } from "./Icon";

const STAGES = ["学生", "工作", "自由职业", "其他"];
const TONES: { id: Tone; label: string; note: string }[] = [
  { id: "gentle", label: "温柔", note: "轻一点，慢一点" },
  { id: "light", label: "轻松", note: "不那么沉重" },
  { id: "steady", label: "沉稳", note: "像一盏稳着的灯" },
  { id: "direct", label: "直接", note: "不绕弯，但不扎人" },
];
const COMFORTS: { id: ComfortStyle; label: string; note: string }[] = [
  { id: "listen", label: "被倾听", note: "先别给建议，听我说" },
  { id: "affirm", label: "被肯定", note: "看见我已经撑了很久" },
  { id: "company", label: "被陪伴", note: "不用解决，陪我待着" },
  { id: "quiet", label: "先安静", note: "不想说话，也别追问" },
];
const INTEREST_IDEAS = ["摄影", "音乐", "散步", "养植物", "看电影", "写字", "做饭", "游戏", "运动", "画画"];

export function ProfileModal({
  open,
  onClose,
  profile,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (profile: Profile) => void;
}) {
  const [draft, setDraft] = useState<Profile>(profile);
  const [step, setStep] = useState(0);
  const [interestDraft, setInterestDraft] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(profile);
      setStep(0);
      setInterestDraft("");
    }
  }, [open, profile]);

  const coreDone = useMemo(
    () => Boolean(draft.name.trim()) && draft.interests.length > 0 && Boolean(draft.comfort),
    [draft.name, draft.interests, draft.comfort],
  );

  const addInterest = (value: string) => {
    const next = value.trim();
    if (!next || draft.interests.includes(next)) return;
    setDraft((current) => ({ ...current, interests: [...current.interests, next].slice(0, 6) }));
    setInterestDraft("");
  };

  const save = (completed: boolean) => {
    const effective = completed || (profile.completed && coreDone);
    onSave({ ...draft, completed: effective });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} label="人格画像" className="profile-modal">
      <div className="profile-head">
        <div>
          <p className="eyebrow">ABOUT YOU</p>
          <h2>让我更懂你一点</h2>
          <p className="muted small">不是测评，没有正确答案。只是让我记住，怎么陪你更舒服。</p>
        </div>
        <div className="profile-progress" aria-label={`第 ${step + 1} 步，共 3 步`}>
          {[0, 1, 2].map((item) => (
            <span key={item} className={item <= step ? "is-on" : ""} />
          ))}
        </div>
      </div>

      <div className="profile-body">
        {step === 0 && (
          <div className="profile-step">
            <label className="field">
              <span>希望我怎么称呼你？</span>
              <input
                value={draft.name}
                maxLength={12}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="一个你喜欢的称呼"
                autoFocus
              />
            </label>
            <div className="field">
              <span>你现在的人生阶段</span>
              <div className="chip-row">
                {STAGES.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    className={`chip ${draft.stage === stage ? "is-active" : ""}`}
                    onClick={() => setDraft({ ...draft, stage })}
                  >
                    {stage}
                  </button>
                ))}
              </div>
              <p className="field-note">只用来理解语境，不推断年龄，也不会用于推荐广告。</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="profile-step">
            <div className="field">
              <span>最近让你放松的事、喜欢的小爱好</span>
              <div className="tag-input">
                <input
                  value={interestDraft}
                  onChange={(event) => setInterestDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addInterest(interestDraft);
                    }
                  }}
                  placeholder="比如：摄影、养多肉、夜里散步"
                />
                <button type="button" className="btn btn-ghost btn-small" onClick={() => addInterest(interestDraft)}>
                  添加
                </button>
              </div>
              <div className="chip-row">
                {INTEREST_IDEAS.filter((idea) => !draft.interests.includes(idea)).map((idea) => (
                  <button key={idea} type="button" className="chip chip-soft" onClick={() => addInterest(idea)}>
                    + {idea}
                  </button>
                ))}
              </div>
              {draft.interests.length > 0 && (
                <div className="tag-list">
                  {draft.interests.map((interest) => (
                    <span key={interest} className="tag">
                      {interest}
                      <button
                        type="button"
                        aria-label={`移除 ${interest}`}
                        onClick={() =>
                          setDraft({ ...draft, interests: draft.interests.filter((item) => item !== interest) })
                        }
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <label className="field">
              <span>最近反复想起的一件事 <em>（可以不填）</em></span>
              <textarea
                rows={3}
                value={draft.recent}
                onChange={(event) => setDraft({ ...draft, recent: event.target.value })}
                placeholder="一句话就好。它只用来让回应更贴近你。"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="profile-step">
            <div className="field">
              <span>你更希望被怎样安慰？</span>
              <div className="comfort-grid">
                {COMFORTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`comfort-option ${draft.comfort === item.id ? "is-active" : ""}`}
                    onClick={() => setDraft({ ...draft, comfort: item.id })}
                  >
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>语气</span>
              <div className="chip-row">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    className={`chip ${draft.tone === tone.id ? "is-active" : ""}`}
                    onClick={() => setDraft({ ...draft, tone: tone.id })}
                    title={tone.note}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="two-fields">
              <label className="field">
                <span>不想听到的话 <em>（选填）</em></span>
                <input
                  value={draft.avoid}
                  onChange={(event) => setDraft({ ...draft, avoid: event.target.value })}
                  placeholder="比如：别想太多、加油"
                />
              </label>
              <label className="field">
                <span>陪伴边界 <em>（选填）</em></span>
                <input
                  value={draft.boundaries}
                  onChange={(event) => setDraft({ ...draft, boundaries: event.target.value })}
                  placeholder="比如：不想被追问原因"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="profile-foot">
        <div className={`unlock-note ${coreDone ? "is-ready" : ""}`}>
          <span className="dot" />
          {coreDone ? "个性化解锁：我会记得你" : "还差称呼 / 兴趣 / 安慰偏好，先使用通用关切模式"}
        </div>
        <div className="profile-actions">
          <button type="button" className="btn btn-ghost" onClick={() => save(false)}>
            以后再说
          </button>
          {step > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              上一步
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
              下一步
              <Icon name="arrow-right" size={16} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => save(coreDone)}>
              {coreDone ? "完成画像" : "先这样，使用通用模式"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
