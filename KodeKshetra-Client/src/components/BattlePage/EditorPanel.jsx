import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor';
import { getStoredBattleCode, persistBattleCode } from '../../features/battle/sessionStorage.js';

function EditorPanel({ onRun, onSubmit, problem, setParentCode, setParentLanguage }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const isInitialLoad = useRef(true);

  const languageMap = { python: 71, java: 62, cpp: 54 };
  const languageId = languageMap[language];

  // Load code from sessionStorage or problem boilerplate on language/problem change
  useEffect(() => {
    let loadedCode = getStoredBattleCode(problem?.problemId, language);
    let finalCode = '';
    if (loadedCode !== null) {
      finalCode = loadedCode;
    } else if (problem?.source === 'leetcode' && problem.boilerplateCode) {
      finalCode = problem.boilerplateCode[language]?.code || '';
    } else {
      finalCode = '';
    }
    setCode(finalCode);
    setParentCode(finalCode);
    setParentLanguage(language);
    isInitialLoad.current = true;
  }, [problem, language, setParentCode, setParentLanguage]);

  // Save code in sessionStorage, except for the initial mount after code is restored
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else {
      persistBattleCode(problem?.problemId, language, code);
    }
  }, [code, language, problem?.problemId]);

  return (
    <div className="editor-panel w-1/2 bg-[rgba(26,26,26,0.9)] backdrop-blur-[15px] border border-neon-green rounded-r-2xl rounded-l-none flex flex-col overflow-hidden shadow-lg h-full max-lg:w-full max-lg:rounded-2xl max-lg:m-1 max-lg:h-[60vh]">
      <div className="editor-header p-4 bg-gradient-to-br from-deep-black to-charcoal border-b border-neon-green flex justify-between items-center">
        <label htmlFor="languageSelect" className="text-sm text-gray-300 mr-2">Language:</label>
        <select
          id="languageSelect"
          className="bg-[rgba(0,0,0,0.8)] text-text-primary border-2 border-electric-purple p-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,255,255,0.4)]"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <CodeEditor
        language={language}
        problemId={problem?.problemId}
        code={code}
        setCode={setCode}
      />
      <div className="editor-footer flex justify-center items-center gap-4 p-4 bg-gradient-to-br from-deep-black to-charcoal border-t border-neon-green">
        <button
          id="runCodeBtn"
          className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm text-void-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,245,255,0.5)] active:scale-95 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00F5FF 0%, #32CD32 100%)' }}
          onClick={() => onRun(code, language, problem)}
        >
          <i className="fas fa-play text-xs"></i>
          Run Code
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'white' }} />
        </button>
        <button
          id="submitBtn"
          className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,0,255,0.5)] active:scale-95 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #8B00FF 0%, #FF0040 100%)' }}
          onClick={() => onSubmit(code, language, problem)}
        >
          <i className="fas fa-paper-plane text-xs"></i>
          Submit
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'white' }} />
        </button>
      </div>
    </div>
  );
}

export default EditorPanel;
