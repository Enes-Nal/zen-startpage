import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, FolderPlus, Pencil, Trash2, Image as ImageIcon, Sun, Moon } from "lucide-react";
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
  uid,
} from "@/lib/shortcuts";
import { ShortcutTile } from "@/components/ShortcutTile";
import { ShortcutDialog } from "@/components/ShortcutDialog";
import { CategoryDialog } from "@/components/CategoryDialog";
import { BackgroundDialog } from "@/components/BackgroundDialog";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [data, setData] = useState<Data>({ categories: [{ id: "default", name: "General" }], shortcuts: [] });
  const [prefs, setPrefs] = useState<Prefs>({ theme: "dark" });
  const [hydrated, setHydrated] = useState(false);
  const [shortcutDialog, setShortcutDialog] = useState<{ open: boolean; categoryId?: string; editing?: Shortcut }>({ open: false });
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [bgDialog, setBgDialog] = useState(false);

  useEffect(() => {
    setData(loadData());
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveData(data);
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    savePrefs(prefs);
    document.documentElement.classList.toggle("dark", prefs.theme === "dark");
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

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-background bg-cover bg-center bg-no-repeat p-6"
      style={prefs.background ? { backgroundImage: `url(${prefs.background})` } : undefined}
    >
      {/* subtle overlay for legibility when bg image present */}
      {prefs.background && (
        <div className="absolute inset-0 bg-black/30" aria-hidden />
      )}

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
          onClick={() => setPrefs((p) => ({ ...p, theme: isDark ? "light" : "dark" }))}
          className="rounded-md border border-border bg-card/70 p-2 text-foreground/80 backdrop-blur transition-colors hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Centered card */}
      <div
        className={`relative z-10 w-full max-w-3xl rounded-2xl border-2 border-border p-8 shadow-2xl backdrop-blur-xl ${
          isDark ? "bg-black/40" : "bg-white/60"
        }`}
      >
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-xs font-medium tracking-[0.3em] text-foreground uppercase">
            Home
          </h1>
          <button
            onClick={() => setCategoryDialog({ open: true })}
            className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <FolderPlus className="h-4 w-4" />
            New category
          </button>
        </header>

        <div className="space-y-8">
          {data.categories.map((cat) => {
            const items = data.shortcuts.filter((s) => s.categoryId === cat.id);
            return (
              <section key={cat.id}>
                <div className="group mb-4 flex items-center gap-3 border-b border-border/60 pb-2">
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
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-1">
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
                    className="flex flex-col items-center gap-2 rounded-lg p-3 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-border">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-[10px]">Add</span>
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <ShortcutDialog
        open={shortcutDialog.open}
        onOpenChange={(o) => setShortcutDialog((s) => ({ ...s, open: o }))}
        categories={data.categories}
        defaultCategoryId={shortcutDialog.categoryId || shortcutDialog.editing?.categoryId || data.categories[0].id}
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
    </main>
  );
}
