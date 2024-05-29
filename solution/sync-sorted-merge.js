"use strict";
const minHeap = require('./lib/min-heap');
const _ = require('lodash');

// Print all entries, across all of the sources, in chronological order.
module.exports = (logSources, printer) => {
  const heap = minHeap.createHeap(logSources);

  // The minheap should always return a source with the oldest log.
  let currentSource = minHeap.removeRoot(heap);
  let currentDate = _.invoke(currentSource, 'last.date.valueOf') || null;

  // The date of the next-oldest log in the source heap. When the current
  // source produces a log more recent than this limit we must replace it.
  let dateLimit = _.get(heap, '[0].value', null);

  while (currentSource) {
    /* If the current source is producing a log older than the earliest
    log in the next-earliest source, replace it. */
    if (dateLimit && currentDate > dateLimit) {
      if (currentSource.drained === false) {
        /* Return the now-outdated but undrained source to the heap. */
        minHeap.insert(heap, currentSource);
      }

      currentSource = minHeap.removeRoot(heap);
      currentDate = _.invoke(currentSource, 'last.date.valueOf') || null;
      dateLimit = _.get(heap, '[0].value', null);
      continue;
    } else {
      printer.print(currentSource.last);
    }

    /* The logic here is probably more complicated than it needs to be, but 
    I faced a bit of a dilemma when looking at the behavior of "pop". The last
    call when a source is exhausted will both update the "last" property AND 
    return false. Log sources are also created with a "last" property that is
    overridden the first time "pop" is called. I wasn't sure if these values
    were intended as part of the exercise, but after some back-and-forth decided 
    to account for them. */
    if (currentSource.drained) {
      currentSource = minHeap.removeRoot(heap);
      currentDate = _.invoke(currentSource, 'last.date.valueOf') || null;
      dateLimit = _.get(heap, '[0].value', null);
    } else {
      currentSource.pop();
      currentDate = _.invoke(currentSource, 'last.date.valueOf') || null;
    }
  }
};
