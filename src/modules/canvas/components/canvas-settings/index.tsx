'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useCanvasStore } from '@/shared/store/canvas-store';

import { ExportTab } from './export-tab';
import { KeybindsTab } from './keybinds-tab';
import { SettingsTab } from './settings-tab';

export const CanvasSettings = () => {
  const [constrainProportions, setConstrainProportions] = useState(false);
  const { background, setBackground } = useCanvasStore();

  return (
    <div className="p-1 overflow-y-auto flex-1">
      <Tabs defaultValue="properties">
        <TabsList className="w-full rounded-full bg-muted">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="keybinds">Keybinds</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4 pt-4">
          <SettingsTab
            constrainProportions={constrainProportions}
            setConstrainProportions={setConstrainProportions}
            background={background}
            setBackground={setBackground}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-4 pt-4">
          <ExportTab />
        </TabsContent>

        <TabsContent value="keybinds" className="space-y-4 pt-4">
          <KeybindsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
