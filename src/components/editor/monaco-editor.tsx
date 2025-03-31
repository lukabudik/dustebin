'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import type { Monaco, OnMount } from '@monaco-editor/react';
import type * as MonacoType from 'monaco-editor';

// Dynamically import Monaco Editor to reduce initial bundle size
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <svg
          className="text-primary h-6 w-6 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Loading editor...</span>
      </div>
    </div>
  ),
});

// Define custom themes for Monaco Editor
const defineCustomThemes = (monaco: Monaco) => {
  // Define a custom dark theme
  monaco.editor.defineTheme('dustebin-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'regexp', foreground: 'D16969' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'namespace', foreground: '569CD6' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'struct', foreground: '4EC9B0' },
      { token: 'class', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'interface', foreground: '4EC9B0' },
      { token: 'enum', foreground: '4EC9B0' },
      { token: 'typeParameter', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'member', foreground: '9CDCFE' },
      { token: 'macro', foreground: 'BD63C5' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'parameter', foreground: '9CDCFE' },
      { token: 'property', foreground: '9CDCFE' },
      { token: 'constant', foreground: '4FC1FF' },
      { token: 'modifier', foreground: '569CD6' },
      { token: 'control', foreground: 'C586C0' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editorLineNumber.foreground': '#6E7681',
      'editorLineNumber.activeForeground': '#C9D1D9',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editorCursor.foreground': '#AEAFAD',
    },
  });

  // Define a custom light theme
  monaco.editor.defineTheme('dustebin-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'regexp', foreground: '811F3F' },
      { token: 'operator', foreground: '000000' },
      { token: 'namespace', foreground: '267F99' },
      { token: 'type', foreground: '267F99' },
      { token: 'struct', foreground: '267F99' },
      { token: 'class', foreground: '267F99', fontStyle: 'bold' },
      { token: 'interface', foreground: '267F99' },
      { token: 'enum', foreground: '267F99' },
      { token: 'typeParameter', foreground: '267F99' },
      { token: 'function', foreground: '795E26' },
      { token: 'member', foreground: '001080' },
      { token: 'macro', foreground: 'AF00DB' },
      { token: 'variable', foreground: '001080' },
      { token: 'parameter', foreground: '001080' },
      { token: 'property', foreground: '001080' },
      { token: 'constant', foreground: '0070C1' },
      { token: 'modifier', foreground: '0000FF' },
      { token: 'control', foreground: 'AF00DB' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editorLineNumber.foreground': '#6E7681',
      'editorLineNumber.activeForeground': '#24292F',
      'editor.selectionBackground': '#ADD6FF',
      'editor.inactiveSelectionBackground': '#E5EBF1',
      'editorCursor.foreground': '#000000',
    },
  });
};

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  height?: string;
  showLineNumbers?: boolean;
  showSyntaxHighlighting?: boolean;
}

export interface MonacoEditorRef {
  focus: () => void;
}

export const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  (
    {
      value,
      onChange,
      language = 'plaintext',
      placeholder = 'Paste or type your code here...',
      readOnly = false,
      className = '',
      height = '400px',
      showLineNumbers = true,
      // Monaco Editor has syntax highlighting enabled by default
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      showSyntaxHighlighting = false,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      },
    }));

    // Map our language identifiers to Monaco's
    const getMonacoLanguage = (lang: string): string => {
      const languageMap: Record<string, string> = {
        javascript: 'javascript',
        typescript: 'typescript',
        html: 'html',
        css: 'css',
        json: 'json',
        markdown: 'markdown',
        md: 'markdown',
        python: 'python',
        py: 'python',
        rust: 'rust',
        rs: 'rust',
        sql: 'sql',
        xml: 'xml',
        plaintext: 'plaintext',
      };

      return languageMap[lang.toLowerCase()] || 'plaintext';
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Define custom themes
      defineCustomThemes(monaco);

      // Disable command palette (F1)
      editor.addAction({
        id: 'disable-f1',
        label: 'Disable F1',
        keybindings: [monaco.KeyCode.F1],
        run: () => {
          // Do nothing, effectively disabling F1
          return;
        },
      });

      // Set placeholder text
      if (placeholder && !value) {
        editor.updateOptions({
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          cursorStyle: 'line',
          automaticLayout: true,
          readOnly: readOnly,
          lineNumbers: showLineNumbers ? 'on' : 'off',
        });

        // Add placeholder text using content widgets
        const placeholderWidget = {
          getId: () => 'placeholder',
          getDomNode: () => {
            const node = document.createElement('div');
            node.textContent = placeholder;
            node.style.fontStyle = 'italic';
            node.style.color = '#6b7280';
            node.style.paddingLeft = '8px';
            node.style.position = 'absolute';
            node.style.zIndex = '1';
            return node;
          },
          getPosition: () => ({
            position: { lineNumber: 1, column: 1 },
            preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
          }),
        };

        editor.addContentWidget(placeholderWidget);

        // Remove placeholder when content changes
        const disposable = editor.onDidChangeModelContent(() => {
          if (editor.getValue()) {
            editor.removeContentWidget(placeholderWidget);
            disposable.dispose();
          } else {
            editor.addContentWidget(placeholderWidget);
          }
        });
      }
    };

    // Only render Monaco on the client
    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return (
        <div className={`border-border bg-card/50 rounded-md border p-4 ${className}`}>
          <div
            className="text-muted-foreground flex w-full items-center justify-center"
            style={{ height }}
          >
            <div className="flex flex-col items-center gap-2">
              <svg
                className="text-primary h-6 w-6 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading editor...</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex h-full w-full flex-col ${className}`}>
        <Editor
          height={height}
          language={getMonacoLanguage(language)}
          value={value}
          onChange={value => onChange(value || '')}
          theme={theme === 'dark' ? 'dustebin-dark' : 'dustebin-light'}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: showLineNumbers ? 'on' : 'off',
            renderLineHighlight: 'none',
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            folding: false,
            glyphMargin: false,
            contextmenu: false, // Disable the context menu to prevent access to Command Palette
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 12, // Smaller font size
            lineHeight: 18, // Adjusted line height
            automaticLayout: true,
            autoIndent: 'none', // Turn off automatic tabbing
            autoClosingBrackets: 'never', // Turn off auto closing brackets
            autoClosingQuotes: 'never', // Turn off auto closing quotes
            // Note: Monaco doesn't have a direct autoClosingTags option
            autoClosingOvertype: 'never', // Turn off auto closing overtype
            autoSurround: 'never', // Turn off auto surrounding
            formatOnType: false, // Turn off format on type
            formatOnPaste: false, // Turn off format on paste
            suggestOnTriggerCharacters: false, // Turn off suggestions on trigger characters
            acceptSuggestionOnEnter: 'off', // Turn off accepting suggestions on enter
            acceptSuggestionOnCommitCharacter: false, // Turn off accepting suggestions on commit character
            quickSuggestions: false, // Turn off quick suggestions
            suggestSelection: 'first', // Set suggest selection to first
            tabCompletion: 'off', // Turn off tab completion
            // Command palette is disabled via the addAction method above
          }}
          onMount={handleEditorDidMount}
          className="font-mono text-sm"
        />
      </div>
    );
  }
);

MonacoEditor.displayName = 'MonacoEditor';
