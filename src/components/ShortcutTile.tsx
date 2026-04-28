import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { type Shortcut, getFaviconUrl, normalizeUrl } from "@/lib/shortcuts";

type Props = {
  shortcut: Shortcut;
  onEdit: () => void;
  onDelete: () => void;
};

export function ShortcutTile({ shortcut, onEdit, onDelete }: Props) {
  const [imgError, setImgError] = useState(false);
  const icon = shortcut.icon || getFaviconUrl(shortcut.url);
  const href = normalizeUrl(shortcut.url);

  return (
    <div className="group relative">
      <a
        href={href}
        className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-accent"
      >
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
          {icon && !imgError ? (
            <img
              src={icon}
              alt=""
              className="h-8 w-8 object-contain grayscale"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-lg font-medium text-muted-foreground">
              {(shortcut.name || shortcut.url).charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {shortcut.name && (
          <span className="max-w-[90px] truncate text-xs text-foreground">
            {shortcut.name}
          </span>
        )}
      </a>
      <div className="absolute right-0 top-0 hidden gap-1 group-hover:flex">
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          className="rounded border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
          aria-label="Edit"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="rounded border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
          aria-label="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
