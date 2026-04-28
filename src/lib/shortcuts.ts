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
  gradient: string;
  cardOpacity: number;
  fontFamily: string;
  cornerRadius: number;
  pagePadding: number;
  cardWidth: number;
  cardPadding: number;
  categoryGap: number;
  categoryHeaderGap: number;
  shortcutGap: number;
  tilePadding: number;
  tileMinWidth: number;
  iconBoxSize: number;
  iconSize: number;
  actionGap: number;
};

const defaultData: Data = {
  categories: [{ id: "default", name: "" }],
  shortcuts: [],
};

export const gradientOptions = [
  {
    id: "ember",
    name: "Ember",
    value: "linear-gradient(135deg, oklch(0.22 0.08 29), oklch(0.62 0.15 55), oklch(0.82 0.08 97))",
  },
  {
    id: "tidepool",
    name: "Tidepool",
    value:
      "linear-gradient(145deg, oklch(0.2 0.06 204), oklch(0.5 0.12 180), oklch(0.78 0.09 147))",
  },
  {
    id: "orchard",
    name: "Orchard",
    value:
      "linear-gradient(140deg, oklch(0.24 0.08 136), oklch(0.58 0.13 105), oklch(0.87 0.08 77))",
  },
  {
    id: "ink",
    name: "Ink",
    value:
      "linear-gradient(150deg, oklch(0.13 0.04 260), oklch(0.29 0.07 285), oklch(0.55 0.09 340))",
  },
  {
    id: "paper",
    name: "Paper",
    value: "linear-gradient(135deg, oklch(0.96 0.02 86), oklch(0.91 0.04 54), oklch(0.86 0.03 28))",
  },
];

export const fontOptions = [
  {
    id: "system",
    name: "System",
    value: "ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "serif",
    name: "Editorial",
    value: 'Georgia, "Times New Roman", serif',
  },
  {
    id: "rounded",
    name: "Rounded",
    value: '"Trebuchet MS", "Avenir Next", ui-sans-serif, sans-serif',
  },
  {
    id: "mono",
    name: "Mono",
    value: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  },
];

export const defaultPrefs: Prefs = {
  theme: "dark",
  gradient: gradientOptions[0].value,
  cardOpacity: 48,
  fontFamily: fontOptions[0].value,
  cornerRadius: 24,
  pagePadding: 24,
  cardWidth: 768,
  cardPadding: 32,
  categoryGap: 32,
  categoryHeaderGap: 16,
  shortcutGap: 4,
  tilePadding: 12,
  tileMinWidth: 80,
  iconBoxSize: 56,
  iconSize: 32,
  actionGap: 12,
};

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
    parsed.categories = parsed.categories.map((category: Category) =>
      category.id === "default" && category.name === "General"
        ? { ...category, name: "" }
        : category,
    );
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
