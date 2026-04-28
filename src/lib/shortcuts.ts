export type Shortcut = {
  id: string;
  url: string;
  name?: string;
  icon?: string; // custom icon data URL or URL
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
};

const STORAGE_KEY = "homepage-data-v1";
const PREFS_KEY = "homepage-prefs-v1";

export type Data = {
  categories: Category[];
  shortcuts: Shortcut[];
};

export type Prefs = {
  theme: "light" | "dark";
  background?: string; // URL or data URL
};

const defaultData: Data = {
  categories: [{ id: "default", name: "General" }],
  shortcuts: [],
};

const defaultPrefs: Prefs = { theme: "dark" };

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

export function savePrefs(p: Prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

export function domainName(url: string): string {
  try {
    const u = new URL(normalizeUrl(url));
    const host = u.hostname.replace(/^www\./, "");
    const base = host.split(".")[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "";
  }
}

export function loadData(): Data {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    if (!parsed.categories?.length) parsed.categories = defaultData.categories;
    return parsed;
  } catch {
    return defaultData;
  }
}

export function saveData(data: Data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function normalizeUrl(url: string): string {
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

export function getFaviconUrl(url: string): string {
  try {
    const u = new URL(normalizeUrl(url));
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
  } catch {
    return "";
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
