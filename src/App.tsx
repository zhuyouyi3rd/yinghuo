import { useCallback, useEffect, useMemo, useState } from "react";
import type { Page, Profile, Store, VentEntry, Watering } from "./types";
import { clearStore, defaultStore, loadStore, saveStore, todayKey } from "./lib/storage";
import { Home } from "./pages/Home";
import { Vent } from "./pages/Vent";
import { TreePage } from "./pages/TreePage";
import { Me } from "./pages/Me";
import { ProfileModal } from "./components/ProfileModal";
import { Modal } from "./components/Modal";
import { Icon, type IconName } from "./components/Icon";

const PAGES: Page[] = ["home", "vent", "tree", "me"];

const NAV: { page: Page; label: string; icon: IconName }[] = [
  { page: "vent", label: "树洞", icon: "feather" },
  { page: "tree", label: "情绪树", icon: "tree" },
  { page: "me", label: "我的", icon: "user" },
];

function parseHash(): Page {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const first = raw.split("/")[0];
  return PAGES.includes(first as Page) ? (first as Page) : "home";
}

export function App() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const [route, setRoute] = useState<Page>(() => parseHash());
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }, []);

  const navigate = useCallback((page: Page) => {
    const hash = `#${page}`;
    if (window.location.hash === hash) {
      setRoute(page);
    } else {
      window.location.hash = hash;
    }
  }, []);

  const updateProfile = (profile: Profile) => {
    setStore((current) => ({ ...current, profile }));
    if (profile.completed) {
      showToast("我会记得你。下次回应会轻一点，也更像你。");
    } else {
      showToast("先使用通用关切模式。没有填完，也能被好好接住。");
    }
  };

  const addVent = (entry: VentEntry) => {
    setStore((current) => ({
      ...current,
      vents: [entry, ...current.vents].slice(0, 60),
    }));
  };

  const water = (watering: Watering) => {
    setStore((current) => {
      if (current.tree.lastDate === watering.date) return current;
      return {
        ...current,
        tree: {
          ...current.tree,
          total: current.tree.total + 1,
          lastDate: watering.date,
          history: [watering, ...current.tree.history].slice(0, 180),
        },
      };
    });
  };

  const resetAll = () => {
    clearStore();
    setStore(defaultStore());
    navigate("home");
    showToast("已经清空了。灯还在这里。");
  };

  const dismissWelcome = () => {
    setStore((current) => ({ ...current, seenWelcome: true }));
  };

  const page = route;
  const isHome = page === "home";
  const activeNav = NAV.some((item) => item.page === page) ? page : undefined;

  const content = useMemo(() => {
    switch (page) {
      case "vent":
        return (
          <Vent
            store={store}
            addVent={addVent}
            navigate={navigate}
            openProfile={() => setProfileOpen(true)}
            showToast={showToast}
          />
        );
      case "tree":
        return <TreePage tree={store.tree} water={water} showToast={showToast} />;
      case "me":
        return (
          <Me
            store={store}
            openProfile={() => setProfileOpen(true)}
            resetAll={resetAll}
            onDisablePersonalization={() => {
              setStore((current) => ({ ...current, profile: { ...current.profile, completed: false } }));
              showToast("已经切回通用关切模式。画像还在，随时可以再打开。");
            }}
            showToast={showToast}
          />
        );
      case "home":
      default:
        return <Home store={store} navigate={navigate} openProfile={() => setProfileOpen(true)} />;
    }
  }, [page, store, navigate, showToast]);

  return (
    <div className={`app ${isHome ? "is-home" : "is-inner"} ${scrolled ? "is-scrolled" : ""}`}>
      <header className={`site-header ${isHome ? "on-dark" : ""} ${scrolled ? "is-solid" : ""}`}>
        <button type="button" className="brand" onClick={() => navigate("home")} aria-label="回到首页">
          <span className="brand-mark">
            <span />
          </span>
          <span className="brand-text">
            <strong>萤火</strong>
            <small>FIREFLY</small>
          </span>
        </button>

        <nav className="site-nav" aria-label="主导航">
          {NAV.map((item) => (
            <button
              key={item.page}
              type="button"
              className={`nav-link ${activeNav === item.page ? "is-active" : ""}`}
              onClick={() => navigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="header-profile"
          onClick={() => setProfileOpen(true)}
          aria-label={store.profile.completed ? "查看画像" : "填写画像"}
        >
          {store.profile.completed && store.profile.name ? (
            <span>{store.profile.name.slice(0, 1)}</span>
          ) : (
            <Icon name="user" size={17} />
          )}
          <em>{store.profile.completed ? "我记得你" : "知心画像"}</em>
        </button>
      </header>

      <main className="app-main">{content}</main>

      <nav className="bottom-nav" aria-label="移动端导航">
        {NAV.map((item) => (
          <button
            key={item.page}
            type="button"
            className={`bottom-link ${activeNav === item.page ? "is-active" : ""}`}
            onClick={() => navigate(item.page)}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={store.profile}
        onSave={updateProfile}
      />

      <Modal
        open={!store.seenWelcome}
        onClose={dismissWelcome}
        label="欢迎来到萤火"
        className="welcome-modal"
      >
        <div className="welcome-orb">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">WELCOME TO FIREFLY</p>
        <h2>这里是一盏小灯。</h2>
        <p className="welcome-lead">
          萤火是一个 AI 情绪陪伴空间。它先接住情绪，再陪你慢慢往前走；不评判，也不急着给建议。
        </p>
        <div className="welcome-points">
          <div>
            <Icon name="shield" size={18} />
            <span>它是 AI，不是真人，也不是心理咨询师或医生。</span>
          </div>
          <div>
            <Icon name="leaf" size={18} />
            <span>你的倾诉、画像与树，默认只保存在这台设备。</span>
          </div>
          <div>
            <Icon name="heart" size={18} />
            <span>如果现在处于危险中，请先联系现实中的人，或拨打 12356 / 120 / 110。</span>
          </div>
        </div>
        <button type="button" className="btn btn-primary welcome-btn" onClick={dismissWelcome}>
          我知道了，进去坐坐
          <Icon name="arrow-right" size={16} />
        </button>
        <p className="welcome-foot">你可以随时跳过画像、只听不回，或删掉全部数据。</p>
      </Modal>

      <div className={`toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
