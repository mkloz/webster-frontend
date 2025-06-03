import { Film, MonitorSmartphone, Smartphone, Youtube } from 'lucide-react';

import { FormatCard, type FormatOption } from '../format-card';

interface FormatCategoryProps {
  selectedFormat: string | null;
  onSelectFormat: (name: string, width: number, height: number) => void;
}

const FORMATS: FormatOption[] = [
  {
    name: 'YouTube',
    width: 1920,
    height: 1080,
    description: 'Standard YouTube video thumbnail',
    icon: <Youtube className="h-4 w-4" />
  },
  {
    name: 'TikTok',
    width: 1080,
    height: 1920,
    description: 'Vertical format for TikTok videos',
    icon: <Smartphone className="h-4 w-4" />
  },
  {
    name: 'Twitch',
    width: 1920,
    height: 1080,
    description: 'Standard Twitch stream format',
    icon: <MonitorSmartphone className="h-4 w-4" />
  },
  {
    name: 'Cinema 21:9',
    width: 2560,
    height: 1080,
    description: 'Ultrawide cinematic format',
    icon: <Film className="h-4 w-4" />
  }
];

export const VideoFormats = ({ selectedFormat, onSelectFormat }: FormatCategoryProps) => {
  return (
    <>
      {FORMATS.map((format) => (
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
