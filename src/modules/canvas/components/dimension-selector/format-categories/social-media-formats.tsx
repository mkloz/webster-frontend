import { Facebook, ImageIcon, Instagram, Linkedin, Twitter } from 'lucide-react';

import { FormatCard, type FormatOption } from '../format-card';

interface FormatCategoryProps {
  selectedFormat: string | null;
  onSelectFormat: (name: string, width: number, height: number) => void;
}

const FORMATS: FormatOption[] = [
  {
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    description: 'Square format for Instagram feed posts',
    icon: <Instagram className="h-4 w-4" />
  },
  {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    description: 'Vertical format for Instagram stories',
    icon: <Instagram className="h-4 w-4" />
  },
  {
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    description: 'Optimal size for Facebook feed posts',
    icon: <Facebook className="h-4 w-4" />
  },
  {
    name: 'Twitter Post',
    width: 1600,
    height: 900,
    description: 'Optimal size for Twitter image posts',
    icon: <Twitter className="h-4 w-4" />
  },
  {
    name: 'LinkedIn Post',
    width: 1200,
    height: 627,
    description: 'Optimal size for LinkedIn updates',
    icon: <Linkedin className="h-4 w-4" />
  },
  {
    name: 'Pinterest Pin',
    width: 1000,
    height: 1500,
    description: 'Vertical format for Pinterest pins',
    icon: <ImageIcon className="h-4 w-4" />
  }
];
export const SocialMediaFormats = ({ selectedFormat, onSelectFormat }: FormatCategoryProps) => {
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
