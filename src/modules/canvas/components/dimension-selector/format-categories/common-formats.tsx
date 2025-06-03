import { ImageIcon, Layout, Maximize, Monitor, Smartphone, Square } from 'lucide-react';

import { FormatCard, type FormatOption } from '../format-card';

const COMMON_FORMATS: FormatOption[] = [
  {
    name: 'Square',
    width: 1080,
    height: 1080,
    description: 'Perfect square format',
    icon: <Square className="h-4 w-4" />
  },
  {
    name: 'Widescreen',
    width: 1920,
    height: 1080,
    description: 'Standard widescreen format',
    icon: <Monitor className="h-4 w-4" />
  },
  {
    name: 'Standard',
    width: 1600,
    height: 1200,
    description: 'Traditional screen format',
    icon: <Layout className="h-4 w-4" />
  },
  {
    name: 'Photo',
    width: 1500,
    height: 1000,
    description: 'Classic photography format',
    icon: <ImageIcon className="h-4 w-4" />
  },
  {
    name: 'Vertical',
    width: 1080,
    height: 1920,
    description: 'Mobile-friendly vertical format',
    icon: <Smartphone className="h-4 w-4" />
  },
  {
    name: 'Panorama',
    width: 2000,
    height: 1000,
    description: 'Wide panoramic format',
    icon: <Maximize className="h-4 w-4" />
  }
];

interface FormatCategoryProps {
  selectedFormat: string | null;
  onSelectFormat: (name: string, width: number, height: number) => void;
}

export const CommonFormats = ({ selectedFormat, onSelectFormat }: FormatCategoryProps) => {
  return (
    <>
      {COMMON_FORMATS.map((format) => (
        <FormatCard
          key={format.name}
          format={format}
          isSelected={selectedFormat === format.name}
          onClick={() => onSelectFormat(format.name, format.width, format.height)}
        />
      ))}
    </>
  );
};
