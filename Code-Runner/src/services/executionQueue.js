/**
 * Factory creating an in-memory task execution queue.
 * Limits max concurrency and queuing thresholds.
 *
 * @param {object} params
 * @param {number} params.maxConcurrent - Maximum tasks allowed to execute simultaneously.
 * @param {number} params.maxQueueSize - Maximum tasks allowed to be waiting in queue.
 * @returns {object} Queue controller methods (`scheduleExecution`, `getStats`).
 */
export function createExecutionQueue({ maxConcurrent, maxQueueSize }) {
  const executionQueue = [];
  let activeExecutions = 0;

  /**
   * Drains the queue by executing queued tasks up to max concurrency limits.
   */
  const drainExecutionQueue = () => {
    while (activeExecutions < maxConcurrent && executionQueue.length > 0) {
      const { task, resolve, reject } = executionQueue.shift();
      activeExecutions += 1;

      Promise.resolve()
        .then(task)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeExecutions -= 1;
          drainExecutionQueue();
        });
    }
  };

  /**
   * Schedules a task to be executed. Rejects if the queue capacity is exceeded.
   * @param {function} task - Async or synchronous task to run.
   * @returns {Promise<any>} Promise resolving with the task outcome.
   */
  const scheduleExecution = (task) => new Promise((resolve, reject) => {
    const isQueueFull = activeExecutions >= maxConcurrent && executionQueue.length >= maxQueueSize;
    if (isQueueFull) {
      const error = new Error("Execution queue is full. Please retry in a few seconds.");
      error.statusCode = 503;
      reject(error);
      return;
    }

    executionQueue.push({ task, resolve, reject });
    drainExecutionQueue();
  });

  return {
    /**
     * Retrieves current active and pending execution counts.
     * @returns {{activeExecutions: number, maxConcurrentExecutions: number, queuedExecutions: number}}
     */
    getStats: () => ({
      activeExecutions,
      maxConcurrentExecutions: maxConcurrent,
      queuedExecutions: executionQueue.length,
    }),
    scheduleExecution,
  };
}
