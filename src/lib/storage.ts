import type { Store } from "../types";

const KEY = "firefly.store.v1";

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultStore(): Store {
  return {
    version: 1,
    seenWelcome: false,
    profile: {
      name: "",
      stage: "",
      interests: [],
      recent: "",
      comfort: "company",
      tone: "gentle",
      avoid: "",
      boundaries: "",
      completed: false,
    },
    vents: [],
    tree: {
      total: 0,
      lastDate: "",
      seed: Math.floor(Math.random() * 9000) + 1000,
      history: [],
    },
  };
}

function mergeStore(input: Partial<Store> | null | undefined): Store {
  const base = defaultStore();
  if (!input || typeof input !== "object") return base;
  return {
    ...base,
    ...input,
    profile: { ...base.profile, ...(input.profile ?? {}) },
    tree: { ...base.tree, ...(input.tree ?? {}) },
    vents: Array.isArray(input.vents) ? input.vents : [],
    version: 1,
  };
}

export function loadStore(): Store {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultStore();
    return mergeStore(JSON.parse(raw) as Partial<Store>);
  } catch {
    return defaultStore();
  }
}

export function saveStore(store: Store): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Storage can be unavailable in private mode; the app still works in memory.
  }
}

export function clearStore(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function exportStore(store: Store): string {
  return JSON.stringify(store, null, 2);
}

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateCN(date = new Date()): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function formatShortDate(key: string): string {
  const [, month, day] = key.split("-");
  return `${Number(month)} 月 ${Number(day)} 日`;
}

export function greeting(date = new Date()): { title: string; sub: string } {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) {
    return { title: "早上好。", sub: "今天不用一开始就很坚强。" };
  }
  if (hour >= 11 && hour < 18) {
    return { title: "下午好。", sub: "要不要先在这里歇一会儿？" };
  }
  if (hour >= 18 && hour < 24) {
    return { title: "晚上好。", sub: "今天辛苦了。" };
  }
  return { title: "这么晚还醒着。", sub: "这里有人。" };
}

export function growthStage(total: number): { index: number; name: string; next: number | null } {
  const thresholds = [0, 1, 4, 10, 20, 35, 60];
  const names = ["种子", "初芽", "抽枝", "含苞", "初花", "成荫", "萤火"];
  let index = 0;
  for (let i = 0; i < thresholds.length; i += 1) {
    if (total >= thresholds[i]) index = i;
  }
  return {
    index,
    name: names[index],
    next: index < thresholds.length - 1 ? thresholds[index + 1] - total : null,
  };
}
