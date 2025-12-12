import { countByType, makeId, randomColor } from './helpers.js';

const STORAGE_KEY = 'lab5-shapes';
const DEFAULT_STATE = { shapes: [] };

class Store {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadState();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(null, this.state);
    return () => this.subscribers.delete(callback);
  }

  getState() {
    return this.state;
  }

  getCounts() {
    return countByType(this.state.shapes);
  }

  addShape(type) {
    if (!['square', 'circle'].includes(type)) return;
    const newShape = {
      id: makeId('shape'),
      type,
      color: randomColor(),
    };
    this.updateState((prev) => ({
      ...prev,
      shapes: [...prev.shapes, newShape],
    }));
  }

  removeShape(id) {
    this.updateState((prev) => ({
      ...prev,
      shapes: prev.shapes.filter((shape) => shape.id !== id),
    }));
  }

  recolor(type) {
    if (!['square', 'circle'].includes(type)) return;
    this.updateState((prev) => ({
      ...prev,
      shapes: prev.shapes.map((shape) =>
        shape.type === type ? { ...shape, color: randomColor() } : shape
      ),
    }));
  }

  updateState(updater) {
    const prevState = this.state;
    const nextState = updater(prevState);
    this.state = nextState;
    this.persist();
    this.notify(prevState, nextState);
  }

  notify(prevState, nextState) {
    this.subscribers.forEach((callback) => callback(prevState, nextState));
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return { ...DEFAULT_STATE };
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed?.shapes)) return { ...DEFAULT_STATE };
      return { shapes: parsed.shapes };
    } catch (error) {
      console.warn('Nie udało się wczytać stanu, startuję z pustym.', error);
      return { ...DEFAULT_STATE };
    }
  }

  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}

export const store = new Store();
