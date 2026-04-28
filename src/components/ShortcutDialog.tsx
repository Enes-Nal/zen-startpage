import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { type Shortcut, type Category, uid, getFaviconUrl, domainName } from "@/lib/shortcuts";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categories: Category[];
  defaultCategoryId: string;
  initial?: Shortcut;
  onSave: (s: Shortcut) => void;
};

export function ShortcutDialog({
  open,
  onOpenChange,
  categories,
  defaultCategoryId,
  initial,
  onSave,
}: Props) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [autoName, setAutoName] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(initial?.url || "");
      setName(initial?.name || "");
      setIcon(initial?.icon || "");
      setCategoryId(initial?.categoryId || defaultCategoryId);
      setAutoName(false);
    }
  }, [open, initial, defaultCategoryId]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setIcon(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!url.trim()) return;
    let finalName = name.trim();
    if (!finalName && autoName) finalName = domainName(url);
    onSave({
      id: initial?.id || uid(),
      url: url.trim(),
      name: finalName || undefined,
      icon: icon.trim() || undefined,
      categoryId,
    });
    onOpenChange(false);
  };

  const previewIcon = icon || getFaviconUrl(url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit shortcut" : "Add shortcut"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={autoName}
                onCheckedChange={(v) => setAutoName(v === true)}
              />
              Auto-fill from domain if blank
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="Leave empty to show only icon"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-border bg-card">
                {previewIcon ? (
                  <img src={previewIcon} alt="" className="h-8 w-8 object-contain grayscale" />
                ) : (
                  <span className="text-xs text-muted-foreground">?</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  placeholder="Custom icon URL (or leave for auto-favicon)"
                  value={icon.startsWith("data:") ? "" : icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="text-xs text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
