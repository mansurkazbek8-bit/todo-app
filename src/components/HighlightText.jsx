import { highlightText } from '../utils';

export default function HighlightText({ text, query }) {
  const parts = highlightText(text, query);
  return (
    <span>
      {parts.map((p, i) =>
        p.highlight
          ? <mark key={i} style={{ background: '#ffe57a', color: 'inherit', borderRadius: '2px', padding: '0 1px' }}>{p.text}</mark>
          : <span key={i}>{p.text}</span>
      )}
    </span>
  );
}
