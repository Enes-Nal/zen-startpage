import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, FolderPlus, Pencil, Trash2 } from "lucide-react";
import {
  type Data,
  type Shortcut,
  type Category,
  loadData,
  saveData,
  uid,
} from "@/lib/shortcuts";
import { ShortcutTile } from "@/components/ShortcutTile";
import { ShortcutDialog } from "@/components/ShortcutDialog";
import { CategoryDialog } from "@/components/CategoryDialog";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [data, setData] = useState<Data>({ categories: [{ id: "default", name: "General" }], shortcuts: [] });
  const [hydrated, setHydrated] = useState(false);
  const [shortcutDialog, setShortcutDialog] = useState<{ open: boolean; categoryId?: string; editing?: Shortcut }>({ open: false });
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; editing?: Category }>({ open: false });

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveData(data);
  }, [data, hydrated]);

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

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-center justify-between">
          <h1 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
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

        <div className="space-y-12">
          {data.categories.map((cat) => {
            const items = data.shortcuts.filter((s) => s.categoryId === cat.id);
            return (
              <section key={cat.id}>
                <div className="group mb-4 flex items-center gap-3 border-b border-border pb-2">
                  <h2 className="text-xs font-medium tracking-widest text-foreground uppercase">
                    {cat.name}
                  </h2>
                  <div className="hidden gap-1 group-hover:flex">
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
                <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
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
                    className="flex flex-col items-center gap-2 rounded-lg p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-border">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-xs">Add</span>
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
    </main>
  );
}
