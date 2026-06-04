import { useState, useEffect } from 'react';
import { generateId } from './utils';

const STORAGE_KEY = 'ya-todo-tasks-v2';

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useStore() {
  const [tasks, setTasks] = useState(loadTasks);

  useEffect(() => { saveTasks(tasks); }, [tasks]);

  function addTask(data) {
    const task = {
      id: generateId(),
      title: data.title.trim(),
      date: data.date || '',
      time: data.time || '',
     subtasks: (data.subtasks || []).filter(s => s.text?.trim()).map(s => ({
  id: s.id || generateId(),
  text: s.text.trim(),
  done: s.done || false,
})),
      done: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [task, ...prev]);
    return task.id;
  }

  function updateTask(id, data) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        title: data.title.trim(),
        date: data.date || '',
        time: data.time || '',
        subtasks: (data.subtasks || []).map(s => {
          if (typeof s === 'string') return { id: generateId(), text: s.trim(), done: false };
          return s;
        }).filter(s => s.text.trim()),
      };
    }));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const hasUnfinishedSubs = (t.subtasks || []).some(s => !s.done);
      if (!t.done && hasUnfinishedSubs) return t; // blocked
      return { ...t, done: !t.done };
    }));
  }

  function toggleSubtask(taskId, subId) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s),
      };
    }));
  }

  return { tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask };
}
