'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SquarePlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';

import { useAuth } from '../../../../modules/auth/queries/use-auth.query';
import { DimensionSelector } from '../../../../modules/canvas/components/dimension-selector';
import { useShapesStore } from '../../../../modules/canvas/hooks/shapes-store';
import { useProjectCreate } from '../../../../modules/project/hooks/use-project-create';
import { getThemeBackground } from '../../../../modules/project/utils/default-shapes';
import { useCanvasStore } from '../../../store/canvas-store';
import { ColorPicker } from '../color-picker';
import { ConfirmModal } from '../confirm-modal';
import { SizeInput } from '../size-input';
import { ProjectPickerDialog } from './project-picker-dialog';

const DIMENSION_PRESETS = [
  { label: '16:9', width: 1920, height: 1080 },
  { label: '4:3', width: 1600, height: 1200 },
  { label: '1:1', width: 1080, height: 1080 },
  { label: '9:16', width: 1080, height: 1920 }
];

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  width: z.coerce.number().min(1, 'Width must be greater than 0'),
  height: z.coerce.number().min(1, 'Height must be greater than 0'),
  background: z.string().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid color format'),
  includeDefaultShapes: z.boolean()
});

export const NewProjectDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const { setName } = useCanvasStore();
  const { shapes } = useShapesStore();
  const { setBackground: setProjectBackground, setDimensions } = useCanvasStore();
  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    control,
    reset
  } = useForm({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: '',
      width: 1920,
      height: 1080,
      background: '#ffffff',
      includeDefaultShapes: true
    },
    mode: 'all'
  });
  const auth = useAuth();
  const values = useWatch({ control });
  const createProject = useProjectCreate(() => {
    setIsOpen(false);
    reset();
  });

  const hasUnsavedWork = shapes.length > 0;

  // Set theme-based background color on mount
  useEffect(() => {
    const themeBackground = getThemeBackground();
    setValue('background', themeBackground);
  }, [setValue]);

  const handleCreateProject = (data: z.infer<typeof CreateProjectSchema>) => {
    // Check if there's unsaved work
    if (hasUnsavedWork) {
      setShowCreateConfirm(true);
      return;
    }

    // No unsaved work, create directly
    executeCreate(data);
  };

  const executeCreate = (data: z.infer<typeof CreateProjectSchema>) => {
    setName(data.name);
    setDimensions(data.width, data.height);
    setProjectBackground(data.background);

    // Pass all parameters as a single object
    createProject.mutateAsync({
      projectName: data.name,
      includeDefaultShapes: data.includeDefaultShapes,
      canvasWidth: data.width,
      canvasHeight: data.height
    });
  };

  const handleConfirmCreate = () => {
    const data = values as z.infer<typeof CreateProjectSchema>;
    executeCreate(data);
    setShowCreateConfirm(false);
  };

  const handleCancelCreate = () => {
    setShowCreateConfirm(false);
  };

  const onSubmit = (data: z.infer<typeof CreateProjectSchema>) => {
    handleCreateProject(data);
  };

  const setSize = useCallback(
    async (width: number, height: number) => {
      setValue('width', width);
      setValue('height', height);
    },
    [setValue]
  );

  const handleCreateBasedOnProject = () => {
    setIsProjectPickerOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <SquarePlus />
            New
          </Button>
        </DialogTrigger>
        <DialogContent className="w-125">
          <form onSubmit={handleSubmit(onSubmit)} className="gap-4 grid">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Set up your new project with a name, dimensions, and background.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(e) => setValue('name', e.target.value, { shouldValidate: true })}
                  placeholder="My Awesome Design"
                  errorMessage={errors.name?.message}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label>Canvas Size</Label>
                  <DimensionSelector
                    key={'new-project-dimention-selector'}
                    width={values.width}
                    height={values.height}
                    onSelect={setSize}>
                    <Button variant="link" size="sm" type="button">
                      Choose from templates
                    </Button>
                  </DimensionSelector>
                </div>
                <SizeInput
                  value={{ width: values.width || 1920, height: values.height || 1080 }}
                  onChange={(size) => setSize(size.width, size.height)}
                />
                {errors.width && <p className="text-sm text-red-600">{errors.width.message}</p>}
                {errors.height && <p className="text-sm text-red-600">{errors.height.message}</p>}
                <div className="flex gap-2 mt-2">
                  {DIMENSION_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      className="grow"
                      type="button"
                      size="sm"
                      onClick={() => setSize(preset.width, preset.height)}>
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Background</Label>
                <ColorPicker
                  value={values.background || '#FFF8E7'}
                  onChange={(color) => setValue('background', color)}
                />
                {errors.background && <p className="text-sm text-red-600">{errors.background.message}</p>}
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-shapes">Include starter shapes</Label>
                  <p className="text-sm text-muted-foreground">Add welcome text and sample shapes to get started</p>
                </div>
                <Switch
                  id="include-shapes"
                  checked={values.includeDefaultShapes}
                  onCheckedChange={(checked) => setValue('includeDefaultShapes', checked)}
                />
              </div>
            </div>
            <Separator />
            <DialogFooter>
              {auth.isLoggedIn && (
                <Button variant="outline" type="button" onClick={handleCreateBasedOnProject}>
                  Create based on other project
                </Button>
              )}
              <Button type="submit" className="ml-auto" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ProjectPickerDialog
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        onProjectSelect={() => {
          setIsProjectPickerOpen(false);
          setIsOpen(false);
          reset();
        }}
      />

      <ConfirmModal
        isOpen={showCreateConfirm}
        onClose={handleCancelCreate}
        onConfirm={handleConfirmCreate}
        title="Create New Project?"
        description="Any unsaved changes to your current project will be lost. Are you sure you want to continue?"
        confirmText="Create Project"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};
