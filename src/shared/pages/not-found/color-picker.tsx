import { FC } from 'react';

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
}

const COLOR_OPTIONS = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#3B82F6'];

export const ColorPicker: FC<ColorPickerProps> = ({ color, setColor }) => {
  return (
    <div className="bg-background/80 backdrop-blur-sm rounded-full border border-border/40 shadow-md p-1 flex items-center">
      {COLOR_OPTIONS.map((colorOption) => (
        <button
          key={colorOption}
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            color === colorOption ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
          onClick={() => setColor(colorOption)}>
          <div className="h-6 w-6 rounded-full" style={{ backgroundColor: colorOption }} />
        </button>
      ))}
    </div>
  );
};
