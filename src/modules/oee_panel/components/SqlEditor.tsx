import React, { useState, useRef, useEffect } from 'react';
import './SqlEditor.css';

interface SqlEditorProps {
    value: string;
    onChange?: (value: string) => void;
    style?: React.CSSProperties;
}

// Define token types for syntax highlighting
type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'default' | 'whitespace' | 'boolean';

interface Token {
    value: string;
    type: TokenType;
}

function SqlEditor({ value: content = '', onChange, style }: SqlEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const linesRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<string[]>((content || '').split('\n'));

    // Comprehensive list of SQL keywords
    const keywords = [
        // Data Definition Language (DDL)
        'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME',
        
        // Data Manipulation Language (DML)
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'MERGE',
        
        // Data Control Language (DCL)
        'GRANT', 'REVOKE',
        
        // Transaction Control Language (TCL)
        'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'SET TRANSACTION',
        
        // Clauses and Conditions
        'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'JOIN', 
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
        
        // Logical Operators
        'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
        
        // Aggregate Functions
        'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
        
        // Other Common Keywords
        'FROM', 'INTO', 'VALUES', 'SET', 'ON',
        'DISTINCT', 'ALL', 'AS', 'EXISTS', 'ANY', 'SOME'
    ];

    // Boolean keywords
    const booleanKeywords = [
        'TRUE', 'FALSE', 'NULL'
    ];

    // Tokenize the input text
    const tokenize = (text: string): Token[] => {
        const tokens: Token[] = [];
        let currentToken = '';
        let currentType: TokenType = 'default';

        const pushToken = () => {
            if (currentToken) {
                const upperToken = currentToken.toUpperCase();
                let tokenType: TokenType = currentType;

                // Check for keywords
                if (keywords.includes(upperToken)) {
                    tokenType = 'keyword';
                } 
                // Check for boolean keywords
                else if (booleanKeywords.includes(upperToken)) {
                    tokenType = 'boolean';
                }
                
                tokens.push({ value: currentToken, type: tokenType });
                currentToken = '';
                currentType = 'default';
            }
        };

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Handle whitespace
            if (/\s/.test(char)) {
                // Push any existing token
                pushToken();
                
                // Add whitespace token
                tokens.push({ value: char, type: 'whitespace' });
                continue;
            }

            // Handle strings
            if (char === '"' || char === "'") {
                pushToken();

                if (currentType === 'string') {
                    currentToken += char;
                    tokens.push({ value: currentToken, type: 'string' });
                    currentToken = '';
                    currentType = 'default';
                } else {
                    currentToken = char;
                    currentType = 'string';
                }
                continue;
            }

            // Handle numbers
            if (/\d/.test(char) && currentType !== 'string') {
                if (currentType !== 'number') {
                    pushToken();
                    currentToken = char;
                    currentType = 'number';
                } else {
                    currentToken += char;
                }
                continue;
            }

            // Handle operators and other non-alphanumeric characters
            if (/[^a-zA-Z0-9]/.test(char) && currentType !== 'string') {
                pushToken();
                
                // Add operator token if not a whitespace
                if (char.trim()) {
                    tokens.push({ value: char, type: 'operator' });
                }
                continue;
            }

            // Build current token
            currentToken += char;
        }

        // Push last token
        pushToken();

        return tokens;
    };

    // Generate line numbers
    const generateLineNumbers = () => {
        return lines.map((_, index) => (
            <div key={index} className="line-number">
                {index + 1}
            </div>
        ));
    };

    // Render highlighted tokens
    const renderHighlightedContent = () => {
        const tokens = tokenize(content);
        let renderedTokens: React.ReactNode[] = [];
        let currentLineTokens: React.ReactNode[] = [];

        tokens.forEach((token, index) => {
            const tokenElement = (
                <span key={index} className={`token-${token.type}`}>
                    {token.type === 'whitespace' ? 
                        token.value.replace(/ /g, '\u00A0').replace(/\t/g, '\u00A0\u00A0\u00A0\u00A0') : 
                        token.value
                    }
                </span>
            );

            if (token.value.includes('\n')) {
                const parts = token.value.split('\n');
                parts.forEach((part, partIndex) => {
                    if (partIndex > 0) {
                        renderedTokens.push(currentLineTokens);
                        renderedTokens.push(<br key={`br-${index}-${partIndex}`} />);
                        currentLineTokens = [];
                    }
                    currentLineTokens.push(
                        <span key={`${index}-${partIndex}`} className={`token-${token.type}`}>
                            {part}
                        </span>
                    );
                });
            } else {
                currentLineTokens.push(tokenElement);
            }
        });

        // Add last line
        if (currentLineTokens.length > 0) {
            renderedTokens.push(currentLineTokens);
        }

        return renderedTokens;
    };

    // Handle text change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value || '';
        setLines(newValue.split('\n'));
        
        if (onChange) {
            onChange(newValue);
        }
    };

    // Sync scroll between textarea and highlight div
    const handleScroll = () => {
        if (textareaRef.current && highlightRef.current && linesRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            linesRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    return (
        <div className="sql-editor" style={style}>
            <div ref={linesRef} className="line-numbers">
                {generateLineNumbers()}
            </div>
            <div className="editor-area">
                <textarea 
                    ref={textareaRef}
                    className="editor-textarea" 
                    value={content || ''}
                    onChange={handleChange}
                    onScroll={handleScroll}
                    spellCheck="false"
                    placeholder="Write your SQL query here..."
                />
                <div 
                    ref={highlightRef} 
                    className="editor-highlight"
                >
                    {renderHighlightedContent()}
                </div>
            </div>
        </div>
    );
}

export default SqlEditor;
