import { useState, useEffect } from 'react';

export interface HistoryItem {
  id: string;
  input: string;
  timestamp: number;
}

export function useLocalHistory(key: string, limit = 5) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(`xn_history_${key}`);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    } else {
      setHistory([]);
    }
  }, [key]);

  const addHistory = (input: string) => {
    if (typeof window === 'undefined') return;
    if (!input || !input.trim()) return;
    
    setHistory((prev) => {
      // Don't duplicate the exact same input at the very top
      if (prev.length > 0 && prev[0].input === input) return prev;
      
      // Filter out any older duplicate of this input so we move it to the top
      const filtered = prev.filter(item => item.input !== input);
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 11),
        input,
        timestamp: Date.now()
      };
      const updated = [newItem, ...filtered].slice(0, limit);
      localStorage.setItem(`xn_history_${key}`, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`xn_history_${key}`);
    setHistory([]);
  };

  return { history, addHistory, clearHistory };
}
