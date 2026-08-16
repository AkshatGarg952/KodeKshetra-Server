import React, { useState, useEffect, useRef } from 'react';
// import { codeTemplates } from './EditorPanel';

function CodeEditor({ language, problemId, code, setCode }) {
  const [lineNumbers, setLineNumbers] = useState('1\n');
  const editorRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // useEffect(() => {
  //   setCode(codeTemplates[language] || '');
  //   updateLineNumbers(codeTemplates[language] || '');
  // }, [language]);
  
  useEffect(() => {
    updateLineNumbers(code);
  }, [code]);

  const updateLineNumbers = (text) => {
    const lines = text.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1).join('\n'));
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setCode(value);
    updateLineNumbers(value);
  };

  const handleScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      updateLineNumbers(newCode);
      setTimeout(() => {
        editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="code-editor-container flex flex-1 bg-void-black relative overflow-hidden min-h-0">
      <div
        ref={lineNumbersRef}
        className="line-numbers bg-[rgba(26,26,26,0.6)] text-text-muted py-5 px-3 pr-4 font-fira-code text-sm leading-6 text-right select-none border-r border-neon-green min-w-[60px] max-w-[70px] whitespace-pre overflow-y-auto overflow-x-hidden"
      >
        {lineNumbers}
      </div>
      <textarea
        ref={editorRef}
        id="codeEditor"
        className="code-editor flex-1 bg-transparent text-text-primary border-none outline-none p-5 pl-4 font-fira-code text-sm leading-6 resize-none whitespace-pre overflow-x-auto overflow-y-auto min-h-0 selection:bg-[rgba(153,50,204,0.3)]"
        value={code}
        onChange={handleInput}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder="# Write your solution here..."
        spellCheck={false}
      ></textarea>
    </div>
  );
}

export default CodeEditor;
