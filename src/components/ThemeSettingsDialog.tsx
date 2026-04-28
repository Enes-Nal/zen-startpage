import { Palette, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Prefs, fontOptions, gradientOptions } from "@/lib/shortcuts";

type Props = {
  open: boolean;
  prefs: Prefs;
  onOpenChange: (open: boolean) => void;
  onChange: (next: Partial<Prefs>) => void;
};

const defaultThemePrefs = {
  gradient: gradientOptions[0].value,
  cardOpacity: 48,
  fontFamily: fontOptions[0].value,
  cornerRadius: 24,
};

export function ThemeSettingsDialog({ open, prefs, onOpenChange, onChange }: Props) {
  const activeFont =
    fontOptions.find((font) => font.value === prefs.fontFamily)?.id || fontOptions[0].id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Adjust the homepage gradient, card opacity, font, and corner radius.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label>Gradient background</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(defaultThemePrefs)}
                className="gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {gradientOptions.map((gradient) => (
                <button
                  key={gradient.id}
                  type="button"
                  onClick={() => onChange({ gradient: gradient.value })}
                  className="group space-y-2 text-left"
                  aria-label={`Use ${gradient.name} gradient`}
                >
                  <span
                    className={`block aspect-[4/3] rounded-[calc(var(--radius)+6px)] border transition ${
                      prefs.gradient === gradient.value
                        ? "border-foreground ring-2 ring-ring"
                        : "border-border hover:border-foreground/50"
                    }`}
                    style={{ backgroundImage: gradient.value }}
                  />
                  <span className="block truncate text-[10px] text-muted-foreground group-hover:text-foreground">
                    {gradient.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label>Card transparency</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {prefs.cardOpacity}%
              </span>
            </div>
            <Slider
              value={[prefs.cardOpacity]}
              min={18}
              max={88}
              step={1}
              onValueChange={([cardOpacity]) => onChange({ cardOpacity })}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Font</Label>
              <Select
                value={activeFont}
                onValueChange={(id) => {
                  const font = fontOptions.find((option) => option.id === id);
                  if (font) onChange({ fontFamily: font.value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.id} value={font.id}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label>Corner roundness</Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {prefs.cornerRadius}px
                </span>
              </div>
              <Slider
                value={[prefs.cornerRadius]}
                min={0}
                max={42}
                step={1}
                onValueChange={([cornerRadius]) => onChange({ cornerRadius })}
              />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
