/**
 * To-Do module
 * Add, complete, edit, delete, reorder, clear completed, optional due dates
 * Stored in chrome.storage.local
 */
'use strict';

const Todo = (() => {
  let todos = [];
  let dragSrcIndex = null;

  async function init() {
    const data = await Storage.getLocal(['todos']);
    todos = data.todos || [];
    render();
    _setupListeners();
  }

  function render() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';

    if (todos.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo-item';
      empty.style.justifyContent = 'center';
      empty.style.color = 'var(--text-tertiary)';
      empty.style.fontStyle = 'italic';
      empty.textContent = I18n.t('noTodos', 'No tasks yet');
      list.appendChild(empty);
      return;
    }

    todos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.setAttribute('draggable', 'true');
      li.setAttribute('data-index', index);
      li.setAttribute('role', 'listitem');

      // Checkbox
      const checkbox = document.createElement('button');
      checkbox.className = 'todo-checkbox' + (todo.completed ? ' checked' : '');
      checkbox.setAttribute('aria-label', todo.completed ? 'Mark incomplete' : 'Mark complete');
      checkbox.innerHTML = todo.completed ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : '';
      checkbox.addEventListener('click', () => _toggleComplete(index));

      // Text
      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = _sanitizeText(todo.text);

      li.appendChild(checkbox);
      li.appendChild(text);

      // Due date
      if (todo.dueDate) {
        const due = document.createElement('span');
        due.className = 'todo-due';
        const dueDate = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (dueDate < today && !todo.completed) {
          due.classList.add('overdue');
        }
        try {
          due.textContent = new Intl.DateTimeFormat(I18n.currentLang || 'en', {
            month: 'short', day: 'numeric'
          }).format(dueDate);
        } catch {
          due.textContent = todo.dueDate;
        }
        li.appendChild(due);
      }

      // Actions
      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'todo-action-btn';
      editBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.addEventListener('click', () => _editTodo(index));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'todo-action-btn delete';
      deleteBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.addEventListener('click', () => _deleteTodo(index));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);

      // Drag handlers
      li.addEventListener('dragstart', (e) => {
        dragSrcIndex = index;
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      li.addEventListener('dragenter', (e) => {
        e.preventDefault();
        li.classList.add('drag-over');
      });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        if (dragSrcIndex !== null && dragSrcIndex !== index) {
          const moved = todos.splice(dragSrcIndex, 1)[0];
          todos.splice(index, 0, moved);
          render();
          _save();
        }
      });
      li.addEventListener('dragend', () => {
        document.querySelectorAll('.todo-item').forEach(el => {
          el.classList.remove('dragging', 'drag-over');
        });
        dragSrcIndex = null;
      });

      list.appendChild(li);
    });
  }

  function _setupListeners() {
    const input = document.getElementById('todo-input');
    const dateInput = document.getElementById('todo-date');
    const addBtn = document.getElementById('btn-add-todo');
    const clearBtn = document.getElementById('btn-clear-completed');
    const todoBtn = document.getElementById('btn-todo');
    const panel = document.getElementById('todo-panel');

    addBtn.addEventListener('click', () => _addTodo());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') _addTodo();
    });

    clearBtn.addEventListener('click', () => {
      todos = todos.filter(t => !t.completed);
      render();
      _save();
    });

    // Toggle panel
    todoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      _closeAllPopovers();
      if (typeof Panels !== 'undefined') {
        Panels.toggle(panel, () => {
          input.focus();
        });
      } else {
        const isOpen = panel.style.display !== 'none';
        document.querySelectorAll('.side-panel, .settings-panel').forEach(p => p.style.display = 'none');
        if (!isOpen) {
          panel.style.display = '';
          input.focus();
        }
      }
    });

    panel.querySelector('[data-close]').addEventListener('click', () => {
      if (typeof Panels !== 'undefined') {
        Panels.close(panel);
      } else {
        panel.style.display = 'none';
      }
    });
  }

  function _addTodo() {
    const input = document.getElementById('todo-input');
    const dateInput = document.getElementById('todo-date');
    const text = input.value.trim();
    if (!text) return;

    todos.unshift({
      id: Date.now().toString(),
      text: text,
      completed: false,
      dueDate: dateInput.value || null,
      createdAt: new Date().toISOString(),
    });

    input.value = '';
    dateInput.value = '';
    render();
    _save();
  }

  function _toggleComplete(index) {
    todos[index].completed = !todos[index].completed;
    render();
    _save();
  }

  function _editTodo(index) {
    const newText = prompt('Edit task:', todos[index].text);
    if (newText !== null && newText.trim()) {
      todos[index].text = newText.trim();
      render();
      _save();
    }
  }

  function _deleteTodo(index) {
    todos.splice(index, 1);
    render();
    _save();
  }

  function _sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.textContent;
  }

  async function _save() {
    await Storage.setLocal({ todos });
  }

  return {
    init, render,
    get todos() { return todos; },
  };
})();
