import { Palette, RotateCcw, X } from "lucide-react";
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

type SliderControl = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
};

function ControlGrid({ controls }: { controls: SliderControl[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {controls.map((control) => (
        <div key={control.label} className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-foreground">{control.label}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {control.value}
              {control.unit ?? "px"}
            </span>
          </div>
          <Slider
            value={[control.value]}
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            onValueChange={([value]) => control.onValueChange(value)}
          />
        </div>
      ))}
    </div>
  );
}

export function ThemeSettingsDialog({ open, prefs, onOpenChange, onChange }: Props) {
  const activeFont =
    fontOptions.find((font) => font.value === prefs.fontFamily)?.id || fontOptions[0].id;
  const spacingControls: SliderControl[] = [
    {
      label: "Page margin",
      value: prefs.pagePadding,
      min: 0,
      max: 80,
      onValueChange: (pagePadding) => onChange({ pagePadding }),
    },
    {
      label: "Card width",
      value: prefs.cardWidth,
      min: 360,
      max: 1120,
      step: 8,
      onValueChange: (cardWidth) => onChange({ cardWidth }),
    },
    {
      label: "Card padding",
      value: prefs.cardPadding,
      min: 0,
      max: 80,
      onValueChange: (cardPadding) => onChange({ cardPadding }),
    },
    {
      label: "Between categories",
      value: prefs.categoryGap,
      min: 0,
      max: 96,
      onValueChange: (categoryGap) => onChange({ categoryGap }),
    },
    {
      label: "Title to shortcuts",
      value: prefs.categoryHeaderGap,
      min: 0,
      max: 48,
      onValueChange: (categoryHeaderGap) => onChange({ categoryHeaderGap }),
    },
    {
      label: "Button offset",
      value: prefs.actionGap,
      min: 0,
      max: 48,
      onValueChange: (actionGap) => onChange({ actionGap }),
    },
  ];
  const shortcutControls: SliderControl[] = [
    {
      label: "Between shortcuts",
      value: prefs.shortcutGap,
      min: 0,
      max: 32,
      onValueChange: (shortcutGap) => onChange({ shortcutGap }),
    },
    {
      label: "Tile padding",
      value: prefs.tilePadding,
      min: 0,
      max: 32,
      onValueChange: (tilePadding) => onChange({ tilePadding }),
    },
    {
      label: "Tile width",
      value: prefs.tileMinWidth,
      min: 56,
      max: 160,
      onValueChange: (tileMinWidth) => onChange({ tileMinWidth }),
    },
    {
      label: "Icon box",
      value: prefs.iconBoxSize,
      min: 32,
      max: 96,
      onValueChange: (iconBoxSize) => onChange({ iconBoxSize }),
    },
    {
      label: "Icon size",
      value: prefs.iconSize,
      min: 16,
      max: 72,
      onValueChange: (iconSize) => onChange({ iconSize }),
    },
  ];

  if (!open) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[420px] flex-col border-l border-border bg-background/95 shadow-2xl backdrop-blur-xl"
      aria-label="Theme settings"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Palette className="h-4 w-4" />
            Theme settings
          </h2>
          <p className="sr-only">
            Adjust the homepage appearance, spacing, shortcut sizing, and layout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close theme settings"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-6 pb-6">
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

          <section className="space-y-4">
            <Label>Layout spacing</Label>
            <ControlGrid controls={spacingControls} />
          </section>

          <section className="space-y-4">
            <Label>Shortcut sizing</Label>
            <ControlGrid controls={shortcutControls} />
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
      </div>
    </aside>
  );
}
