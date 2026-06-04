const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    animation: 'fadeIn 0.15s ease',
  },
  box: {
    background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.16)', animation: 'slideDown 0.18s ease',
  },
  icon: { fontSize: '32px', marginBottom: '12px' },
  title: { fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' },
  text: { fontSize: '14px', color: '#6b6a69', lineHeight: '1.5', marginBottom: '20px' },
  btns: { display: 'flex', gap: '10px' },
  cancelBtn: {
    flex: 1, padding: '10px', border: '1.5px solid #e6e6e6', borderRadius: '10px',
    background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
    color: '#6b6a69', transition: 'background 0.15s', fontFamily: 'inherit',
  },
  deleteBtn: {
    flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
    background: '#fc3f1d', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    color: '#fff', transition: 'background 0.15s', fontFamily: 'inherit',
  },
};

export default function ConfirmDialog({ title, text, onConfirm, onCancel }) {
  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={styles.box}>
        <div style={styles.icon}>🗑️</div>
        <div style={styles.title}>{title}</div>
        <div style={styles.text}>{text}</div>
        <div style={styles.btns}>
          <button style={styles.cancelBtn} onClick={onCancel}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            Отмена
          </button>
          <button style={styles.deleteBtn} onClick={onConfirm}
            onMouseEnter={e => e.currentTarget.style.background = '#e0321a'}
            onMouseLeave={e => e.currentTarget.style.background = '#fc3f1d'}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
