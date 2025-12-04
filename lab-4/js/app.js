const STORAGE_KEY = 'lab4-kanban';
const columnOrder = ['todo', 'doing', 'done'];

const board = document.getElementById('board');

const initialState = () => ({
  columns: {
    todo: [],
    doing: [],
    done: [],
  },
});

let state = loadState();

renderAll();

board.addEventListener('click', handleClick);
board.addEventListener('input', handleEdit);

function handleClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const columnEl = button.closest('.column');
  if (!columnEl) return;

  const columnKey = columnEl.dataset.column;
  const action = button.dataset.action;

  const cardEl = button.closest('.card');
  const cardId = cardEl?.dataset.id;

  switch (action) {
    case 'add':
      addCard(columnKey);
      break;
    case 'color-column':
      recolorColumn(columnKey);
      break;
    case 'sort':
      sortColumn(columnKey);
      break;
    case 'delete':
      if (cardId) deleteCard(columnKey, cardId);
      break;
    case 'recolor':
      if (cardId) recolorCard(columnKey, cardId);
      break;
    case 'move-left':
      if (cardId) moveCard(cardId, columnKey, -1);
      break;
    case 'move-right':
      if (cardId) moveCard(cardId, columnKey, 1);
      break;
    default:
      break;
  }
}

function handleEdit(event) {
  const content = event.target.closest('.card__content');
  if (!content) return;

  const cardEl = content.closest('.card');
  const columnKey = cardEl?.closest('.column')?.dataset.column;
  const cardId = cardEl?.dataset.id;
  if (!columnKey || !cardId) return;

  const newText = content.textContent.trim() || 'Bez tytułu';
  const card = findCard(columnKey, cardId);
  if (card) {
    card.title = newText;
    saveState();
    const titleEl = cardEl.querySelector('.card__title');
    if (titleEl) titleEl.textContent = newText;
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState();
    const parsed = JSON.parse(saved);
    return {
      columns: {
        ...initialState().columns,
        ...parsed.columns,
      },
    };
  } catch (e) {
    console.warn('Nie udało się wczytać danych, tworzę nowy stan.', e);
    return initialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderAll() {
  columnOrder.forEach(renderColumn);
}

function renderColumn(columnKey) {
  const columnEl = board.querySelector(`[data-column="${columnKey}"]`);
  const cardsEl = columnEl.querySelector('[data-cards]');
  const countEl = columnEl.querySelector('[data-count]');

  cardsEl.innerHTML = '';
  state.columns[columnKey].forEach((card) => {
    cardsEl.append(createCardElement(card, columnKey));
  });

  countEl.textContent = state.columns[columnKey].length;
}

function createCardElement(card, columnKey) {
  const cardEl = document.createElement('article');
  cardEl.className = 'card';
  cardEl.dataset.id = card.id;
  cardEl.dataset.column = columnKey;
  cardEl.style.backgroundColor = card.color;

  const toolbar = document.createElement('div');
  toolbar.className = 'card__toolbar';

  const title = document.createElement('span');
  title.className = 'card__title';
  title.textContent = card.title;

  const toolbarBtns = document.createElement('div');
  toolbarBtns.className = 'card__actions';

  toolbarBtns.append(
    createButton('🎨', 'recolor', 'Nowy kolor karty'),
    createButton('✕', 'delete', 'Usuń kartę')
  );

  toolbar.append(title, toolbarBtns);

  const content = document.createElement('div');
  content.className = 'card__content';
  content.contentEditable = 'true';
  content.textContent = card.title;

  const moveBar = document.createElement('div');
  moveBar.className = 'card__actions';

  const leftBtn = createButton('←', 'move-left', 'Przenieś w lewo');
  if (columnKey === columnOrder[0]) leftBtn.disabled = true;
  const rightBtn = createButton('→', 'move-right', 'Przenieś w prawo');
  if (columnKey === columnOrder[columnOrder.length - 1]) rightBtn.disabled = true;

  moveBar.append(leftBtn, rightBtn);

  cardEl.append(toolbar, content, moveBar);
  return cardEl;
}

function createButton(label, action, title = '') {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.dataset.action = action;
  if (title) btn.title = title;
  return btn;
}

function addCard(columnKey) {
  const newCard = {
    id: makeId(),
    title: 'Nowa karta',
    color: randomColor(),
  };
  state.columns[columnKey].push(newCard);
  persist();
}

function deleteCard(columnKey, cardId, { silent = false } = {}) {
  state.columns[columnKey] = state.columns[columnKey].filter(
    (card) => card.id !== cardId
  );
  if (!silent) persist();
}

function moveCard(cardId, fromColumn, direction) {
  const fromIdx = columnOrder.indexOf(fromColumn);
  const toIdx = fromIdx + direction;
  const toColumn = columnOrder[toIdx];
  if (!toColumn) return;

  const card = findCard(fromColumn, cardId);
  if (!card) return;

  deleteCard(fromColumn, cardId, { silent: true });
  state.columns[toColumn].push(card);
  persist();
}

function recolorCard(columnKey, cardId) {
  const card = findCard(columnKey, cardId);
  if (!card) return;
  card.color = randomColor();
  persist();
}

function recolorColumn(columnKey) {
  state.columns[columnKey] = state.columns[columnKey].map((card) => ({
    ...card,
    color: randomColor(),
  }));
  persist();
}

function sortColumn(columnKey) {
  state.columns[columnKey].sort((a, b) =>
    a.title.localeCompare(b.title, 'pl', { sensitivity: 'base' })
  );
  persist();
}

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70;
  const lightness = 85;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `card-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function findCard(columnKey, cardId) {
  return state.columns[columnKey].find((card) => card.id === cardId);
}

function persist() {
  saveState();
  renderAll();
}
