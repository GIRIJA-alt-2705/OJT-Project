// State
let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [
  { id: '1', title: 'Plan project structure', desc: 'Create initial folders and setup repo', status: 'done' },
  { id: '2', title: 'Design mockup', desc: 'Figma designs for the dashboard', status: 'in-progress' },
  { id: '3', title: 'Implement Drag and Drop', desc: 'Use HTML5 API to move tasks', status: 'todo' }
];

// DOM
const columns = document.querySelectorAll('.column');
const lists = {
  todo: document.querySelector('#todo .task-list'),
  'in-progress': document.querySelector('#in-progress .task-list'),
  done: document.querySelector('#done .task-list')
};
const counts = {
  todo: document.getElementById('count-todo'),
  'in-progress': document.getElementById('count-in-progress'),
  done: document.getElementById('count-done')
};

// Modal DOM
const modal = document.getElementById('task-modal');
const form = document.getElementById('task-form');
const addTaskBtn = document.getElementById('add-task-btn');
const closeBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');

// Form Inputs
const idInput = document.getElementById('task-id');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const statusInput = document.getElementById('task-column');
const modalTitle = document.getElementById('modal-title');

// Initialize
function init() {
  renderBoard();
  setupDragAndDrop();
}

// Generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Render entire board
function renderBoard() {
  // clear lists
  Object.values(lists).forEach(list => list.innerHTML = '');
  
  // Reset counts
  let countObj = { todo: 0, 'in-progress': 0, done: 0 };

  tasks.forEach(task => {
    const list = lists[task.status];
    if (list) {
      const el = createTaskElement(task);
      list.appendChild(el);
      countObj[task.status]++;
    }
  });

  // Update counts
  counts['todo'].textContent = countObj['todo'];
  counts['in-progress'].textContent = countObj['in-progress'];
  counts['done'].textContent = countObj['done'];

  saveTasks();
}

// Create Task DOM element
function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = 'task-card';
  div.draggable = true;
  div.dataset.id = task.id;

  div.innerHTML = `
    <div class="task-actions">
      <button class="action-btn btn-edit" onclick="openEditModal('${task.id}')" title="Edit">✏️</button>
      <button class="action-btn btn-del" onclick="deleteTask('${task.id}')" title="Delete">🗑️</button>
    </div>
    <div class="task-title">${task.title}</div>
    ${task.desc ? `<div class="task-desc">${task.desc}</div>` : ''}
  `;

  // Drag Events on the card
  div.addEventListener('dragstart', () => {
    div.classList.add('dragging');
  });

  div.addEventListener('dragend', () => {
    div.classList.remove('dragging');
  });

  return div;
}

// Setup Drag and Drop on Columns
function setupDragAndDrop() {
  columns.forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault(); // needed to allow drop
      column.classList.add('drag-over');
      
      const draggable = document.querySelector('.dragging');
      const list = column.querySelector('.task-list');
      
      // Optional: Insert logic for reordering within column
      // Currently appends to the end
      if(draggable && list) {
        list.appendChild(draggable);
      }
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });

    column.addEventListener('drop', e => {
      column.classList.remove('drag-over');
      const draggable = document.querySelector('.dragging');
      if (draggable) {
        const taskId = draggable.dataset.id;
        const newStatus = column.dataset.column;
        
        // Update state
        updateTaskStatus(taskId, newStatus);
      }
    });
  });
}

function updateTaskStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task && task.status !== newStatus) {
    task.status = newStatus;
    renderBoard(); // re-render to update counts
  }
}

function saveTasks() {
  localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
}

function deleteTask(id) {
  if (confirm('Delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    renderBoard();
  }
}

// Modal Logic
function openModal() {
  modal.classList.add('active');
  titleInput.focus();
}

function closeModal() {
  modal.classList.remove('active');
  form.reset();
  idInput.value = '';
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  modalTitle.textContent = 'Edit Task';
  idInput.value = task.id;
  titleInput.value = task.title;
  descInput.value = task.desc;
  statusInput.value = task.status;

  openModal();
}

// Events
addTaskBtn.addEventListener('click', () => {
  modalTitle.textContent = 'Create Task';
  openModal();
});

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

form.addEventListener('submit', e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const status = statusInput.value;
  const id = idInput.value;

  if (!title) return;

  if (id) {
    // Edit
    const task = tasks.find(t => t.id === id);
    task.title = title;
    task.desc = desc;
    task.status = status;
  } else {
    // Create
    tasks.push({
      id: generateId(),
      title,
      desc,
      status
    });
  }

  closeModal();
  renderBoard();
});

init();
