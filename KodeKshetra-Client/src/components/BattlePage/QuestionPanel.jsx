import React from 'react';

function QuestionPanel({ problem, activeTab, setActiveTab, output }) {
  const escapeHtml = (text) =>
    String(text).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));

  const renderProblemContent = () => {
    const safeFormat = (text) => {
      if (typeof text !== 'string') return '';
      
      return escapeHtml(text)
        .replace(/\r?\n/g, '<br />')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
        .replace(/^\s*-\s*/gm, '• ') // Convert dashes to bullet points
        .replace(/^\s*\*\s*/gm, '• '); // Convert asterisks to bullet points
    };

    // Enhanced LeetCode formatting function with selective arrows (only for tab-indented content)
    const formatLeetCodeDescription = (description) => {
      if (!description) return '';
      
      // Split into lines and process each line
      const lines = description.split('\n');
      let formattedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Handle bullet points with arrows only for tab-indented lines
        if (line.startsWith('\t')) {
          // This is an indented item - make it a bullet point with arrow
          const content = line.replace(/^\t+/, '').trim();
          if (content) {
            formattedLines.push(`<div class="ml-6 mb-2 flex items-start"><span class="text-electric-blue mr-3 mt-1">→</span><span>${content}</span></div>`);
          }
        } else if (line.trim()) {
          // Regular paragraph without arrow
          formattedLines.push(`<div class="mb-3">${line.trim()}</div>`);
        } else {
          // Empty line - add spacing
          formattedLines.push('<div class="mb-2"></div>');
        }
      }
      
      return formattedLines.join('');
    };

    // Codeforces rendering (existing code with all features)
    if ((problem.source || '').toLowerCase() === 'codeforces') {
      const formattedDescription = safeFormat(problem.description);
      const formattedInputFormat = safeFormat(problem.inputFormat);
      const formattedOutputFormat = safeFormat(problem.outputFormat);
      const formattedNote = safeFormat(problem.note);

      return (
        <div className="problem-content flex-1 p-6 overflow-y-auto">
          <div className="problem-header p-6 bg-gradient-to-br from-deep-black to-charcoal border-b border-electric-blue relative">
            <div className="problem-title-row flex justify-between items-center mb-4">
              <h1 className="problem-title text-2xl font-bold text-text-primary text-shadow-blue">
                {problem.title || 'Untitled'}
              </h1>
            </div>
            <div className="problem-limits flex gap-5 mt-4 max-md:flex-col max-md:gap-2">
              <div className="limit-item-header flex items-center gap-2 bg-[rgba(0,191,255,0.1)] p-2 rounded-xl border border-cyber-cyan shadow-[0_0_10px_rgba(0,191,255,0.2)]">
                <i className="fas fa-clock text-cyber-cyan text-sm"></i>
                <span className="limit-value-header font-fira-code font-semibold text-text-primary text-sm">
                  {problem.timeLimit || 'N/A'}
                </span>
                <span className="limit-label-header text-xs text-text-secondary">Time Limit</span>
              </div>
              <div className="limit-item-header flex items-center gap-2 bg-[rgba(0,191,255,0.1)] p-2 rounded-xl border border-cyber-cyan shadow-[0_0_10px_rgba(0,191,255,0.2)]">
                <i className="fas fa-memory text-cyber-cyan text-sm"></i>
                <span className="limit-value-header font-fira-code font-semibold text-text-primary text-sm">
                  {problem.memoryLimit || 'N/A'}
                </span>
                <span className="limit-label-header text-xs text-text-secondary">Memory Limit</span>
              </div>
            </div>
          </div>
          {formattedDescription && (
            <div className="description-section mb-8">
              <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
                Problem Statement
              </h3>
              <div
                className="problem-description bg-[rgba(26,26,26,0.3)] p-5 rounded-xl border-l-4 border-electric-purple shadow-[0_4px_15px_rgba(153,50,204,0.2)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-void"
                dangerouslySetInnerHTML={{ __html: formattedDescription }}
              ></div>
            </div>
          )}
          {formattedInputFormat && (
            <div className="input-format-section mb-8">
              <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
                Input Format
              </h3>
              <div
                className="format-content bg-[rgba(26,26,26,0.3)] p-5 rounded-xl border-l-4 border-electric-purple shadow-[0_4px_15px_rgba(153,50,204,0.2)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-void"
                dangerouslySetInnerHTML={{ __html: formattedInputFormat }}
              ></div>
            </div>
          )}
          {formattedOutputFormat && (
            <div className="output-format-section mb-8">
              <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
                Output Format
              </h3>
              <div
                className="format-content bg-[rgba(26,26,26,0.3)] p-5 rounded-xl border-l-4 border-electric-purple shadow-[0_4px_15px_rgba(153,50,204,0.2)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-void"
                dangerouslySetInnerHTML={{ __html: formattedOutputFormat }}
              ></div>
            </div>
          )}
          {problem.examples?.length > 0 && (
            <div className="sample-tests-section mb-8">
              <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
                Sample Tests
              </h3>
              <div className="test-cases">
                {problem.examples.map((test, index) => (
                  <div
                    key={index}
                    className="test-case bg-[rgba(26,26,26,0.5)] rounded-xl p-5 mb-5 border border-neon-green shadow-[0_4px_15px_rgba(57,255,20,0.2)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[2px] before:bg-gradient-matrix"
                  >
                    <div className="test-header font-semibold mb-4 text-neon-green text-base text-shadow-green">
                      Example {index + 1}:
                    </div>
                    <div className="test-content">
                      <div className="test-input mb-4">
                        <strong className="block mb-2 text-text-primary text-sm">Input:</strong>
                        <pre className="bg-[rgba(0,0,0,0.8)] p-3 rounded-lg font-fira-code text-sm text-cyber-cyan overflow-x-auto border border-electric-blue shadow-[inset_0_0_10px_rgba(0,191,255,0.2)]">
                          {test.input || 'N/A'}
                        </pre>
                      </div>
                      <div className="test-output">
                        <strong className="block mb-2 text-text-primary text-sm">Output:</strong>
                        <pre className="bg-[rgba(0,0,0,0.8)] p-3 rounded-lg font-fira-code text-sm text-cyber-cyan overflow-x-auto border border-electric-blue shadow-[inset_0_0_10px_rgba(0,191,255,0.2)]">
                          {test.output || 'N/A'}
                        </pre>
                      </div>
                      {test.explanation && (
                        <div className="test-explanation mt-4">
                          <strong className="block mb-2 text-text-primary text-sm">Explanation:</strong>
                          <div
                            className="bg-[rgba(26,26,26,0.3)] p-3 rounded-lg text-sm text-text-primary"
                            dangerouslySetInnerHTML={{ __html: safeFormat(test.explanation) }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {formattedNote && (
            <div className="note-section mb-8">
              <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
                Note
              </h3>
              <div
                className="note-content bg-[rgba(26,26,26,0.3)] p-5 rounded-xl border-l-4 border-electric-purple shadow-[0_4px_15px_rgba(153,50,204,0.2)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-void"
                dangerouslySetInnerHTML={{ __html: formattedNote }}
              ></div>
            </div>
          )}
        </div>
      );
    }

    // Simplified LeetCode rendering without difficulty, tags, time/memory limits
    const formattedDescription = formatLeetCodeDescription(problem.description);

    return (
      <div className="problem-content flex-1 p-6 overflow-y-auto">
        <div className="problem-header p-6 bg-gradient-to-br from-deep-black to-charcoal border-b border-electric-blue relative">
          <div className="problem-title-row flex justify-between items-center mb-4">
            <h1 className="problem-title text-2xl font-bold text-text-primary text-shadow-blue">
              {problem.title || 'Untitled'}
            </h1>
          </div>
        </div>

        {formattedDescription && (
          <div className="description-section mb-8">
            <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
              Problem Description
            </h3>
            <div
              className="problem-description bg-[rgba(26,26,26,0.3)] p-5 rounded-xl border-l-4 border-electric-purple shadow-[0_4px_15px_rgba(153,50,204,0.2)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-void text-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formattedDescription }}
            ></div>
          </div>
        )}

        {problem.sampleTests?.length > 0 && (
          <div className="sample-tests-section mb-8">
            <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
              Examples
            </h3>
            <div className="test-cases">
              {problem.sampleTests.map((example, index) => (
                <div
                  key={index}
                  className="test-case bg-[rgba(26,26,26,0.5)] rounded-xl p-5 mb-5 border border-neon-green shadow-[0_4px_15px_rgba(57,255,20,0.2)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[2px] before:bg-gradient-matrix"
                >
                  <div className="test-header font-semibold mb-4 text-neon-green text-base text-shadow-green">
                    Example {index + 1}:
                  </div>
                  <div className="test-content">
                    <div className="test-input mb-4">
                      <strong className="block mb-2 text-text-primary text-sm">Input:</strong>
                      <pre className="bg-[rgba(0,0,0,0.8)] p-3 rounded-lg font-fira-code text-sm text-cyber-cyan overflow-x-auto border border-electric-blue shadow-[inset_0_0_10px_rgba(0,191,255,0.2)]">
                        {example.input || 'N/A'}
                      </pre>
                    </div>
                    <div className="test-output mb-4">
                      <strong className="block mb-2 text-text-primary text-sm">Output:</strong>
                      <pre className="bg-[rgba(0,0,0,0.8)] p-3 rounded-lg font-fira-code text-sm text-cyber-cyan overflow-x-auto border border-electric-blue shadow-[inset_0_0_10px_rgba(0,191,255,0.2)]">
                        {example.output || 'N/A'}
                      </pre>
                    </div>
                    {example.explanation && example.explanation.trim() && example.explanation !== '​​​​​​​' && (
                      <div className="test-explanation">
                        <strong className="block mb-2 text-text-primary text-sm">Explanation:</strong>
                        <div className="bg-[rgba(26,26,26,0.3)] p-3 rounded-lg text-sm text-text-primary">
                          {example.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {problem.note && problem.note.trim() && (
          <div className="constraints-section mb-8">
            <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
              Constraints
            </h3>
            <div className="constraints-content bg-[rgba(26,26,26,0.3)] p-5 rounded-xl border-l-4 border-electric-purple shadow-[0_4px_15px_rgba(153,50,204,0.2)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-void">
              <ul className="list-none space-y-2 text-text-primary">
                {problem.note
                  .split('\n')
                  .filter(line => line.trim())
                  .map((constraint, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="text-electric-blue mr-3 mt-1">→</span>
                      <span className="font-fira-code">{constraint.trim().replace(/^\t+/, '')}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOutputContent = () => (
    <div className="output-content flex-1 p-6 overflow-y-auto">
      <div className="output-section mb-8">
        <h3 className="text-lg font-bold bg-gradient-plasma bg-clip-text text-transparent border-b-2 border-electric-blue pb-2 mb-4">
          Execution Results
        </h3>
        <div className="output-result bg-[rgba(26,26,26,0.5)] rounded-xl p-5 mb-5 border border-neon-green shadow-[0_4px_15px_rgba(57,255,20,0.2)]">
          <pre className="bg-[rgba(0,0,0,0.8)] p-3 rounded-lg font-fira-code text-sm text-cyber-cyan overflow-x-auto border border-electric-blue shadow-[inset_0_0_10px_rgba(0,191,255,0.2)] whitespace-pre-wrap">
            {output || 'No output available.'}
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="question-panel w-1/2 bg-[rgba(26,26,26,0.9)] backdrop-blur-[15px] border border-electric-blue rounded-l-4 rounded-r-0 flex flex-col overflow-hidden shadow-primary relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-cyber before:opacity-60 max-lg:w-full max-lg:rounded-4 max-lg:m-1 max-lg:h-[40vh]">
      <div className="tab-buttons flex border-b border-electric-blue/40 bg-[rgba(13,13,13,0.8)] px-4 pt-3 pb-0 gap-1">
        <button
          className={`relative px-6 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 rounded-t-lg border-b-2 ${
            activeTab === 'problem'
              ? 'text-neon-pink border-neon-pink bg-neon-pink/5 shadow-[0_-4px_15px_rgba(255,0,64,0.15)]'
              : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('problem')}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeTab === 'problem' ? 'bg-neon-pink shadow-[0_0_8px_rgba(255,0,64,0.8)]' : 'bg-gray-600'}`} />
            Problem
          </span>
        </button>
        <button
          className={`relative px-6 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 rounded-t-lg border-b-2 ${
            activeTab === 'output'
              ? 'text-cyber-cyan border-cyber-cyan bg-cyber-cyan/5 shadow-[0_-4px_15px_rgba(0,255,255,0.1)]'
              : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('output')}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeTab === 'output' ? 'bg-cyber-cyan shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'bg-gray-600'}`} />
            Output
          </span>
        </button>
      </div>
      {activeTab === 'problem' ? renderProblemContent() : renderOutputContent()}
    </div>
  );
}

export default QuestionPanel;
