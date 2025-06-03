import { useEffect, useState } from 'react';

export const usePanMode = () => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { signal });
    window.addEventListener('keyup', handleKeyUp, { signal });

    return () => {
      abortController.abort();
    };
  }, []);

  return {
    isPanMode: isSpacePressed,
    setPanMode: setIsSpacePressed
  };
};
