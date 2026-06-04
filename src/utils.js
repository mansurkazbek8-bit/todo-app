// Date/time helpers
export function parseDate(str) {
  // DD.MM.YYYY or D.MM.YYYY
  const match = str.match(/^(\d{1,2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (isNaN(date)) return null;
  return date;
}

export function parseTime(str) {
  // HH:MM or H:MM
  const match = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, h, min] = match;
  if (Number(h) > 23 || Number(min) > 59) return null;
  return { h: Number(h), min: Number(min) };
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${hh}:${mm}`;
}

export function getDeadlineLabel(dateStr, timeStr) {
  if (!dateStr) return null;
  const parsed = parseDate(dateStr);
  if (!parsed) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let deadline;
  if (timeStr) {
    const t = parseTime(timeStr);
    if (t) {
      deadline = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), t.h, t.min);
    } else {
      deadline = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59);
    }
  } else {
    deadline = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59);
  }

  if (deadline < now) return { label: 'Просрочено', type: 'overdue' };

  const deadlineDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffDays = Math.round((deadlineDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Сегодня', type: 'today' };
  if (diffDays === 1) return { label: 'Завтра', type: 'tomorrow' };
  if (diffDays === 2) return { label: 'Послезавтра', type: 'soon' };
  
  const rem = diffDays % 10;
  let suffix = 'дней';
  if (rem === 1 && diffDays !== 11) suffix = 'день';
  else if (rem >= 2 && rem <= 4 && (diffDays < 10 || diffDays > 20)) suffix = 'дня';
  
  return { label: `Через ${diffDays} ${suffix}`, type: 'later' };
}

export function validateDateInput(val) {
  if (!val) return true;
  return /^(\d{1,2})\.(\d{2})\.(\d{4})$/.test(val);
}

export function validateTimeInput(val) {
  if (!val) return true;
  return /^(\d{1,2}):(\d{2})$/.test(val);
}

export function isDateNotPast(dateStr, timeStr) {
  const parsed = parseDate(dateStr);
  if (!parsed) return false;
  const now = new Date();
  let deadline;
  if (timeStr) {
    const t = parseTime(timeStr);
    if (t) {
      deadline = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), t.h, t.min);
    } else {
      deadline = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  } else {
    deadline = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return deadline >= now;
}

// Multi-word search: all words must match somewhere in the task
export function taskMatchesSearch(task, query) {
  if (!query.trim()) return true;
  const words = query.trim().toLowerCase().split(/\s+/);
  
  const fields = [
    task.title,
    task.date || '',
    task.time || '',
    ...(task.subtasks || []).map(s => s.text),
  ].map(f => f.toLowerCase());
  
  const allText = fields.join(' ');
  
  return words.every(word => allText.includes(word));
}

export function highlightText(text, query) {
  if (!query.trim()) return [{ text, highlight: false }];
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [{ text, highlight: false }];

  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts.map(part => ({
    text: part,
    highlight: pattern.test(part),
  }));
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
