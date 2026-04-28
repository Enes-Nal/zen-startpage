import { createFileRoute } from "@tanstack/react-router";
import { type CSSProperties, useEffect, useState } from "react";
import {
  Plus,
  FolderPlus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Sun,
  Moon,
  SlidersHorizontal,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  type Data,
  type Shortcut,
  type Category,
  type Prefs,
  loadData,
  saveData,
  loadPrefs,
  savePrefs,
  defaultPrefs,
  uid,
} from "@/lib/shortcuts";
import { ShortcutTile } from "@/components/ShortcutTile";
import { ShortcutDialog } from "@/components/ShortcutDialog";
import { CategoryDialog } from "@/components/CategoryDialog";
import { BackgroundDialog } from "@/components/BackgroundDialog";
import { ThemeSettingsDialog } from "@/components/ThemeSettingsDialog";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [data, setData] = useState<Data>({
    categories: [{ id: "default", name: "" }],
    shortcuts: [],
  });
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [hydrated, setHydrated] = useState(false);
  const [shortcutDialog, setShortcutDialog] = useState<{
    open: boolean;
    categoryId?: string;
    editing?: Shortcut;
  }>({ open: false });
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; editing?: Category }>({
    open: false,
  });
  const [bgDialog, setBgDialog] = useState(false);
  const [themeDialog, setThemeDialog] = useState(false);

  useEffect(() => {
    setData(loadData());
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveData(data);
  }, [data, hydrated]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", prefs.theme === "dark");
      document.documentElement.style.setProperty("--home-font-family", prefs.fontFamily);
    }
    if (hydrated) savePrefs(prefs);
  }, [prefs, hydrated]);

  const upsertShortcut = (s: Shortcut) => {
    setData((d) => {
      const exists = d.shortcuts.some((x) => x.id === s.id);
      return {
        ...d,
        shortcuts: exists ? d.shortcuts.map((x) => (x.id === s.id ? s : x)) : [...d.shortcuts, s],
      };
    });
  };

  const deleteShortcut = (id: string) => {
    setData((d) => ({ ...d, shortcuts: d.shortcuts.filter((s) => s.id !== id) }));
  };

  const addCategory = (name: string) => {
    setData((d) => ({ ...d, categories: [...d.categories, { id: uid(), name }] }));
  };

  const renameCategory = (id: string, name: string) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
  };

  const deleteCategory = (id: string) => {
    if (data.categories.length <= 1) return;
    setData((d) => ({
      categories: d.categories.filter((c) => c.id !== id),
      shortcuts: d.shortcuts.filter((s) => s.categoryId !== id),
    }));
  };

  const isDark = prefs.theme === "dark";
  const pageStyle = {
    backgroundImage: prefs.background
      ? `url(${prefs.background}), ${prefs.gradient}`
      : prefs.gradient,
    backgroundSize: prefs.background ? "cover, cover" : "cover",
    backgroundPosition: "center",
    "--home-radius": `${prefs.cornerRadius}px`,
    "--home-item-radius": `${Math.max(6, Math.round(prefs.cornerRadius * 0.45))}px`,
    "--home-page-padding": `${prefs.pagePadding}px`,
    "--home-card-width": `${prefs.cardWidth}px`,
    "--home-card-padding": `${prefs.cardPadding}px`,
    "--home-category-gap": `${prefs.categoryGap}px`,
    "--home-category-header-gap": `${prefs.categoryHeaderGap}px`,
    "--home-shortcut-gap": `${prefs.shortcutGap}px`,
    "--home-tile-padding": `${prefs.tilePadding}px`,
    "--home-tile-min-width": `${prefs.tileMinWidth}px`,
    "--home-icon-box-size": `${prefs.iconBoxSize}px`,
    "--home-icon-size": `${prefs.iconSize}px`,
    "--home-action-gap": `${prefs.actionGap}px`,
  } as CSSProperties;
  const cardStyle = {
    borderRadius: "var(--home-radius)",
    backgroundColor: isDark
      ? `rgb(0 0 0 / ${prefs.cardOpacity / 100})`
      : `rgb(255 255 255 / ${prefs.cardOpacity / 100})`,
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (categoryId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setData((d) => {
      const inCat = d.shortcuts.filter((s) => s.categoryId === categoryId);
      const others = d.shortcuts.filter((s) => s.categoryId !== categoryId);
      const oldIndex = inCat.findIndex((s) => s.id === active.id);
      const newIndex = inCat.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return d;
      const reordered = arrayMove(inCat, oldIndex, newIndex);
      return { ...d, shortcuts: [...others, ...reordered] };
    });
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-background bg-cover bg-center bg-no-repeat p-[var(--home-page-padding)]"
      style={pageStyle}
    >
      {/* subtle overlay for legibility when bg image present */}
      {prefs.background && <div className="absolute inset-0 bg-black/30" aria-hidden />}

      {/* Top-right toolbar */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setBgDialog(true)}
          className="rounded-md border border-border bg-card/70 p-2 text-foreground/80 backdrop-blur transition-colors hover:text-foreground"
          aria-label="Background"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setThemeDialog(true)}
          className="rounded-md border border-border bg-card/70 p-2 text-foreground/80 backdrop-blur transition-colors hover:text-foreground"
          aria-label="Theme settings"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPrefs((p) => ({ ...p, theme: isDark ? "light" : "dark" }))}
          className="rounded-md border border-border bg-card/70 p-2 text-foreground/80 backdrop-blur transition-colors hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative z-10 flex w-full max-w-[var(--home-card-width)] flex-col items-end gap-[var(--home-action-gap)]">
        {/* Centered card */}
        <div
          className="w-full border-2 border-border p-[var(--home-card-padding)] shadow-2xl backdrop-blur-xl"
          style={cardStyle}
        >
          <div className="space-y-[var(--home-category-gap)]">
            {data.categories.map((cat) => {
              const items = data.shortcuts.filter((s) => s.categoryId === cat.id);
              return (
                <section key={cat.id}>
                  <div className="group mb-[var(--home-category-header-gap)] flex items-center gap-3 border-b border-border/60 pb-2">
                    <h2 className="text-[10px] font-medium tracking-[0.25em] text-foreground uppercase">
                      {cat.name}
                    </h2>
                    <div className="hidden gap-2 group-hover:flex">
                      <button
                        onClick={() => setCategoryDialog({ open: true, editing: cat })}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Rename"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      {data.categories.length > 1 && (
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Delete category"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd(cat.id)}
                  >
                    <SortableContext items={items.map((s) => s.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(var(--home-tile-min-width),1fr))] gap-[var(--home-shortcut-gap)]">
                        {items.map((s) => (
                          <ShortcutTile
                            key={s.id}
                            shortcut={s}
                            onEdit={() => setShortcutDialog({ open: true, editing: s })}
                            onDelete={() => deleteShortcut(s.id)}
                          />
                        ))}
                        <button
                          onClick={() => setShortcutDialog({ open: true, categoryId: cat.id })}
                          className="flex flex-col items-center gap-2 rounded-[var(--home-item-radius)] p-[var(--home-tile-padding)] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                        >
                          <div className="flex h-[var(--home-icon-box-size)] w-[var(--home-icon-box-size)] items-center justify-center rounded-[var(--home-item-radius)] border border-dashed border-border">
                            <Plus className="h-4 w-4" />
                          </div>
                          <span className="text-[10px]">Add</span>
                        </button>
                      </div>
                    </SortableContext>
                  </DndContext>
                </section>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setCategoryDialog({ open: true })}
          className="flex items-center gap-2 rounded-md border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur transition-colors hover:text-foreground"
        >
          <FolderPlus className="h-4 w-4" />
          New category
        </button>
      </div>

      <ShortcutDialog
        open={shortcutDialog.open}
        onOpenChange={(o) => setShortcutDialog((s) => ({ ...s, open: o }))}
        categories={data.categories}
        defaultCategoryId={
          shortcutDialog.categoryId || shortcutDialog.editing?.categoryId || data.categories[0].id
        }
        initial={shortcutDialog.editing}
        onSave={upsertShortcut}
      />

      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(o) => setCategoryDialog((s) => ({ ...s, open: o }))}
        initialName={categoryDialog.editing?.name}
        onSave={(name) => {
          if (categoryDialog.editing) renameCategory(categoryDialog.editing.id, name);
          else addCategory(name);
        }}
      />

      <BackgroundDialog
        open={bgDialog}
        onOpenChange={setBgDialog}
        onApply={(url) => setPrefs((p) => ({ ...p, background: url }))}
        onClear={() => setPrefs((p) => ({ ...p, background: undefined }))}
      />

      <ThemeSettingsDialog
        open={themeDialog}
        prefs={prefs}
        onOpenChange={setThemeDialog}
        onChange={(next) => setPrefs((p) => ({ ...p, ...next }))}
      />
    </main>
  );
}
