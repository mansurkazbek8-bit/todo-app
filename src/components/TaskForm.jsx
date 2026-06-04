import { useState, useEffect, useRef } from 'react';
import { Plus, X, Calendar, Clock, ChevronDown } from 'lucide-react';
import { parseDate, parseTime, isDateNotPast, generateId } from '../utils';

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    animation: 'fadeIn 0.18s ease',
  },
  modal: {
    background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'slideDown 0.2s cubic-bezier(0.4,0,0.2,1)',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  },
  header: {
    padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  title: { fontSize: '18px', fontWeight: '600', color: '#1a1a1a' },
  closeBtn: {
    width: '32px', height: '32px', borderRadius: '50%', border: 'none',
    background: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s', color: '#666',
  },
  body: { padding: '16px 24px 20px', overflowY: 'auto', flex: 1 },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#6b6a69', marginBottom: '6px' },
  input: {
    width: '100%', border: '1.5px solid #e6e6e6', borderRadius: '10px', padding: '10px 14px',
    fontSize: '15px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit', color: '#1a1a1a', background: '#fff',
  },
  inputError: { borderColor: '#fc3f1d', background: '#fff8f7' },
  errorMsg: { fontSize: '12px', color: '#fc3f1d', marginTop: '4px' },
  row: { display: 'flex', gap: '12px' },
  subtaskList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' },
  subtaskRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  subtaskInput: {
    flex: 1, border: '1.5px solid #e6e6e6', borderRadius: '10px', padding: '9px 12px',
    fontSize: '14px', outline: 'none', transition: 'border-color 0.15s', fontFamily: 'inherit',
  },
  removeBtn: {
    width: '30px', height: '30px', border: 'none', background: 'transparent',
    cursor: 'pointer', color: '#999', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.15s, background 0.15s', flexShrink: 0,
  },
  addSubBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
    color: '#0078ff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: '6px 0',
    fontFamily: 'inherit', transition: 'opacity 0.15s',
  },
  footer: {
    padding: '12px 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end',
    borderTop: '1px solid #f0f0f0',
  },
  cancelBtn: {
    padding: '10px 20px', border: '1.5px solid #e6e6e6', borderRadius: '10px',
    background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
    color: '#6b6a69', transition: 'background 0.15s', fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '10px 24px', border: 'none', borderRadius: '10px',
    background: '#fc3f1d', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    color: '#fff', transition: 'background 0.15s, transform 0.1s', fontFamily: 'inherit',
  },
};

export default function TaskForm({ onClose, onSubmit, initial }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initial?.date || '');
  const [time, setTime] = useState(initial?.time || '');
  const [subtasks, setSubtasks] = useState(
    initial?.subtasks?.length ? initial.subtasks.map(s => ({ id: s.id, text: s.text, done: s.done }))
    : []
  );
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const titleRef = useRef();

  useEffect(() => { titleRef.current?.focus(); }, []);

  function validateDateFormat(val) {
    if (!val) return true;
    return /^(\d{1,2})\.(\d{2})\.(\d{4})$/.test(val);
  }
  function validateTimeFormat(val) {
    if (!val) return true;
    return /^(\d{1,2}):(\d{2})$/.test(val);
  }

  function validate() {
    const errs = {};
    if (!title.trim()) errs.title = 'Введите название задачи';
    if (date && !validateDateFormat(date)) errs.date = 'Формат: ДД.ММ.ГГГГ';
    else if (date && !parseDate(date)) errs.date = 'Некорректная дата';
    else if (date && !isDateNotPast(date, time)) errs.date = 'Дата не может быть в прошлом';
    if (time && !validateTimeFormat(time)) errs.time = 'Формат: ЧЧ:ММ';
    else if (time && !parseTime(time)) errs.time = 'Некорректное время';
    if (time && !date) errs.date = 'Укажите дату';
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onSubmit({ title, date, time, subtasks });
  }

  function addSub() {
    setSubtasks(prev => [...prev, { id: generateId(), text: '', done: false }]);
  }
  function removeSub(id) {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  }
  function updateSub(id, text) {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  }

  function handleKey(e) {
    if (e.key === 'Escape') onClose();
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()} onKeyDown={handleKey}>
      <div style={{ ...styles.modal, ...(shake ? { animation: 'shake 0.4s ease' } : {}) }}>
        <div style={styles.header}>
          <span style={styles.title}>{initial ? 'Редактировать задачу' : 'Новая задача'}</span>
          <button style={styles.closeBtn} onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = '#e6e6e6'}
            onMouseLeave={e => e.currentTarget.style.background = '#f0f0f0'}>
            <X size={16} />
          </button>
        </div>
        <div style={styles.body}>
          {/* Title */}
          <div style={styles.field}>
            <label style={styles.label}>Название задачи *</label>
            <input
              ref={titleRef}
              style={{ ...styles.input, ...(errors.title ? styles.inputError : {}) }}
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(p => ({...p, title: ''})); }}
              placeholder="Например: Подготовиться к экзамену по математике"
              onFocus={e => e.target.style.borderColor = errors.title ? '#fc3f1d' : '#0078ff'}
              onBlur={e => e.target.style.borderColor = errors.title ? '#fc3f1d' : '#e6e6e6'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {errors.title && <div style={styles.errorMsg}>{errors.title}</div>}
          </div>

          {/* Date & Time */}
          <div style={{ ...styles.row, ...styles.field }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}><Calendar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Дата</label>
              <input
                style={{ ...styles.input, ...(errors.date ? styles.inputError : {}) }}
                value={date}
                onChange={e => { setDate(e.target.value); setErrors(p => ({...p, date: ''})); }}
                placeholder="ДД.ММ.ГГГГ"
                onFocus={e => e.target.style.borderColor = errors.date ? '#fc3f1d' : '#0078ff'}
                onBlur={e => e.target.style.borderColor = errors.date ? '#fc3f1d' : '#e6e6e6'}
              />
              {errors.date && <div style={styles.errorMsg}>{errors.date}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}><Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Время</label>
              <input
                style={{ ...styles.input, ...(errors.time ? styles.inputError : {}) }}
                value={time}
                onChange={e => { setTime(e.target.value); setErrors(p => ({...p, time: ''})); }}
                placeholder="ЧЧ:ММ"
                onFocus={e => e.target.style.borderColor = errors.time ? '#fc3f1d' : '#0078ff'}
                onBlur={e => e.target.style.borderColor = errors.time ? '#fc3f1d' : '#e6e6e6'}
              />
              {errors.time && <div style={styles.errorMsg}>{errors.time}</div>}
            </div>
          </div>

          {/* Subtasks */}
          <div style={styles.field}>
            <label style={styles.label}>Подзадачи</label>
            {subtasks.length > 0 && (
              <div style={styles.subtaskList}>
                {subtasks.map((s, i) => (
                  <div key={s.id} style={styles.subtaskRow}>
                    <span style={{ color: '#999', fontSize: '13px', width: '18px', textAlign: 'right', flexShrink: 0 }}>{i+1}.</span>
                    <input
                      style={styles.subtaskInput}
                      value={s.text}
                      onChange={e => updateSub(s.id, e.target.value)}
                      placeholder="Название подзадачи"
                      onFocus={e => e.target.style.borderColor = '#0078ff'}
                      onBlur={e => e.target.style.borderColor = '#e6e6e6'}
                    />
                    <button style={styles.removeBtn} onClick={() => removeSub(s.id)}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fc3f1d'; e.currentTarget.style.background = '#fff0ee'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#999'; e.currentTarget.style.background = 'transparent'; }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button style={styles.addSubBtn} onClick={addSub}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <Plus size={16} />
              Добавить подзадачу
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            Отмена
          </button>
          <button style={styles.submitBtn} onClick={handleSubmit}
            onMouseEnter={e => e.currentTarget.style.background = '#e0321a'}
            onMouseLeave={e => e.currentTarget.style.background = '#fc3f1d'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
            {initial ? 'Сохранить' : 'Добавить задачу'}
          </button>
        </div>
      </div>
    </div>
  );
}
