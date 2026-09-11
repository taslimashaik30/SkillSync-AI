import React from 'react';

function inline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

/** Render the limited Markdown returned by the assistant without HTML injection. */
export default function MarkdownMessage({ content }) {
  const lines = String(content || '').replace(/\\n/g, '\n').split('\n');
  const nodes = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      nodes.push(<pre key={nodes.length} style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', margin: '0.5rem 0' }}><code>{code.join('\n')}</code></pre>);
      continue;
    }
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      nodes.push(<strong key={nodes.length} style={{ display: 'block', marginTop: '0.5rem' }}>{inline(heading[1])}</strong>);
      index += 1;
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(isOrdered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={items.length}>{inline(item[1])}</li>);
        index += 1;
      }
      const List = isOrdered ? 'ol' : 'ul';
      nodes.push(<List key={nodes.length} style={{ margin: '0.35rem 0', paddingLeft: '1.25rem' }}>{items}</List>);
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s+|```|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    nodes.push(<p key={nodes.length} style={{ margin: '0 0 0.5rem' }}>{inline(paragraph.join(' '))}</p>);
  }

  return <>{nodes}</>;
}
