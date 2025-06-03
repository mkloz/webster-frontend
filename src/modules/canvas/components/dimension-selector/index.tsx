'use client';

import type React from 'react';
import { type FC, useState } from 'react';

import { SizeInput } from '@/shared/components/common/size-input';

import { Button } from '../../../../shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../../shared/components/ui/dialog';
import { Separator } from '../../../../shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/components/ui/tabs';
import { CommonFormats } from './format-categories/common-formats';
import { PresentationFormats } from './format-categories/presentation-formats';
import { PrintFormats } from './format-categories/print-formats';
import { SocialMediaFormats } from './format-categories/social-media-formats';
import { VideoFormats } from './format-categories/video-formats';
import { getAspectRatio } from './utils';
interface DimensionSelectorProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  onSelect: (width: number, height: number) => void;
}

const TABS = ['custom', 'social', 'presentation', 'print', 'video'] as const;

export const DimensionSelector: FC<DimensionSelectorProps> = ({ width = 1920, height = 1080, children, onSelect }) => {
  const [widthInput, setWidthInput] = useState(width);
  const [heightInput, setHeightInput] = useState(height);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [customRatio, setCustomRatio] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectFormat = (formatName: string, formatWidth: number, formatHeight: number) => {
    setWidthInput(formatWidth);
    setHeightInput(formatHeight);
    setSelectedFormat(formatName);
    setCustomRatio(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] h-full max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Canvas Dimensions</DialogTitle>
          <DialogDescription>
            Select from predefined formats or enter custom dimensions for your project.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="custom" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-5 mb-1 rounded-full bg-muted sticky top-0 z-10 w-full">
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-y-auto flex-1 pr-1 scroll-container thin-scrollbar hover-show-scrollbar">
            <TabsContent value="custom" className="space-y-4 mt-0">
              <div className="grid grid-cols-3 gap-3">
                <CommonFormats selectedFormat={selectedFormat} onSelectFormat={selectFormat} />
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4 mt-0">
              <div className="grid grid-cols-3 gap-3">
                <SocialMediaFormats selectedFormat={selectedFormat} onSelectFormat={selectFormat} />
              </div>
            </TabsContent>

            <TabsContent value="presentation" className="space-y-4 mt-0">
              <div className="grid grid-cols-3 gap-3">
                <PresentationFormats selectedFormat={selectedFormat} onSelectFormat={selectFormat} />
              </div>
            </TabsContent>

            <TabsContent value="print" className="space-y-4 mt-0">
              <div className="grid grid-cols-3 gap-3">
                <PrintFormats selectedFormat={selectedFormat} onSelectFormat={selectFormat} />
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4 mt-0">
              <div className="grid grid-cols-3 gap-3">
                <VideoFormats selectedFormat={selectedFormat} onSelectFormat={selectFormat} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
        <Separator orientation="horizontal" />
        <div>
          <SizeInput
            value={{ width: widthInput, height: heightInput }}
            onChange={({ width, height }) => {
              setWidthInput(width);
              setHeightInput(height);
            }}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Ratio:</span>
                <span>{customRatio ? 'Custom' : getAspectRatio(widthInput, heightInput)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Size:</span>
                <span>
                  {widthInput || 0} × {heightInput || 0} px
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSelect(widthInput, heightInput);
                  setIsOpen(false);
                }}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
