'use client';

import { Cloud, CloudOff, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '../../../../modules/auth/queries/use-auth.query';
import { Shape, useShapesStore } from '../../../../modules/canvas/hooks/shapes-store';
import { useSelectedProjectId } from '../../../../modules/project/hooks/use-current-project';
import { cn } from '../../../lib/utils';
import { useCanvasStore } from '../../../store/canvas-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

export const ProjectStatusIndicator = () => {
  const user = useAuth();
  const { id } = useSelectedProjectId();
  const canvasName = useCanvasStore((state) => state.name);
  const canvasBackground = useCanvasStore((state) => state.background);
  const canvasWidth = useCanvasStore((state) => state.width);
  const canvasHeight = useCanvasStore((state) => state.height);
  const shapes = useShapesStore((state) => state.shapes);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [_, setLastSavedState] = useState<string | null>(null);

  // Create a hash of the current state to compare with saved state
  const getCurrentStateHash = () => {
    const currentState = {
      name: canvasName,
      background: canvasBackground,
      width: canvasWidth,
      height: canvasHeight,
      shapes: shapes.map((shape) => ({
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y,
        // Include other relevant properties for comparison
        size: shape.size,
        color: shape.color,
        text: shape.text,
        width: shape.width,
        height: shape.height
      }))
    };
    return JSON.stringify(currentState);
  };

  // Track changes to detect unsaved state
  useEffect(() => {
    const checkForChanges = () => {
      // Get current state hash
      const currentStateHash = getCurrentStateHash();

      // Get last saved state from localStorage
      const stored = localStorage.getItem('webster_current_project');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const storedTime = new Date(data.metadata.updatedAt);
          setLastSaveTime(storedTime);

          // Create hash of saved state for comparison
          const savedState = {
            name: data.canvas.name,
            background: data.canvas.background,
            width: data.canvas.width,
            height: data.canvas.height,
            shapes: data.shapes.map((shape: Shape) => ({
              id: shape.id,
              type: shape.type,
              x: shape.x,
              y: shape.y,
              size: shape.size,
              color: shape.color,
              text: shape.text,
              width: shape.width,
              height: shape.height
            }))
          };
          const savedStateHash = JSON.stringify(savedState);

          // Compare current state with saved state
          const hasChanges = currentStateHash !== savedStateHash;
          setHasUnsavedChanges(hasChanges);
          setLastSavedState(savedStateHash);
        } catch (e) {
          console.error('Failed to parse saved project:', e);
          // If we can't parse saved data, assume there are changes if we have content
          const hasContent = shapes.length > 0 || canvasName !== 'Untitled Design';
          setHasUnsavedChanges(hasContent);
        }
      } else {
        // No saved project - mark as unsaved if we have any content
        const hasContent = shapes.length > 0 || canvasName !== 'Untitled Design';
        setHasUnsavedChanges(hasContent);
        setLastSavedState(null);
      }
    };

    checkForChanges();
  }, [shapes, canvasName, canvasBackground, canvasWidth, canvasHeight]);

  // Listen for save events
  useEffect(() => {
    const handleSaveStart = () => setIsSaving(true);
    const handleSaveEnd = () => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      setLastSaveTime(new Date());
      // Update the last saved state to current state
      setLastSavedState(getCurrentStateHash());
    };

    // Listen for custom save events
    window.addEventListener('project-save-start', handleSaveStart);
    window.addEventListener('project-save-end', handleSaveEnd);

    return () => {
      window.removeEventListener('project-save-start', handleSaveStart);
      window.removeEventListener('project-save-end', handleSaveEnd);
    };
  }, []);

  const getStatusInfo = () => {
    if (isSaving) {
      return {
        icon: Loader2,
        text: 'Saving...',
        className: 'animate-spin',
        textColor: 'text-muted-foreground'
      };
    }

    if (!user.isLoggedIn) {
      return {
        icon: Save,
        text: 'Local only',
        className: '',
        textColor: 'text-muted-foreground'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: CloudOff,
        text: 'Unsaved',
        className: '',
        textColor: 'text-orange-600 dark:text-orange-400'
      };
    }

    if (id && lastSaveTime) {
      const timeAgo = getTimeAgo(lastSaveTime);
      return {
        icon: Cloud,
        text: `Saved ${timeAgo}`,
        className: '',
        textColor: 'text-muted-foreground'
      };
    }

    return {
      icon: Save,
      text: 'Not saved',
      className: '',
      textColor: 'text-muted-foreground'
    };
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
            <Icon className={cn('h-3.5 w-3.5', status.className, status.textColor)} />
            <span className={cn('text-xs font-medium', status.textColor)}>{status.text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-sm space-y-1">
            <div className="text-sm">
              {user.isLoggedIn ? (id ? 'Synced to cloud' : 'Local project only') : 'Sign in to sync to cloud'}
            </div>
            {lastSaveTime && <div className="text-xs">Last saved: {lastSaveTime.toLocaleString()}</div>}
            {hasUnsavedChanges && <div className="text-xs ">You have unsaved changes</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
