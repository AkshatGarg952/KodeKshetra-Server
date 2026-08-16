import React from 'react';

const ErrorFormatter = ({ data }) => {
    if (!data) return null;

    const { errorType, message, result, stats } = data;

    if (!data.isError && stats) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 text-lg font-semibold">
                    <i className="fas fa-check-circle text-2xl"></i>
                    <span>{message}</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="text-gray-400 mb-1">Test Cases</div>
                            <div className="text-green-400 font-mono text-lg">
                                {stats.passedTests}/{stats.totalTests}
                            </div>
                        </div>
                        {stats.avgTime && (
                            <div>
                                <div className="text-gray-400 mb-1">Avg Time</div>
                                <div className="text-blue-400 font-mono text-lg">{stats.avgTime}s</div>
                            </div>
                        )}
                        {stats.maxMemory && (
                            <div>
                                <div className="text-gray-400 mb-1">Max Memory</div>
                                <div className="text-purple-400 font-mono text-lg">{stats.maxMemory} KB</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!data.isError) {
        return (
            <div className="flex items-center gap-2 text-green-400 text-lg font-semibold">
                <i className="fas fa-check-circle text-2xl"></i>
                <span>{message}</span>
            </div>
        );
    }

    const getErrorColor = () => {
        switch (errorType) {
            case 'Compilation Error':
                return 'blue';
            case 'Time Limit Exceeded':
                return 'yellow';
            case 'Memory Limit Exceeded':
                return 'purple';
            case 'Wrong Answer':
                return 'orange';
            default:
                return 'red';
        }
    };

    const color = getErrorColor();
    const colorClasses = {
        red: 'text-red-400 border-red-500/30 bg-red-500/10',
        blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        orange: 'text-orange-400 border-orange-500/30 bg-orange-500/10'
    };

    const getErrorIcon = () => {
        switch (errorType) {
            case 'Compilation Error':
                return <i className="fas fa-wrench"></i>;
            case 'Time Limit Exceeded':
                return <i className="fas fa-clock"></i>;
            case 'Memory Limit Exceeded':
                return <i className="fas fa-memory"></i>;
            case 'Wrong Answer':
                return <i className="fas fa-times-circle"></i>;
            default:
                return <i className="fas fa-exclamation-triangle"></i>;
        }
    };

    const getHint = () => {
        switch (errorType) {
            case 'Compilation Error':
                return 'Check your syntax and make sure all variables are properly declared.';
            case 'Time Limit Exceeded':
                return 'Your solution is too slow. Consider optimizing your algorithm or using a more efficient approach.';
            case 'Memory Limit Exceeded':
                return 'Your solution uses too much memory. Try to optimize your data structures.';
            case 'Wrong Answer':
                return 'Your output doesn\'t match the expected result. Review your logic and test with the given input.';
            case 'Runtime Error (SIGSEGV)':
                return 'Segmentation fault usually means you\'re accessing invalid memory. Check array bounds and pointer usage.';
            case 'Runtime Error (SIGFPE)':
                return 'Check for division by zero or invalid arithmetic operations.';
            default:
                return 'Review your code and try again.';
        }
    };

    return (
        <div className="space-y-3">
            <div className={`flex items-center gap-2 ${colorClasses[color].split(' ')[0]} text-lg font-semibold`}>
                <span className="text-2xl">{getErrorIcon()}</span>
                <span>{errorType}</span>
            </div>

            <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
                <div className="text-gray-200 mb-3">{message}</div>

                {result && (
                    <div className="space-y-3">
                        {result.testCaseNumber && (
                            <div className="text-sm text-gray-400">
                                Failed on Test Case #{result.testCaseNumber} of {result.totalTests}
                            </div>
                        )}

                        {result.input && (
                            <div>
                                <div className="text-xs text-gray-400 mb-1 font-semibold">Input:</div>
                                <div className="bg-gray-900/70 rounded p-3 font-mono text-sm text-gray-200 whitespace-pre-wrap break-all">
                                    {result.input}
                                </div>
                            </div>
                        )}

                        {result.expectedOutput !== undefined && result.actualOutput !== undefined && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1 font-semibold">Expected Output:</div>
                                    <div className="bg-gray-900/70 rounded p-3 font-mono text-sm text-green-400 whitespace-pre-wrap break-all">
                                        {result.expectedOutput || '(empty)'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 mb-1 font-semibold">Your Output:</div>
                                    <div className="bg-gray-900/70 rounded p-3 font-mono text-sm text-red-400 whitespace-pre-wrap break-all">
                                        {result.actualOutput || '(empty)'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {result.detailedError && errorType === 'Compilation Error' && (
                            <div>
                                <div className="text-xs text-gray-400 mb-1 font-semibold">Compiler Output:</div>
                                <div className="bg-gray-900/70 rounded p-3 font-mono text-xs text-red-300 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">
                                    {result.detailedError}
                                </div>
                            </div>
                        )}

                        {result.detailedError && errorType.startsWith('Runtime Error') && (
                            <div>
                                <div className="text-xs text-gray-400 mb-1 font-semibold">Error Details:</div>
                                <div className="bg-gray-900/70 rounded p-3 font-mono text-xs text-red-300 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">
                                    {result.detailedError}
                                </div>
                            </div>
                        )}

                        {(result.executionTime !== null || result.memoryUsed !== null) && (
                            <div className="flex gap-4 text-sm pt-2 border-t border-gray-700">
                                {result.executionTime !== null && (
                                    <div>
                                        <span className="text-gray-400">Time: </span>
                                        <span className="text-blue-400 font-mono">{result.executionTime}s</span>
                                    </div>
                                )}
                                {result.memoryUsed !== null && (
                                    <div>
                                        <span className="text-gray-400">Memory: </span>
                                        <span className="text-purple-400 font-mono">{result.memoryUsed} KB</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400">Hint:</div>
                    <div className="text-sm text-gray-300 mt-1">{getHint()}</div>
                </div>
            </div>
        </div>
    );
};

export default ErrorFormatter;
