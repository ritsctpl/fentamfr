import { Editor, useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';


export default function NewSqlEditor({ query, setQuery, tableAndColumn }: { query: string, setQuery: (query: string) => void, tableAndColumn: any }) {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      // Register SQL language completion provider
      monaco.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          const suggestions = [];

          // Check if we're after a FROM keyword
          const fromMatch = textUntilPosition.toUpperCase().match(/FROM\s+$/i);
          if (fromMatch) {
            // Suggest tables
            suggestions.push(...tableAndColumn.map(table => ({
              label: table.table,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: table.table,
              detail: 'Table',
            })));
          }

          // Check if we're after a table name and dot
          tableAndColumn.forEach(table => {
            const tableMatch = new RegExp(`${table.table}\\.\\s*$`).test(textUntilPosition);
            if (tableMatch) {
              // Suggest columns for this table
              suggestions.push(...table.columns.map(column => ({
                label: column,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: column,
                detail: 'Column',
              })));
            }
          });

          return {
            suggestions: suggestions,
          };
        },
        triggerCharacters: [' ', '.']
      });
    }
  }, [monaco]);

  return (
    <Editor
      height="330px"
      language="sql"
      theme="vs-light"
      value={query}
      onChange={setQuery}
      options={{
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        suggestOnTriggerCharacters: true,
        quickSuggestions: true
      }}
    />
  );
}
