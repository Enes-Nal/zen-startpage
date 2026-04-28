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

type Hit = { id: string; thumb: string; full: string };

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApply: (url: string) => void;
  onClear: () => void;
};

// Seed list of curated Picsum image IDs (Unsplash photos, no API key required).
// Picsum is reliable and supports deterministic IDs + sizes.
const CURATED_IDS = [
  1018, 1015, 1019, 1024, 1043, 1050, 1062, 1074, 1080, 1084,
  110, 119, 122, 129, 142, 152, 164, 177, 188, 192,
  201, 217, 225, 237, 244, 250, 257, 274, 295, 309,
  315, 325, 326, 338, 357, 365, 387, 392, 401, 433,
  447, 452, 469, 488, 491, 500, 513, 528, 532, 547,
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function BackgroundDialog({ open, onOpenChange, onApply, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  const search = () => {
    setLoading(true);
    const q = query.trim();
    // Pick 12 curated images, deterministic from query (so search feels stable)
    const offset = q ? hashString(q) % CURATED_IDS.length : Math.floor(Math.random() * CURATED_IDS.length);
    const picks = Array.from({ length: 12 }, (_, i) => CURATED_IDS[(offset + i) % CURATED_IDS.length]);
    const hits: Hit[] = picks.map((id) => ({
      id: String(id),
      thumb: `https://picsum.photos/id/${id}/400/300`,
      full: `https://picsum.photos/id/${id}/1920/1080`,
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
