import { useState, useEffect } from 'react';
import { useGetBinders, useUpdateBinderTheme } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BinderTheme } from '../backend';

interface BinderSettingsScreenProps {
  binderId: string;
  onBack: () => void;
}

export default function BinderSettingsScreen({ binderId, onBack }: BinderSettingsScreenProps) {
  const { data: binders = [] } = useGetBinders();
  const { mutate: updateTheme, isPending } = useUpdateBinderTheme();
  const binder = binders.find((b) => b.id === binderId);

  const [theme, setTheme] = useState<BinderTheme>({
    coverColor: '#F4E8D8',
    coverTexture: '/assets/generated/binder-cover-beige-texture.dim_2048x2048.png',
    pageBackground: '#FFF8F0',
    cardFrameStyle: 'solid',
    textColor: '#4A4A4A',
    accentColor: '#C89B7B',
    borderStyle: 'solid',
    backgroundPattern: '/assets/generated/binder-page-light-texture.dim_2048x2048.png',
  });

  useEffect(() => {
    if (binder) {
      setTheme(binder.theme);
    }
  }, [binder]);

  const handleSave = () => {
    updateTheme(
      { binderId, theme },
      {
        onSuccess: () => {
          onBack();
        },
      }
    );
  };

  if (!binder) {
    return (
      <div className="text-center py-16">
        <p className="text-binder-text-muted">Binder not found</p>
        <Button onClick={onBack} className="mt-4 rounded-xl bg-binder-accent hover:bg-binder-accent-hover">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={onBack}
          variant="outline"
          size="icon"
          className="rounded-lg border border-binder-border hover:border-binder-accent bg-transparent text-binder-text"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-4xl font-bold text-binder-text font-display">
            Customize Binder
          </h2>
          <p className="text-binder-text-muted">{binder.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border border-binder-border bg-binder-surface/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-binder-text">Theme Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-binder-text">Cover Color</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={theme.coverColor}
                  onChange={(e) => setTheme({ ...theme, coverColor: e.target.value })}
                  className="w-20 h-12 rounded-xl cursor-pointer bg-binder-surface border-binder-border"
                />
                <Input
                  type="text"
                  value={theme.coverColor}
                  onChange={(e) => setTheme({ ...theme, coverColor: e.target.value })}
                  className="flex-1 rounded-xl border border-binder-border bg-binder-surface text-binder-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-binder-text">Cover Texture</Label>
              <Select
                value={theme.coverTexture || 'none'}
                onValueChange={(value) =>
                  setTheme({ ...theme, coverTexture: value === 'none' ? undefined : value })
                }
              >
                <SelectTrigger className="rounded-xl border border-binder-border bg-binder-surface text-binder-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="/assets/generated/binder-cover-beige-texture.dim_2048x2048.png">
                    Beige Linen Texture
                  </SelectItem>
                  <SelectItem value="/assets/generated/binder-cover-texture.dim_2048x2048.png">
                    Light Texture
                  </SelectItem>
                  <SelectItem value="/assets/generated/binder-cover-dark-texture.dim_2048x2048.png">
                    Dark Texture
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-binder-text">Page Background</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={theme.pageBackground}
                  onChange={(e) => setTheme({ ...theme, pageBackground: e.target.value })}
                  className="w-20 h-12 rounded-xl cursor-pointer bg-binder-surface border-binder-border"
                />
                <Input
                  type="text"
                  value={theme.pageBackground}
                  onChange={(e) => setTheme({ ...theme, pageBackground: e.target.value })}
                  className="flex-1 rounded-xl border border-binder-border bg-binder-surface text-binder-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-binder-text">Page Pattern</Label>
              <Select
                value={theme.backgroundPattern || 'none'}
                onValueChange={(value) =>
                  setTheme({ ...theme, backgroundPattern: value === 'none' ? undefined : value })
                }
              >
                <SelectTrigger className="rounded-xl border border-binder-border bg-binder-surface text-binder-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="/assets/generated/binder-page-light-texture.dim_2048x2048.png">
                    Light Paper Texture
                  </SelectItem>
                  <SelectItem value="/assets/generated/page-paper-texture.dim_2048x2048.png">
                    Cream Paper Texture
                  </SelectItem>
                  <SelectItem value="/assets/generated/binder-page-dark-texture.dim_2048x2048.png">
                    Dark Paper Texture
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-binder-text">Card Frame Style</Label>
              <Select
                value={theme.cardFrameStyle}
                onValueChange={(value) => setTheme({ ...theme, cardFrameStyle: value })}
              >
                <SelectTrigger className="rounded-xl border border-binder-border bg-binder-surface text-binder-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="thick">Thick</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-binder-text">Accent Color</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="w-20 h-12 rounded-xl cursor-pointer bg-binder-surface border-binder-border"
                />
                <Input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="flex-1 rounded-xl border border-binder-border bg-binder-surface text-binder-text"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-binder-border bg-binder-surface/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-binder-text">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-2xl p-6 min-h-[400px] border-2"
              style={{
                backgroundColor: theme.pageBackground,
                borderColor: theme.accentColor,
                backgroundImage: theme.backgroundPattern ? `url(${theme.backgroundPattern})` : undefined,
                backgroundSize: 'cover',
              }}
            >
              <div
                className="w-32 h-48 bg-binder-card rounded-xl shadow-binder mx-auto"
                style={{
                  borderWidth: theme.cardFrameStyle === 'thick' ? '3px' : '2px',
                  borderStyle: theme.cardFrameStyle === 'dashed' ? 'dashed' : 'solid',
                  borderColor: theme.cardFrameStyle === 'none' ? 'transparent' : theme.accentColor,
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-xs text-binder-text-muted">
                  Card Preview
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 rounded-xl h-12 border border-binder-border bg-transparent text-binder-text hover:bg-binder-surface"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl h-12"
        >
          <Save className="w-5 h-5 mr-2" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
