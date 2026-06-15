import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onExecute?: () => void;
  onCopy?: () => void;
}

export function useKeyboardShortcuts({ onExecute, onCopy }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModKey = event.ctrlKey || event.metaKey;
      
      // Ctrl/Cmd + Enter -> Execute
      if (isModKey && event.key === 'Enter') {
        if (onExecute) {
          event.preventDefault();
          onExecute();
        }
      }
      
      // Ctrl/Cmd + Shift + C -> Copy Output
      if (isModKey && event.shiftKey && (event.key === 'c' || event.key === 'C')) {
        if (onCopy) {
          event.preventDefault();
          onCopy();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExecute, onCopy]);
}
