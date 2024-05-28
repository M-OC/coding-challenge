const LogSource = require("../lib/log-source");
const minHeap = require("../solution/lib/min-heap");

const sourceFactory = (num) => {
  const sources = [];

  for (var i = 0; i < num; i++) {
    let s = new LogSource();
    sources.push(s)
  }

  return sources;
}

const traverseTree = (tree, cb, targetIndex = 0) => {
  const targetNode = tree[targetIndex];
  const edgeIndexes = minHeap.getEdges(targetIndex);

  const edgeNodes = {
    parentNode: tree[edgeIndexes.parentIndex] || null,
    leftNode: tree[edgeIndexes.leftIndex] || null,
    rightNode: tree[edgeIndexes.rightIndex] || null
  };

  cb(targetNode, targetIndex, { edgeIndexes, edgeNodes }, tree);

  if (edgeNodes.leftNode) {
    traverseTree(tree, cb, edgeIndexes.leftIndex);
  }

  if (edgeNodes.rightNode) {
    traverseTree(tree, cb, edgeIndexes.rightIndex);
  }
}

describe("minHeap", () => {
  // The day Steve Urkel first appeared on network television.
  const earliestDate = new Date('Fri Oct 13 1989 21:00:23 GMT-0700 (Pacific Daylight Time)');
  // The day Conan the Barbarian becomes public domain.
  const latestDate = new Date('Fri May 14 2077 21:00:23 GMT-0700 (Pacific Daylight Time)');

  describe("createHeap", () => {
    test("It should produce an array of nodes with values taken from the date of the last entry.", () => {
      const sources = sourceFactory(5);
      const heap = minHeap.createHeap(sources);
      const node = heap[0];

      expect(heap.length).toBe(5);
      expect(node.value).toBeGreaterThan(0);
      expect(node.source).toBeInstanceOf(LogSource);
      expect(node.value).toEqual(node.source.last.date.valueOf())
    });

    test("The root should contain the smallest value in the tree", () => {
      const sources = sourceFactory(10);
      sources[7].last.date = earliestDate;

      const heap = minHeap.createHeap(sources);
      const rootNode = heap[0];

      expect(rootNode.value).toBe(earliestDate.valueOf());
    });

    test("No parent should be greater than a child", () => {
      const sources = sourceFactory(10);
      const heap = minHeap.createHeap(sources);

      const cb = jest.fn((targetNode, targetIndex, { edgeNodes }) => {
        if (edgeNodes.parentNode) {
          expect(targetNode.value).toBeGreaterThanOrEqual(edgeNodes.parentNode.value);
        }
      })

      traverseTree(heap, cb);
      expect(cb.mock.calls.length).toBe(10);
    });
  })

  describe("insert", () => {
    let sources = [];
    let heap = [];

    beforeEach(() => {
      sources = sourceFactory(10);
      heap = minHeap.createHeap(sources);
    });

    test("New nodes should be placed correctly", () => {
      const earlySource = new LogSource();
      const lateSource = new LogSource();

      earlySource.last.date = earliestDate;
      lateSource.last.date = latestDate;

      heap = minHeap.insert(heap, earlySource);
      heap = minHeap.insert(heap, lateSource);

      expect(heap.length).toBe(12);
      expect(heap[0].value).toEqual(earliestDate.valueOf());
      expect(heap[heap.length - 1].value).toEqual(latestDate.valueOf());
    })
  });

  describe("removeRoot", () => {
    let sources = [];
    let heap = [];

    beforeEach(() => {
      sources = sourceFactory(10);
      heap = minHeap.createHeap(sources);
    });

    test("It replaces root with the smallest node when called", () => {
      let root1, root2, root3, root4;

      root1 = minHeap.removeRoot(heap).last.date.valueOf();
      root2 = minHeap.removeRoot(heap).last.date.valueOf();
      root3 = minHeap.removeRoot(heap).last.date.valueOf();
      root4 = heap[0].value;

      expect(root1).toBeLessThanOrEqual(root2);
      expect(root2).toBeLessThanOrEqual(root3);
      expect(root3).toBeLessThanOrEqual(root4);
      expect(heap.length).toEqual(7);
    })

    test("It produces a tree where no parent is less than its child", () => {
      const cb = jest.fn((targetNode, targetIndex, { edgeNodes }) => {
        if (edgeNodes.parentNode) {
          expect(targetNode.value).toBeGreaterThanOrEqual(edgeNodes.parentNode.value);
        }
      })

      minHeap.removeRoot(heap);
      traverseTree(heap, cb);
      expect(cb.mock.calls.length).toBe(9);
    })
  })
})