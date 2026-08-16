import React, { useEffect, useState } from 'react';

const BattleArena = () => {
  const [timer, setTimer] = useState(167); // 2:47 in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 167);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const codeLines = [
    { text: 'def longestCommonSubsequence(text1, text2):', delay: 0.5 },
    { text: '    m, n = len(text1), len(text2)', delay: 1 },
    { text: '    dp = [[0] * (n + 1) for _ in range(m + 1)]', delay: 1.5 },
    { text: '    for i in range(1, m + 1):', delay: 2 },
    { text: '        for j in range(1, n + 1):', delay: 2.5 },
    { text: '            if text1[i-1] == text2[j-1]:', delay: 3 },
    { text: '                dp[i][j] = dp[i-1][j-1] + 1', delay: 3.5 },
    { text: '            else:', delay: 4 },
    { text: '                dp[i][j] = max(dp[i-1][j], dp[i][j-1])', delay: 4.5 },
    { text: '    return dp[m][n]', delay: 5 }
  ];

  const testResults = [
    { text: '$ python algorithm.py', delay: 1 },
    { text: 'Test case 1... PASSED', delay: 1.5, success: true },
    { text: 'Test case 2... PASSED', delay: 2, success: true },
    { text: 'Test case 3... PASSED', delay: 2.5, success: true },
    { text: 'Test case 4... PASSED', delay: 3, success: true },
    { text: 'Test case 5... PASSED', delay: 3.5, success: true },
    { text: 'All tests successful! Runtime: 0.028s', delay: 4, info: true },
    { text: 'Memory usage: 14.7MB', delay: 4.5, info: true },
    { text: 'Solution accepted!', delay: 5, trophy: true }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mt-8">
      {/* Left Coder Panel */}
      <div
        className="rounded-3xl p-8 border-2 border-blue-400 backdrop-blur-[20px] h-[520px] relative transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 transform translate-y-12 hover:transform hover:-translate-y-3 hover:scale-105"
        style={{
          background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.98), rgba(26, 26, 26, 0.95))',
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.3)',
          animation: 'panelSlideUp 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 2.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 25px 80px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 0 30px rgba(0, 191, 255, 0.3)';
        }}
      >
        <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-blue-400">
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 flex items-center justify-center text-2xl text-white font-black"
            style={{
              boxShadow: '0 0 25px #00BFFF',
              animation: 'avatarPulse 3s ease-in-out infinite'
            }}
          >
            A
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Alex_Warrior</h3>
            <div className="text-sm text-cyan-400 font-mono flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-cyan-400"
                style={{ animation: 'statusBlink 1.8s ease-in-out infinite' }}
              ></div>
              <span>Coding intense...</span>
            </div>
          </div>
        </div>

        <div className="bg-black/90 rounded-2xl p-6 h-96 overflow-hidden border-2 border-blue-400 font-mono">
          {codeLines.map((line, index) => (
            <div
              key={index}
              className="text-sm leading-relaxed text-white mb-1 opacity-0 transform -translate-x-8"
              style={{
                animation: `typeReveal 1s ease forwards`,
                animationDelay: `${line.delay}s`
              }}
            >
              <span dangerouslySetInnerHTML={{
                __html: line.text
                  .replace(/def|for|if|else|return|in|range/g, '<span style="color: #9932CC; font-weight: 600;">$&</span>')
                  .replace(/'[^']*'/g, '<span style="color: #00FF41;">$&</span>')
                  .replace(/len|max/g, '<span style="color: #00FFFF;">$&</span>')
                  .replace(/\b\d+\b/g, '<span style="color: #FF4500;">$&</span>')
                  .replace(/text1|text2|dp|m|n|i|j/g, '<span style="color: #FFD700;">$&</span>')
              }} />
              {index === codeLines.length - 1 && (
                <span
                  className="inline-block bg-blue-400 w-0.5 h-5 ml-1"
                  style={{ animation: 'cursorBlink 1.2s step-end infinite' }}
                ></span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* VS Battle Center */}
      <div
        className="flex flex-col items-center relative opacity-0"
        style={{ animation: 'vsReveal 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 3.3s' }}
      >
        <div
          className="rounded-full w-36 h-36 flex items-center justify-center text-5xl font-black text-white relative"
          style={{
            background: 'linear-gradient(135deg, #FF0040 0%, #8A2BE2 50%, #00BFFF 100%)',
            animation: 'vsRotate 8s ease-in-out infinite',
            boxShadow: '0 0 60px #00BFFF, inset 0 0 60px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div
            className="absolute -top-12 bg-black/95 px-7 py-3 rounded-full font-mono text-2xl font-bold text-yellow-400 border-2 border-yellow-400"
            style={{
              boxShadow: '0 0 30px #FFD700',
              animation: 'timerGlow 2s ease-in-out infinite'
            }}
          >
            {formatTime(timer)}
          </div>
          VS
        </div>

        <div className="absolute -bottom-9 flex gap-10 font-mono text-sm">
          <div className="bg-black/90 px-5 py-2 rounded-2xl border border-purple-400 text-white backdrop-blur-[10px]">
            Speed: 102 WPM
          </div>
          <div className="bg-black/90 px-5 py-2 rounded-2xl border border-purple-400 text-white backdrop-blur-[10px]">
            Precision: 96%
          </div>
        </div>
      </div>

      {/* Right Coder Panel */}
      <div
        className="rounded-3xl p-8 border-2 border-green-400 backdrop-blur-[20px] h-[520px] relative transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 transform translate-y-12 hover:transform hover:-translate-y-3 hover:scale-105"
        style={{
          background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.98), rgba(26, 26, 26, 0.95))',
          boxShadow: '0 0 30px rgba(0, 255, 65, 0.3)',
          animation: 'panelSlideUp 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 2.8s'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 25px 80px rgba(0, 255, 65, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 0 30px rgba(0, 255, 65, 0.3)';
        }}
      >
        <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-green-400">
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-2xl text-white font-black"
            style={{
              boxShadow: '0 0 25px #00FF41',
              animation: 'avatarPulse 3s ease-in-out infinite'
            }}
          >
            B
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Beta_Master</h3>
            <div className="text-sm text-green-400 font-mono flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-green-400"
                style={{ animation: 'statusBlink 1.8s ease-in-out infinite' }}
              ></div>
              <span>Testing solutions...</span>
            </div>
          </div>
        </div>

        <div className="bg-black/90 rounded-2xl p-6 h-96 overflow-hidden border-2 border-green-400 font-mono">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`text-sm leading-relaxed mb-2 opacity-0 flex items-center gap-2 ${result.success ? 'text-green-400' :
                  result.info ? 'text-cyan-400' :
                    result.trophy ? 'text-green-400' : 'text-white'
                }`}
              style={{
                animation: `resultSlide 0.8s ease forwards`,
                animationDelay: `${result.delay}s`
              }}
            >
              {result.success && <i className="fas fa-check text-green-400 text-base"></i>}
              {result.trophy && <i className="fas fa-trophy text-yellow-400"></i>}
              <span>{result.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleArena;