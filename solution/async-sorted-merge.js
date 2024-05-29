"use strict";
const minHeap = require('./lib/min-heap');
const LogQueue = require('./lib/log-queue');
const _ = require('lodash');

// Print all entries, across all of the *async* sources, in chronological order.
module.exports = async (logSources, printer) => {
  const logQueues = logSources.map(source => {
    const queue = new LogQueue(source, 100);
    // Begin pre-emptively fetching logs.
    queue.getLogsIfApplicable();

    return queue;
  });

  const heap = minHeap.createHeap(logQueues);

  let currentSource = minHeap.removeRoot(heap);

  while (currentSource) {
    let currentLog = await currentSource.checkLatest();
    let currentDate = currentLog.date.valueOf();
    let dateLimit = _.get(heap, '[0].value', null);

    if (dateLimit && currentDate > dateLimit) {
      if (currentSource.drained === false) {
        minHeap.insert(heap, currentSource);
      }

      currentSource = minHeap.removeRoot(heap);
      currentLog = await currentSource.checkLatest();
      currentDate = currentLog.date.valueOf();
      dateLimit = _.get(heap, '[0].value', null);

      continue;
    } else {
      let pulledLog = await currentSource.getLatest();
      printer.print(pulledLog);
    }

    if (currentSource.drained) {
      currentSource = minHeap.removeRoot(heap);
      dateLimit = _.get(heap, '[0].value', null);
    }
  }
};
