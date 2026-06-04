import { useState } from 'react';
import { Check, Pencil, Trash2, ChevronDown, ChevronUp, Calendar, Clock, AlertCircle } from 'lucide-react';
import HighlightText from './HighlightText';
import { getDeadlineLabel } from '../utils';

const deadlineColors = {
  overdue: { bg: '#fff0ee', color: '#fc3f1d', border: '#ffd5ce' },
  today: { bg: '#fff8e0', color: '#b87900', border: '#ffe98a' },
  tomorrow: { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
  soon: { bg: '#e8f4fd', color: '#0277bd', border: '#90caf9' },
  later: { bg: '#f5f5f5', color: '#555', border: '#e0e0e0' },
};

export default function TaskCard({ task, onToggle, onEdit, onDelete, onToggleSub, query }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const dl = task.date ? getDeadlineLabel(task.date, task.time) : null;
  const dlStyle = dl ? (deadlineColors[dl.type] || deadlineColors.later) : null;
  const hasSubs = task.subtasks && task.subtasks.length > 0;
  const doneSubs = hasSubs ? task.subtasks.filter(s => s.done).length : 0;
  const canComplete = !hasSubs || doneSubs === task.subtasks.length;

  const cardStyle = {
    background: task.done ? '#fafafa' : '#fff',
    border: `1.5px solid ${task.done ? '#e6e6e6' : hovered ? '#d0d0d0' : '#ebebeb'}`,
    borderRadius: '14px',
    padding: '16px 18px',
    marginBottom: '10px',
    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: hovered && !task.done ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
    animation: 'fadeIn 0.22s ease',
    transform: hovered && !task.done ? 'translateY(-1px)' : 'none',
    opacity: task.done ? 0.75 : 1,
  };

  return (
    <div style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          title={!canComplete ? 'Сначала выполните все подзадачи' : ''}
          style={{
            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
            border: task.done ? 'none' : `2px solid ${canComplete ? '#fc3f1d' : '#ccc'}`,
            background: task.done ? '#fc3f1d' : '#fff',
            cursor: canComplete ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', marginTop: '1px',
          }}>
          {task.done && <Check size={13} color="#fff" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{
              fontSize: '15px', fontWeight: '500', color: task.done ? '#999' : '#1a1a1a',
              textDecoration: task.done ? 'line-through' : 'none',
              lineHeight: '1.4', transition: 'color 0.15s',
            }}>
              <HighlightText text={task.title} query={query} />
            </span>
            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
              <ActionBtn icon={<Pencil size={14} />} onClick={() => onEdit(task)} color="#0078ff" title="Редактировать" />
              <ActionBtn icon={<Trash2 size={14} />} onClick={() => onDelete(task.id)} color="#fc3f1d" title="Удалить" />
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
            {dl && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                background: dlStyle.bg, color: dlStyle.color, border: `1px solid ${dlStyle.border}`,
              }}>
                {dl.type === 'overdue' ? <AlertCircle size={11} /> : <Calendar size={11} />}
                <HighlightText text={task.date} query={query} />
                {task.time && (
                  <><span style={{ opacity: 0.5 }}>·</span>
                  <Clock size={10} />
                  <HighlightText text={task.time} query={query} /></>
                )}
              </span>
            )}
            {dl && (
              <span style={{ fontSize: '12px', color: dlStyle.color, fontWeight: '500' }}>{dl.label}</span>
            )}
            {hasSubs && (
              <button onClick={() => setExpanded(e => !e)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                background: '#f0f0f0', color: '#555', border: '1px solid #e6e6e6', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e6e6e6'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0f0f0'}>
                {doneSubs}/{task.subtasks.length} подзадач
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>

          {/* Subtasks */}
          {hasSubs && expanded && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0', animation: 'fadeIn 0.15s ease' }}>
              {task.subtasks.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '6px 0', borderBottom: '1px solid #f8f8f8',
                }}>
                  <button onClick={() => onToggleSub(task.id, s.id)} style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    border: s.done ? 'none' : '2px solid #ccc', background: s.done ? '#1fb841' : '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {s.done && <Check size={10} color="#fff" strokeWidth={3} />}
                  </button>
                  <span style={{
                    fontSize: '14px', color: s.done ? '#aaa' : '#333',
                    textDecoration: s.done ? 'line-through' : 'none', transition: 'color 0.15s',
                  }}>
                    <HighlightText text={s.text} query={query} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, onClick, color, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title} style={{
      width: '30px', height: '30px', border: 'none', borderRadius: '8px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: hov ? (color === '#fc3f1d' ? '#fff0ee' : '#e8f0ff') : 'transparent',
      color: hov ? color : '#aaa', transition: 'all 0.15s',
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {icon}
    </button>
  );
}
