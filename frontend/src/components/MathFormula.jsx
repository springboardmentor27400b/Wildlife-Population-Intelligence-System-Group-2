import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathFormula({ math, displayMode = false, className = '' }) {
  if (!math) return null;

  let raw = String(math).trim();
  if (raw.startsWith('$$') && raw.endsWith('$$')) {
    raw = raw.slice(2, -2).trim();
    displayMode = true;
  } else if (raw.startsWith('$') && raw.endsWith('$')) {
    raw = raw.slice(1, -1).trim();
  }

  // Pre-process syntax adjustments for clean KaTeX rendering
  let clean = raw
    .replace(/\\text\s*['"]([^'"]+)['"]/g, '\\text{$1}')
    .replace(/\\text([A-Za-z0-9_]+)/g, '\\text{$1}');

  try {
    const html = katex.renderToString(clean, {
      displayMode,
      throwOnError: false,
    });

    return (
      <span
        className={`math-rendered font-medium ${displayMode ? 'my-1 py-1.5 px-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg shadow-inner text-emerald-300 inline-block' : 'px-0.5 text-emerald-300 inline-flex items-center'} ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (err) {
    console.warn('KaTeX rendering fallback for formula:', math, err);
    return <code className={`font-mono text-xs text-emerald-400 ${className}`}>{math}</code>;
  }
}
