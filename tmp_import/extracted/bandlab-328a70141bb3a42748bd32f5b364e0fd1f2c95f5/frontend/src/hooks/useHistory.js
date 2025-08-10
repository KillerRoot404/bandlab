import { useRef } from 'react';

// Simple undo/redo stack for UI state (non-destructive, frontend-only)
// Stores shallow snapshots provided by caller. Caller must pass applyState(snapshot).
export const useHistory = (max = 50) => {
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const push = (snapshot) => {
    undoStack.current.push(snapshot);
    if (undoStack.current.length > max) undoStack.current.shift();
    // clear redo on new action
    redoStack.current = [];
  };

  const canUndo = () => undoStack.current.length > 0;
  const canRedo = () => redoStack.current.length > 0;

  const undo = (apply) => {
    if (!canUndo()) return false;
    const snap = undoStack.current.pop();
    redoStack.current.push(snap);
    if (apply) apply(snap);
    return true;
  };
  const redo = (apply) => {
    if (!canRedo()) return false;
    const snap = redoStack.current.pop();
    undoStack.current.push(snap);
    if (apply) apply(snap);
    return true;
  };

  return { push, undo, redo, canUndo, canRedo };
};
