import { useEffect, useMemo, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

function configureNova(monaco) {
  if (!monaco.languages.getLanguages().some((language) => language.id === 'nova')) {
    monaco.languages.register({ id: 'nova' });
  }

  monaco.languages.setMonarchTokensProvider('nova', {
    keywords: [
      'let',
      'if',
      'else',
      'while',
      'for',
      'repeat',
      'function',
      'return',
      'true',
      'false',
      'null',
      'break',
      'continue',
      'import',
      'export'
    ],
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
        [/\d+(\.\d+)?/, 'number'],
        [/[A-Za-z_][A-Za-z0-9_]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
        [/[+\-*/%=!<>|&]+/, 'operator'],
        [/[{}()[\],;.]/, 'delimiter']
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],
      comment: [
        [/[^*/]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[*/]/, 'comment']
      ]
    }
  });

  monaco.editor.defineTheme('nova-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '47e98d', fontStyle: 'bold' },
      { token: 'string', foreground: 'fbbf24' },
      { token: 'number', foreground: '67e8f9' },
      { token: 'comment', foreground: '718096' }
    ],
    colors: {
      'editor.background': '#08110d',
      'editor.foreground': '#e2e8f0',
      'editorLineNumber.foreground': '#64756c',
      'editorLineNumber.activeForeground': '#47e98d',
      'editorCursor.foreground': '#47e98d',
      'editor.selectionBackground': '#255f3d88',
      'editor.lineHighlightBackground': '#102018'
    }
  });
}

export default function Editor({ source, onChange, diagnostics = [] }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const markers = useMemo(
    () =>
      diagnostics.map((diagnostic) => ({
        startLineNumber: diagnostic.line || 1,
        startColumn: diagnostic.column || 1,
        endLineNumber: diagnostic.line || 1,
        endColumn: (diagnostic.column || 1) + 1,
        message: `${diagnostic.kind}: ${diagnostic.message}\n${diagnostic.suggestion || ''}`,
        severity: 8
      })),
    [diagnostics]
  );

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), 'nova', markers);
  }, [markers]);

  function handleMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.setModelMarkers(editor.getModel(), 'nova', markers);
  }

  return (
    <div className="flex h-full min-h-[54vh] flex-col bg-ink">
      <div className="flex h-11 items-center justify-between border-b border-line px-4">
        <div>
          <p className="text-sm font-semibold text-slate-100">program.nova</p>
          <p className="text-xs text-slate-500">{source.split('\n').length} lines</p>
        </div>
        {diagnostics.length > 0 && (
          <span className="rounded border border-danger/40 px-2 py-1 text-xs text-danger">
            {diagnostics.length} issue{diagnostics.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <MonacoEditor
          height="100%"
          language="nova"
          theme="nova-dark"
          value={source}
          beforeMount={configureNova}
          onMount={handleMount}
          onChange={(value) => onChange(value ?? '')}
          options={{
            automaticLayout: true,
            fontFamily: 'JetBrains Mono, Cascadia Code, Consolas, monospace',
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 18, bottom: 18 },
            tabSize: 2,
            wordWrap: 'on',
            guides: { indentation: true },
            quickSuggestions: false
          }}
        />
      </div>
    </div>
  );
}
