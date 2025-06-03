'use client';

import { Clock, CreditCard, FileImage, Mail } from 'lucide-react';

import { FormatCard, type FormatOption } from '../format-card';

interface FormatCategoryProps {
  selectedFormat: string | null;
  onSelectFormat: (name: string, width: number, height: number) => void;
}

const FORMATS: FormatOption[] = [
  {
    name: 'Business Card',
    width: 1050,
    height: 600,
    description: 'Standard business card (3.5" × 2")',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    name: 'Postcard',
    width: 1500,
    height: 1050,
    description: 'Standard postcard (5" × 3.5")',
    icon: <Mail className="h-4 w-4" />
  },
  {
    name: 'Poster',
    width: 2400,
    height: 3600,
    description: 'Standard poster (24" × 36")',
    icon: <FileImage className="h-4 w-4" />
  },
  {
    name: 'Flyer',
    width: 2550,
    height: 3300,
    description: 'Standard flyer (8.5" × 11")',
    icon: <Clock className="h-4 w-4" />
  }
];

export const PrintFormats = ({ selectedFormat, onSelectFormat }: FormatCategoryProps) => {
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
