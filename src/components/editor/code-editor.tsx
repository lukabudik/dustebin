'use client';

import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from 'next-themes';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { Extension } from '@codemirror/state';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';

interface CodeEditorProps {
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

export interface CodeEditorRef {
  focus: () => void;
}

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
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
      showSyntaxHighlighting = false,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [extensions, setExtensions] = useState<Extension[]>([]);
    const editorRef = useRef<ReactCodeMirrorRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current && editorRef.current.view) {
          editorRef.current.view.focus();
        }
      },
    }));

    // Custom styles to make the gutter (line numbers) white and remove dotted border
    const customStyles = useMemo(
      () =>
        EditorView.theme({
          '&': {
            backgroundColor: 'transparent !important',
            height: '100% !important',
          },
          '.cm-gutters': {
            backgroundColor: 'transparent !important',
            borderRight: 'none',
            color: '#6b7280',
            fontSize: '0.8rem !important',
            opacity: '0.7 !important',
          },
          '.cm-line': {
            padding: '0 4px',
          },
          '.cm-cursor-primary': {
            borderLeft: '1.5px solid currentColor',
          },
          '.cm-selectionMatch': {
            backgroundColor: 'transparent !important',
          },
          '.cm-content': {
            outline: 'none !important',
            border: 'none !important',
            borderBottom: 'none !important',
            caretColor: theme === 'dark' ? '#fff' : '#000',
            minHeight: '100% !important',
            paddingLeft: '16px !important',
            fontSize: '0.8rem !important',
          },
          '.cm-scroller': {
            overflow: 'auto !important',
            minHeight: '100% !important',
          },
          '.cm-editor': {
            height: '100% !important',
            outline: 'none !important',
          },
          '.cm-editor.cm-focused': {
            outline: 'transparent',
          },
        }),
      [theme]
    );

    // Load language extension based on selected language
    useEffect(() => {
      if (!showSyntaxHighlighting) {
        setExtensions([customStyles]);
        return;
      }

      let langExtension: Extension;

      switch (language.toLowerCase()) {
        case 'html':
          langExtension = html();
          break;
        case 'css':
          langExtension = css();
          break;
        case 'json':
          langExtension = json();
          break;
        case 'markdown':
        case 'md':
          langExtension = markdown();
          break;
        case 'python':
        case 'py':
          langExtension = python();
          break;
        case 'rust':
        case 'rs':
          langExtension = rust();
          break;
        case 'sql':
          langExtension = sql();
          break;
        case 'xml':
          langExtension = xml();
          break;
        case 'javascript':
        case 'js':
        case 'typescript':
        case 'ts':
        default:
          langExtension = javascript();
          break;
      }

      setExtensions([langExtension, customStyles]);
    }, [language, showSyntaxHighlighting, customStyles]);

    // Only render CodeMirror on the client
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

    // Determine if we should use dark mode
    const isDarkTheme = theme === 'dark';

    return (
      <div className={`flex h-full w-full flex-col ${className}`}>
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          placeholder={placeholder}
          readOnly={readOnly}
          theme={isDarkTheme ? vscodeDark : undefined}
          height="100%"
          style={{ flex: 1, minHeight: '100%' }}
          indentWithTab={false}
          ref={editorRef}
          basicSetup={{
            lineNumbers: showLineNumbers,
            highlightActiveLineGutter: false,
            highlightSpecialChars: false,
            foldGutter: false,
            drawSelection: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: false,
            syntaxHighlighting: showSyntaxHighlighting,
            bracketMatching: false,
            closeBrackets: false,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
            closeBracketsKeymap: false,
            searchKeymap: false,
            foldKeymap: false,
            completionKeymap: false,
            lintKeymap: false,
          }}
          className="font-mono text-sm"
        />
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';
