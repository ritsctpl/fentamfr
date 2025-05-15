import React, { useState, useRef, useEffect } from 'react';
import { Select, Button, Space, message } from 'antd';
const { Option } = Select;

interface ScriptEditorProps {
  onExecute: (result: string) => void;
}

const DEFAULT_SCRIPTS = {
  'script1': `// Script 1: Basic validation
function validate(input) {
  log("Validating input:", input);
  return input > 0;
}
return validate(5);  // Execute and return the result`,

  'script2': `// Script 2: Data transformation
function transform(data) {
  log("Transforming data:", data);
  return data * 2;
}
return transform(10);  // Execute and return the result`,

  'script3': `// Script 3: Conditional routing
function route(condition) {
  log("Routing based on:", condition);
  return condition ? "path1" : "path2";
}
return route(true);  // Execute and return the result`,

  'custom': `// Write your custom script here Use log() for console output
// Make sure to use 'return' for the final result`
};

const ScriptEditor: React.FC<ScriptEditorProps> = ({ onExecute }) => {
  const [selectedScript, setSelectedScript] = useState<string>('custom');
  const [code, setCode] = useState<string>(DEFAULT_SCRIPTS.custom);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [output, setOutput] = useState<string>('');
  const [returnValue, setReturnValue] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = editorRef.current.scrollHeight + 'px';
    }
  }, [code]);

  const handleScriptChange = (value: string) => {
    setSelectedScript(value);
    setCode(DEFAULT_SCRIPTS[value as keyof typeof DEFAULT_SCRIPTS]);
    setError('');
    setOutput('');
    setReturnValue(null);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setError('');
    setOutput('');
    setReturnValue(null);
  };

  const executeScript = () => {
    try {
      // Create a logs array to store output
      let logs: string[] = [];
      
      // Create a safe evaluation context with a log function
      const evalContext = `
        "use strict";
        let __result;
        function log(...args) {
          __logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '));
        }
        
        // Execute the code and capture the result
        __result = (function() {
          ${code}
        })();
        
        // Return the result
        return __result;
      `;
      const scriptFunction = new Function('__logs', evalContext);
      
      const result = scriptFunction(logs);

      // Set the output and return value
      setOutput(logs.join('\n'));
      setReturnValue(result);
      setError('');
      onExecute(result !== undefined ? String(result) : '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOutput('');
      setReturnValue(null);
      onExecute('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Select
        value={selectedScript}
        onChange={handleScriptChange}
        style={{ width: '100%' }}
      >
        <Option value="script1">Validation Script</Option>
        <Option value="script2">Transformation Script</Option>
        <Option value="script3">Routing Script</Option>
        <Option value="custom">Custom Script</Option>
      </Select>

      <div style={{ position: 'relative' }}>
        <textarea
          ref={editorRef}
          value={code}
          onChange={handleCodeChange}
          disabled={selectedScript !== 'custom'}
          style={{
            width: '96%',
            minHeight: '200px',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            resize: 'vertical',
            backgroundColor: '#f5f5f5',
            color: '#1f2937',
          }}
          spellCheck={false}
        />
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          type="primary" 
          onClick={executeScript}
          style={{ marginBottom: '8px' }}
        >
          Execute Script
        </Button>

        {error && (
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            color: '#cf1322',
            marginBottom: '8px',
          }}>
            {error}
          </div>
        )}

        {output && (
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#f6ffed', 
            border: '1px solid #b7eb8f',
            borderRadius: '4px',
            color: '#389e0d',
            whiteSpace: 'pre-wrap',
            marginBottom: '8px',
          }}>
            <strong>Console Output:</strong>
            <pre>{output}</pre>
          </div>
        )}

        {returnValue !== null && (
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#e6f4ff',
            border: '1px solid #91caff',
            borderRadius: '4px',
            color: '#0958d9',
            whiteSpace: 'pre-wrap',
          }}>
            <strong>Return Value (shown on edge):</strong>
            <pre>{String(returnValue)}</pre>
          </div>
        )}
      </Space>
    </div>
  );
};

export default ScriptEditor; 