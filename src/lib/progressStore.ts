

type Listener = (progress: number) => void;

class ProgressStore {
  private value = 0;

  private listeners = new Set<Listener>();

  get(): number {
    return this.value;
  }

  set(next: number): void {
    this.value = next;
    for (const listener of this.listeners) listener(next);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const heroProgress = new ProgressStore();
