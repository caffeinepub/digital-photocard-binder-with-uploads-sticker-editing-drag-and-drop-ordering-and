import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccentColor, type AccentColor } from '../../hooks/useAccentColor';
import { Palette } from 'lucide-react';

const ACCENT_OPTIONS: { value: AccentColor; label: string; preview: string }[] = [
  { value: 'default', label: 'Default / Off', preview: 'oklch(0.62 0.12 30)' },
  { value: 'coral', label: 'Coral', preview: 'oklch(0.65 0.15 25)' },
  { value: 'sage', label: 'Sage', preview: 'oklch(0.75 0.08 140)' },
  { value: 'lavender', label: 'Lavender', preview: 'oklch(0.70 0.12 280)' },
  { value: 'rose', label: 'Rose', preview: 'oklch(0.68 0.14 350)' },
  { value: 'teal', label: 'Teal', preview: 'oklch(0.72 0.10 190)' },
];

export default function AccentColorSelector() {
  const { accentColor, setAccentColor } = useAccentColor();

  return (
    <div className="flex items-center gap-2">
      <Palette className="w-4 h-4 text-binder-text-muted hidden sm:block" />
      <Select value={accentColor} onValueChange={(value) => setAccentColor(value as AccentColor)}>
        <SelectTrigger className="w-[140px] h-9 rounded-lg border border-binder-border bg-transparent text-binder-text text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-lg">
          {ACCENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-binder-border"
                  style={{ backgroundColor: option.preview }}
                />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
