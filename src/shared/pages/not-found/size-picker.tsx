import { FC } from 'react';

interface SizePickerProps {
  size: number;
  setSize: (size: number) => void;
}

const SIZE_OPTIONS = [4, 8, 12, 16, 20, 24, 28, 32];

export const SizePicker: FC<SizePickerProps> = ({ size, setSize }) => {
  return (
    <div className="bg-background/80 backdrop-blur-sm rounded-full border border-border/40 shadow-md p-1 flex items-center">
      {SIZE_OPTIONS.map((sizeOption) => (
        <button
          key={sizeOption}
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            size === sizeOption ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
          onClick={() => setSize(sizeOption)}>
          <div className="rounded-full bg-foreground" style={{ width: sizeOption, height: sizeOption }} />
        </button>
      ))}
    </div>
  );
};
