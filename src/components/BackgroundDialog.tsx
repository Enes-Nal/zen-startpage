import { useState } from "react";
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

type UnsplashHit = { id: string; thumb: string; full: string };

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApply: (url: string) => void;
  onClear: () => void;
};

export function BackgroundDialog({ open, onOpenChange, onApply, onClear }: Props) {
  const [query, setQuery] = useState("nature");
  const [results, setResults] = useState<UnsplashHit[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    // Use Unsplash Source — no API key needed. Generate variations.
    const q = encodeURIComponent(query.trim() || "nature");
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const hits = seeds.map((s) => ({
      id: `${q}-${s}`,
      thumb: `https://source.unsplash.com/400x300/?${q}&sig=${s}`,
      full: `https://source.unsplash.com/1920x1080/?${q}&sig=${s}`,
    }));
    setResults(hits);
    setLoading(false);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onApply(reader.result as string);
      onOpenChange(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Background</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload from your device</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
          <div className="space-y-2">
            <Label>Search Unsplash</Label>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="mountains, ocean, abstract..."
              />
              <Button onClick={search} disabled={loading}>
                Search
              </Button>
            </div>
            {results.length > 0 && (
              <div className="grid max-h-[320px] grid-cols-3 gap-2 overflow-y-auto pt-2">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onApply(r.full);
                      onOpenChange(false);
                    }}
                    className="aspect-video overflow-hidden rounded border border-border transition-opacity hover:opacity-80"
                  >
                    <img src={r.thumb} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="justify-between sm:justify-between">
          <Button variant="ghost" onClick={() => { onClear(); onOpenChange(false); }}>
            Remove background
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
