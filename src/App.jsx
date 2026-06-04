import { useState, useMemo } from 'react';
import { Plus, Search, BookOpen, CheckCircle2, X } from 'lucide-react';
import { useStore } from './useStore';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import ConfirmDialog from './components/ConfirmDialog';
import { taskMatchesSearch } from './utils';

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask } = useStore();
  const [tab, setTab] = useState('active'); // 'active' | 'done'
  const [searchActive, setSearchActive] = useState('');
  const [searchDone, setSearchDone] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const currentSearch = tab === 'active' ? searchActive : searchDone;

  const filtered = useMemo(() => {
    const base = tasks.filter(t => tab === 'active' ? !t.done : t.done);
    return base.filter(t => taskMatchesSearch(t, currentSearch));
  }, [tasks, tab, currentSearch]);

  const activeCnt = tasks.filter(t => !t.done).length;
  const doneCnt = tasks.filter(t => t.done).length;

  function handleFormSubmit(data) {
    if (editTask) {
      updateTask(editTask.id, { ...data, subtasks: data.subtasks });
      setEditTask(null);
    } else {
      addTask(data);
      setShowForm(false);
    }
  }

  function handleEdit(task) {
    setEditTask(task);
  }

  function handleDeleteConfirm() {
    deleteTask(deleteId);
    setDeleteId(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff5f3 0%, #f5f5f5 40%, #f0f4ff 100%)' }}>
      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e6e6e6',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', background: '#fc3f1d', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.1 }}>Список задач</div>
                <div style={{ fontSize: '11px', color: '#999', lineHeight: 1 }}>для студентов</div>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: '#fc3f1d', color: '#fff', border: 'none', borderRadius: '10px',
                padding: '9px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(252,63,29,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e0321a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fc3f1d'; e.currentTarget.style.transform = 'none'; }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'none'}>
              <Plus size={16} />
              Добавить задачу
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px 60px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#e6e6e6', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
          {[
            { key: 'active', label: 'Активные', count: activeCnt },
            { key: 'done', label: 'Выполненные', count: doneCnt },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '9px 16px', border: 'none', borderRadius: '9px',
              fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#1a1a1a' : '#6b6a69',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              {t.key === 'done' && <CheckCircle2 size={15} />}
              {t.label}
              <span style={{
                background: tab === t.key ? '#fc3f1d' : '#c5c5c5', color: '#fff',
                borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '600',
                transition: 'background 0.18s',
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
          <input
            value={currentSearch}
            onChange={e => tab === 'active' ? setSearchActive(e.target.value) : setSearchDone(e.target.value)}
            placeholder="Поиск по названию, подзадачам, дате и времени..."
            style={{
              width: '100%', border: '1.5px solid #e6e6e6', borderRadius: '12px',
              padding: '11px 40px 11px 40px', fontSize: '14px', outline: 'none',
              fontFamily: 'inherit', color: '#1a1a1a', background: '#fff',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
            onFocus={e => { e.target.style.borderColor = '#0078ff'; e.target.style.boxShadow = '0 0 0 3px rgba(0,120,255,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = '#e6e6e6'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
          />
          {currentSearch && (
            <button onClick={() => tab === 'active' ? setSearchActive('') : setSearchDone('')} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: '#e6e6e6', border: 'none', borderRadius: '50%', width: '22px', height: '22px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#666', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#d5d4d3'}
              onMouseLeave={e => e.currentTarget.style.background = '#e6e6e6'}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <EmptyState tab={tab} hasSearch={!!currentSearch} />
        ) : (
          <div>
            {filtered.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                query={currentSearch}
                onToggle={toggleTask}
                onEdit={handleEdit}
                onDelete={id => setDeleteId(id)}
                onToggleSub={toggleSubtask}
              />
            ))}
            {currentSearch && (
              <div style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '8px' }}>
                Найдено: {filtered.length}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {(showForm || editTask) && (
        <TaskForm
          initial={editTask || null}
          onClose={() => { setShowForm(false); setEditTask(null); }}
          onSubmit={handleFormSubmit}
        />
      )}
      {deleteId && (
        <ConfirmDialog
          title="Удалить задачу?"
          text="Задача и все её подзадачи будут удалены безвозвратно."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ tab, hasSearch }) {
  if (hasSearch) return (
    <div style={{ textAlign: 'center', padding: '48px 16px', color: '#aaa' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
      <div style={{ fontSize: '16px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>Ничего не найдено</div>
      <div style={{ fontSize: '14px' }}>Попробуйте изменить запрос</div>
    </div>
  );
  if (tab === 'done') return (
    <div style={{ textAlign: 'center', padding: '48px 16px', color: '#aaa' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
      <div style={{ fontSize: '16px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>Выполненных задач нет</div>
      <div style={{ fontSize: '14px' }}>Завершите задачи, чтобы они появились здесь</div>
    </div>
  );
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px', color: '#aaa' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
      <div style={{ fontSize: '16px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>Нет активных задач</div>
      <div style={{ fontSize: '14px' }}>Добавьте задачу, чтобы начать подготовку к экзаменам</div>
    </div>
  );
}
