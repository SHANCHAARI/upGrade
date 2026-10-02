import { UndoAction } from './types';

export const MAX_UNDO_STACK_SIZE = 20;

type UndoListener = (state: { canUndo: boolean; canRedo: boolean; lastAction?: UndoAction }) => void;

class UndoManager {
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private listeners: Set<UndoListener> = new Set();
  private isExecuting = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  private handleKeyDown = async (e: KeyboardEvent) => {
    // Avoid triggering undo while typing inside an input or textarea
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }

    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        await this.redo();
      } else {
        await this.undo();
      }
    } else if (cmdOrCtrl && e.key.toLowerCase() === 'y' && !isMac) {
      // Windows Ctrl+Y redo
      e.preventDefault();
      await this.redo();
    }
  };

  public pushAction(action: UndoAction): void {
    this.undoStack.push(action);
    if (this.undoStack.length > MAX_UNDO_STACK_SIZE) {
      this.undoStack.shift(); // keep last 20 actions
    }
    // Any new action clears the redo stack
    this.redoStack = [];
    this.notify();
  }

  public async undo(): Promise<boolean> {
    if (this.isExecuting || this.undoStack.length === 0) return false;
    const action = this.undoStack.pop();
    if (!action) return false;

    this.isExecuting = true;
    try {
      await action.undo();
      this.redoStack.push(action);
      if (this.redoStack.length > MAX_UNDO_STACK_SIZE) {
        this.redoStack.shift();
      }
      return true;
    } catch (err) {
      console.error('Failed to execute undo action', err);
      return false;
    } finally {
      this.isExecuting = false;
      this.notify();
    }
  }

  public async redo(): Promise<boolean> {
    if (this.isExecuting || this.redoStack.length === 0) return false;
    const action = this.redoStack.pop();
    if (!action || !action.redo) return false;

    this.isExecuting = true;
    try {
      await action.redo();
      this.undoStack.push(action);
      return true;
    } catch (err) {
      console.error('Failed to execute redo action', err);
      return false;
    } finally {
      this.isExecuting = false;
      this.notify();
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getLastAction(): UndoAction | undefined {
    return this.undoStack[this.undoStack.length - 1];
  }

  public getUndoCount(): number {
    return this.undoStack.length;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  public subscribe(listener: UndoListener): () => void {
    this.listeners.add(listener);
    listener({
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      lastAction: this.getLastAction(),
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      lastAction: this.getLastAction(),
    };
    this.listeners.forEach((fn) => fn(state));
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    this.listeners.clear();
  }
}

export const undoManager = new UndoManager();
