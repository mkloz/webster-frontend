import { FileText, Presentation } from 'lucide-react';

import { FormatCard, type FormatOption } from '../format-card';

interface FormatCategoryProps {
  selectedFormat: string | null;
  onSelectFormat: (name: string, width: number, height: number) => void;
}

const FORMATS: FormatOption[] = [
  {
    name: '16:9 Widescreen',
    width: 1920,
    height: 1080,
    description: 'Standard presentation format',
    icon: <Presentation className="h-4 w-4" />
  },
  {
    name: '4:3 Standard',
    width: 1600,
    height: 1200,
    description: 'Traditional presentation format',
    icon: <Presentation className="h-4 w-4" />
  },
  {
    name: 'A4 Portrait',
    width: 2480,
    height: 3508,
    description: 'Standard document size',
    icon: <FileText className="h-4 w-4" />
  },
  {
    name: 'A4 Landscape',
    width: 3508,
    height: 2480,
    description: 'Landscape document size',
    icon: <FileText className="h-4 w-4" />
  }
];
export const PresentationFormats = ({ selectedFormat, onSelectFormat }: FormatCategoryProps) => {
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
