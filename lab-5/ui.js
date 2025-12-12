import { store } from './store.js';

const shapesContainer = document.querySelector('[data-shapes]');
const emptyState = document.querySelector('[data-empty]');
const addButtons = document.querySelectorAll('[data-add]');
const recolorButtons = document.querySelectorAll('[data-recolor]');
const totalCountEl = document.querySelector('[data-count-total]');
const squareCountEl = document.querySelector('[data-count-square]');
const circleCountEl = document.querySelector('[data-count-circle]');

export function initUi() {
  addButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.add;
      store.addShape(type);
    });
  });

  recolorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.recolor;
      store.recolor(type);
    });
  });

  if (shapesContainer) {
    shapesContainer.addEventListener('click', handleShapeClick);
  }

  store.subscribe(handleStateChange);
}

function handleShapeClick(event) {
  const shapeEl = event.target.closest('[data-shape-id]');
  if (!shapeEl || !shapesContainer.contains(shapeEl)) return;
  const { shapeId } = shapeEl.dataset;
  if (shapeId) {
    store.removeShape(shapeId);
  }
}

function handleStateChange(prevState, nextState) {
  renderCounts();
  renderEmptyState(nextState);
  renderShapes(prevState, nextState);
}

function renderCounts() {
  const counts = store.getCounts();
  if (totalCountEl) totalCountEl.textContent = counts.total;
  if (squareCountEl) squareCountEl.textContent = counts.square;
  if (circleCountEl) circleCountEl.textContent = counts.circle;
}

function renderEmptyState(state) {
  if (!emptyState) return;
  emptyState.style.display = state.shapes.length === 0 ? 'grid' : 'none';
}

function renderShapes(prevState, nextState) {
  if (!shapesContainer) return;
  const prevShapes = prevState?.shapes ?? [];
  const nextShapes = nextState.shapes;

  if (!prevState) {
    shapesContainer.innerHTML = '';
    nextShapes.forEach((shape) => shapesContainer.append(createShapeElement(shape)));
    return;
  }

  const prevMap = new Map(prevShapes.map((shape) => [shape.id, shape]));
  const nextMap = new Map(nextShapes.map((shape) => [shape.id, shape]));

  prevShapes.forEach((shape) => {
    if (!nextMap.has(shape.id)) {
      const el = shapesContainer.querySelector(`[data-shape-id="${shape.id}"]`);
      if (el) el.remove();
    }
  });

  nextShapes.forEach((shape) => {
    const existing = prevMap.get(shape.id);
    if (!existing) {
      shapesContainer.append(createShapeElement(shape));
      return;
    }

    if (existing.color !== shape.color) {
      const el = shapesContainer.querySelector(`[data-shape-id="${shape.id}"]`);
      if (el) el.style.background = shape.color;
    }
  });
}

function createShapeElement(shape) {
  const element = document.createElement('div');
  element.className = 'shape';
  element.dataset.shapeId = shape.id;
  element.dataset.shapeType = shape.type;
  element.style.background = shape.color;

  const label = document.createElement('span');
  label.className = 'shape__label';
  label.textContent = shape.type === 'circle' ? 'Kółko' : 'Kwadrat';

  element.append(label);
  return element;
}
