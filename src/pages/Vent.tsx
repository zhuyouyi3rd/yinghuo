import { useEffect, useRef, useState } from "react";
import type { ComfortMode, ComfortResult, Page, Store, VentEntry } from "../types";
import { buildComfort, suggestedEmotion } from "../lib/comfort";
import { formatShortDate, todayKey, uid } from "../lib/storage";
import { Icon } from "../components/Icon";

const MODES: { id: ComfortMode; title: string; copy: string }[] = [
  { id: "listen", title: "只听", copy: "不用回应，放下来就好" },
  { id: "soft", title: "轻回应", copy: "被接住，但不用聊太久" },
  { id: "stay", title: "陪我聊一会", copy: "想被陪着多说一会儿" },
];

export function Vent({
  store,
  addVent,
  navigate,
  openProfile,
  showToast,
}: {
  store: Store;
  addVent: (entry: VentEntry) => void;
  navigate: (page: Page, sub?: string) => void;
  openProfile: () => void;
  showToast: (message: string) => void;
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<ComfortMode>("soft");
  const [phase, setPhase] = useState<"edit" | "responding" | "done">("edit");
  const [result, setResult] = useState<ComfortResult | null>(null);
  const [streamed, setStreamed] = useState("");
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const recognitionRef = useRef<any>(null);
  const voiceBaseRef = useRef("");
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // no-op
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "responding" || !result) return;
    if (!result.text) {
      setPhase("done");
      return;
    }
    let index = 0;
    setStreamed("");
    const timer = window.setInterval(() => {
      index = Math.min(result.text.length, index + 2);
      setStreamed(result.text.slice(0, index));
      if (index >= result.text.length) {
        window.clearInterval(timer);
        setPhase("done");
      }
    }, 18);
    return () => window.clearInterval(timer);
  }, [phase, result]);

  const send = () => {
    const value = text.trim();
    if (!value) {
      showToast("先写一句也可以，哪怕只是“今天有点累”。");
      return;
    }
    const comfort = buildComfort(value, mode, store.profile);
    const entry: VentEntry = {
      id: uid(),
      text: value,
      mode,
      theme: comfort.theme,
      response: comfort.text,
      emotion: comfort.emotion,
      createdAt: Date.now(),
      safety: comfort.safety,
    };
    addVent(entry);
    setResult(comfort);
    setFeedback(null);
    setPhase("responding");
    window.setTimeout(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const reset = () => {
    setText("");
    setResult(null);
    setStreamed("");
    setFeedback(null);
    setPhase("edit");
    setListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      // no-op
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const Ctor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      showToast("这个浏览器暂时听不见，先用文字说也可以。");
      return;
    }
    try {
      const recognition = new Ctor();
      recognition.lang = "zh-CN";
      recognition.continuous = true;
      recognition.interimResults = true;
      voiceBaseRef.current = text ? `${text} ` : "";
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        setText(`${voiceBaseRef.current}${transcript}`.slice(0, 2000));
      };
      recognition.onerror = () => {
        setListening(false);
        showToast("麦克风没有打开。用键盘说也可以。");
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
      showToast("我在听。说完再点一下麦克风。");
    } catch {
      setListening(false);
      showToast("麦克风暂时不可用。用键盘说也可以。");
    }
  };

  const plant = () => {
    const emotion = result?.emotion ?? suggestedEmotion(text);
    try {
      sessionStorage.setItem("firefly.prefillEmotion", emotion);
    } catch {
      // no-op
    }
    navigate("tree");
  };

  const showResponse = phase !== "edit" && result;
  const latest = store.vents.slice(0, 3);

  return (
    <div className="page vent-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">THE HOLLOW</p>
          <h1>树洞</h1>
          <p className="page-sub">这里没有别人，也不用组织好语言。</p>
        </div>
        <div className="page-head-note">
          <Icon name="shield" size={16} />
          <span>默认私密 · 不会被转发</span>
        </div>
      </header>

      <div className="vent-layout">
        <section className="vent-compose">
          <div className="compose-paper">
            <div className="compose-top">
              <span className="ai-label">
                <span className="ai-dot" />
                AI 陪伴
              </span>
              <span className="compose-count">{text.length} / 2000</span>
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, 2000))}
              placeholder="你可以从任何一句话开始，哪怕只是“今天有点累”。"
              rows={8}
              disabled={phase !== "edit"}
              aria-label="写下你想说的话"
            />
            <div className={`voice-strip ${listening ? "is-listening" : ""}`}>
              <button
                type="button"
                className={`voice-button ${listening ? "is-on" : ""}`}
                onClick={toggleVoice}
                aria-label={listening ? "停止语音输入" : "开始语音输入"}
              >
                <Icon name="mic" size={18} />
                {listening ? "正在听…" : "语音输入"}
              </button>
              <div className="voice-bars" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} style={{ animationDelay: `${i * 70}ms` }} />
                ))}
              </div>
              <span className="voice-hint">{listening ? "说完再点一下" : "不方便打字，就说出来"}</span>
            </div>
            <div className="compose-actions">
              <span className="compose-note">语音只用于转写，默认为你删除音频。</span>
              <button type="button" className="btn btn-primary" onClick={send} disabled={phase !== "edit"}>
                <Icon name="send" size={16} />
                放到这里
              </button>
            </div>
          </div>

          <div className="mode-block">
            <div className="mode-head">
              <h3>你想被怎样听见？</h3>
              <span className="muted small">可以随时换</span>
            </div>
            <div className="mode-grid">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`mode-card ${mode === item.id ? "is-active" : ""}`}
                  onClick={() => setMode(item.id)}
                  disabled={phase !== "edit"}
                >
                  <span className="mode-radio" />
                  <strong>{item.title}</strong>
                  <small>{item.copy}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={`profile-invite ${store.profile.completed ? "is-done" : ""}`}>
            <div>
              <p className="eyebrow">ABOUT YOU</p>
              <h3>{store.profile.completed ? `我记得你，${store.profile.name || "朋友"}` : "想让我更懂你一点吗？"}</h3>
              <p>
                {store.profile.completed
                  ? `我会记得你喜欢${store.profile.interests[0] ?? "的那些小事"}，也会按你舒服的方式回应。`
                  : "大约 90 秒，可以跳过。不填也能被好好接住。"}
              </p>
            </div>
            <button type="button" className="text-link" onClick={openProfile}>
              {store.profile.completed ? "看看我记得的你" : "开始画像"}
              <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </section>

        <section className="vent-response" ref={responseRef}>
          <div className="response-sticky">
            <div className="response-head">
              <span className="eyebrow">A QUIET REPLY</span>
              <span className="response-status">
                {phase === "edit" ? "等你开口" : phase === "responding" ? "正在接住" : "说完了"}
              </span>
            </div>

            {!showResponse && (
              <div className="response-empty">
                <div className="empty-orbit">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>你说的话，会留在这里。</h3>
                <p>不评判，不转发，不急着给你一个答案。</p>
                <div className="empty-lines">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {showResponse && (
              <div className="response-stack">
                <div className="user-bubble">
                  <p>{text}</p>
                  <span>{formatShortDate(todayKey())} · 匿名</span>
                </div>

                {mode === "listen" ? (
                  <div className="listen-note">
                    <Icon name="heart" size={22} />
                    <h3>已经放在这里了。</h3>
                    <p>它不会被评判，也不会被转发。你不需要再说更多。</p>
                  </div>
                ) : (
                  <div className="ai-bubble">
                    <div className="ai-bubble-head">
                      <span className="ai-label">
                        <span className="ai-dot" />
                        AI 陪伴
                      </span>
                      <span className="muted tiny">
                        {store.profile.completed ? "按你舒服的方式" : "通用关切模式"}
                      </span>
                    </div>
                    <p>
                      {streamed}
                      {phase === "responding" && <span className="caret" />}
                    </p>
                    {phase === "done" && (
                      <div className="feedback-row">
                        <span>这句话让我</span>
                        <button
                          type="button"
                          className={`feedback ${feedback === "good" ? "is-active" : ""}`}
                          onClick={() => {
                            setFeedback("good");
                            showToast("谢谢。我会记住这种说法。");
                          }}
                        >
                          有点被接住
                        </button>
                        <button
                          type="button"
                          className={`feedback ${feedback === "bad" ? "is-active" : ""}`}
                          onClick={() => {
                            setFeedback("bad");
                            showToast("谢谢你告诉我。这句话我会重新想。");
                          }}
                        >
                          有点不舒服
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {result && result.safety !== "none" && (
                  <div className={`crisis-card ${result.safety === "high" ? "is-high" : ""}`}>
                    <div className="crisis-head">
                      <Icon name="shield" size={19} />
                      <strong>我很在意你现在的安全</strong>
                    </div>
                    <p>
                      如果你现在有具体的计划，或已经受伤，请立刻拨打 120 或 110，或去最近的急诊。
                      也可以拨打全国心理援助热线 12356。
                    </p>
                    <div className="crisis-actions">
                      <a href="tel:12356" className="btn btn-light btn-small">
                        拨打 12356
                      </a>
                      <a href="tel:120" className="btn btn-ghost btn-small">
                        120
                      </a>
                      <a href="tel:110" className="btn btn-ghost btn-small">
                        110
                      </a>
                    </div>
                  </div>
                )}

                <div className="response-actions">
                  <button type="button" className="btn btn-primary" onClick={plant}>
                    <Icon name="sprout" size={16} />
                    把它种进树里
                  </button>
                  <button type="button" className="text-link" onClick={reset}>
                    重新写
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {latest.length > 0 && (
        <section className="vent-history">
          <div className="section-head">
            <div>
              <p className="eyebrow">RECENTLY</p>
              <h2>最近放下的</h2>
            </div>
            <span className="muted small">只有你能看见</span>
          </div>
          <div className="history-list">
            {latest.map((entry) => (
              <article key={entry.id} className="history-item">
                <span className="history-date">{formatShortDate(todayKey(new Date(entry.createdAt)))}</span>
                <p>{entry.text}</p>
                <span className="history-mode">
                  {entry.mode === "listen" ? "只听" : entry.mode === "soft" ? "轻回应" : "陪我聊一会"}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
