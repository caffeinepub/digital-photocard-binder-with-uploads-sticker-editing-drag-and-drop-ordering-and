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
    coverTexture: undefined,
    pageBackground: '#FFF8F0',
    cardFrameStyle: 'solid',
    textColor: '#3D3D3D',
    accentColor: '#E07A5F',
    borderStyle: 'solid',
    backgroundPattern: undefined,
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
        <p className="text-muted-foreground">Binder not found</p>
        <Button onClick={onBack} className="mt-4 rounded-xl">
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
          className="rounded-full border-2 border-sage/30 hover:border-coral"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-4xl font-bold text-charcoal font-handwriting">
            Customize Binder
          </h2>
          <p className="text-muted-foreground">{binder.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-handwriting">Theme Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Cover Color</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={theme.coverColor}
                  onChange={(e) => setTheme({ ...theme, coverColor: e.target.value })}
                  className="w-20 h-12 rounded-xl cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.coverColor}
                  onChange={(e) => setTheme({ ...theme, coverColor: e.target.value })}
                  className="flex-1 rounded-xl border-2 border-sage/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Texture</Label>
              <Select
                value={theme.coverTexture || 'none'}
                onValueChange={(value) =>
                  setTheme({ ...theme, coverTexture: value === 'none' ? undefined : value })
                }
              >
                <SelectTrigger className="rounded-xl border-2 border-sage/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="/assets/generated/binder-cover-texture.dim_2048x2048.png">
                    Textured
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Background</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={theme.pageBackground}
                  onChange={(e) => setTheme({ ...theme, pageBackground: e.target.value })}
                  className="w-20 h-12 rounded-xl cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.pageBackground}
                  onChange={(e) => setTheme({ ...theme, pageBackground: e.target.value })}
                  className="flex-1 rounded-xl border-2 border-sage/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Page Pattern</Label>
              <Select
                value={theme.backgroundPattern || 'none'}
                onValueChange={(value) =>
                  setTheme({ ...theme, backgroundPattern: value === 'none' ? undefined : value })
                }
              >
                <SelectTrigger className="rounded-xl border-2 border-sage/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="/assets/generated/page-paper-texture.dim_2048x2048.png">
                    Paper Texture
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Card Frame Style</Label>
              <Select
                value={theme.cardFrameStyle}
                onValueChange={(value) => setTheme({ ...theme, cardFrameStyle: value })}
              >
                <SelectTrigger className="rounded-xl border-2 border-sage/30">
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
              <Label>Accent Color</Label>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="w-20 h-12 rounded-xl cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="flex-1 rounded-xl border-2 border-sage/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-4 border-sage/20 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-handwriting">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-2xl p-6 min-h-[400px] border-4"
              style={{
                backgroundColor: theme.pageBackground,
                borderColor: theme.accentColor,
                backgroundImage: theme.backgroundPattern ? `url(${theme.backgroundPattern})` : undefined,
                backgroundSize: 'cover',
              }}
            >
              <div
                className="w-32 h-48 bg-white rounded-xl shadow-lg mx-auto"
                style={{
                  borderWidth: theme.cardFrameStyle === 'thick' ? '4px' : '2px',
                  borderStyle: theme.cardFrameStyle === 'dashed' ? 'dashed' : 'solid',
                  borderColor: theme.cardFrameStyle === 'none' ? 'transparent' : '#e5c5b5',
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
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
          className="flex-1 rounded-2xl h-12 border-2 border-sage/30"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 bg-coral hover:bg-coral-dark text-white rounded-2xl h-12"
        >
          <Save className="w-5 h-5 mr-2" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
