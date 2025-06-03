'use client';

import { RefreshCwIcon } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { GrRedo, GrUndo } from 'react-icons/gr';

import { ConfirmModal } from '../../../shared/components/common/confirm-modal';
import { Button } from '../../../shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../shared/components/ui/tooltip';
import { useCanvasStore } from '../../../shared/store/canvas-store';
import { useShapesStore } from '../hooks/shapes-store';
import { useCanvasHistory } from '../hooks/use-canvas-history';
import { useCanvasReset } from '../hooks/use-canvas-reset';

export const CanvasHeader = () => {
  const { name, setName } = useCanvasStore();
  const { shapes } = useShapesStore();
  const { resetCanvas } = useCanvasReset();
  const { undo, redo, canUndo, canRedo, getHistoryInfo } = useCanvasHistory();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Local state to handle input value and prevent unwanted resets
  const [inputValue, setInputValue] = useState(name || 'Untitled Design');
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserTyping = useRef(false);

  const historyInfo = getHistoryInfo();
  const hasContent = shapes.length > 0;

  // Sync input value with store, but only when user is not actively typing
  useEffect(() => {
    if (!isUserTyping.current) {
      setInputValue(name || 'Untitled Design');
    }
  }, [name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setName(newValue);
  };

  const handleInputFocus = () => {
    isUserTyping.current = true;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isUserTyping.current = false;

    // Ensure name is never empty
    const trimmedValue = e.target.value.trim();
    if (!trimmedValue) {
      const defaultName = 'Untitled Design';
      setInputValue(defaultName);
      setName(defaultName);
    } else {
      setInputValue(trimmedValue);
      setName(trimmedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleResetClick = () => {
    // Check if there's content to reset
    if (hasContent) {
      setShowResetConfirm(true);
      return;
    }

    // No content, reset directly
    resetCanvas();
  };

  const handleConfirmReset = () => {
    resetCanvas();
    setShowResetConfirm(false);
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <>
      <div className="flex items-center justify-between absolute top-2 left-2 right-2 z-10">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="backdrop-blur-xl bg-canvas-background/80"
                onClick={undo}
                disabled={!canUndo}>
                <GrUndo />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Undo (Ctrl+Z) {historyInfo.current > 1 && `- ${historyInfo.current - 1}/${historyInfo.total}`}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="backdrop-blur-xl bg-canvas-background/80"
                onClick={redo}
                disabled={!canRedo}>
                <GrRedo />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Redo (Ctrl+Y) {canRedo && `- ${historyInfo.current + 1}/${historyInfo.total}`}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="relative mx-auto right-6">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="text-center text-lg font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1 text-foreground min-w-fit max-w-full "
          />
        </div>

        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="backdrop-blur-xl bg-canvas-background/80"
                onClick={handleResetClick}>
                <RefreshCwIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Reset Canvas</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={handleCancelReset}
        onConfirm={handleConfirmReset}
        title="Reset Canvas?"
        description="This will clear all shapes and content from the canvas. This action cannot be undone."
        confirmText="Reset Canvas"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};
