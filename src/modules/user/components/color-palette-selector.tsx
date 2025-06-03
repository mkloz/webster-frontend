import { SCHEME_OPTIONS } from '@/shared/components/common/theme/color-palette-select';
import { cn } from '@/shared/lib/utils';
import { useColorScheme } from '@/shared/store/color-scheme.store';

export const ColorPaletteSelector = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold mb-2 text-foreground">Color Palette</h3>

      <div className="flex flex-wrap gap-2">
        {SCHEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={cn(
              'relative flex-1 min-w-[calc(33%-0.5rem)] aspect-square rounded-lg overflow-hidden transition-all',
              colorScheme === option.value
                ? 'ring-2 ring-primary shadow-md'
                : 'ring-1 ring-border hover:ring-primary/50'
            )}
            onClick={() => setColorScheme(option.value)}
            title={option.label}>
            <div
              className="absolute inset-0 bg-gradient-to-br"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${option.colors[0]}, ${option.colors[1]})`
              }}
            />

            {colorScheme === option.value && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-1 text-xs font-medium text-center">
              {option.label}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-1 text-xs text-muted-foreground">
        Select a color palette to customize the app&apos;s appearance
      </div>
    </div>
  );
};
