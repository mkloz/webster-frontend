import { Folder } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/shared/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { useAuth } from '../../../auth/queries/use-auth.query';
import { MyProjects } from './my-projects';
import { RecentProjects } from './recent-projects';
import { UploadProject } from './upload-project';

export const OpenProjectSheet = () => {
  const auth = useAuth();
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <Folder className="mr-2 h-4 w-4" />
          Open
        </Button>
      </DrawerTrigger>

      <DrawerContent className="min-w-[420px]">
        <DrawerHeader>
          <DrawerTitle>Open Project</DrawerTitle>
          <DrawerDescription>Browse your recent projects or upload a file.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 h-full grid overflow-auto">
          {auth.isLoggedIn ? (
            <Tabs defaultValue="recent" className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-2">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="grow ">
                <RecentProjects />
              </TabsContent>

              <TabsContent value="my-projects" className="grow">
                <MyProjects />
              </TabsContent>

              <TabsContent value="upload" className="grow">
                <UploadProject />
              </TabsContent>
            </Tabs>
          ) : (
            <UploadProject />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
