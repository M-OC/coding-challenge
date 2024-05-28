const getParentIndex = i => Math.floor((i - 1) / 2);
const getLeftIndex = i => (2 * i) + 1;
const getRightIndex = i => getLeftIndex(i) + 1;

const getEdges = i => ({
  parentIndex: getParentIndex(i),
  leftIndex: getLeftIndex(i),
  rightIndex: getRightIndex(i)
});

const createNode = (source) => {
  if (source.drained) {
    throw new Error('Source already drained')
  }

  const value = parseInt(source.last.date.valueOf());

  return {
    source,
    value
  }
}

const createHeap = (sourceArr) => {
  let nodes = sourceArr.map(createNode);

  const lastNonLeafIndex = Math.floor((nodes.length / 2) - 1)

  for (let i = lastNonLeafIndex; i >= 0; i--) {
    nodes = heapify(nodes, i);
  }

  return nodes;
}

const swap = (nodes, indexA, indexB) => {
  const temp = nodes[indexA];

  nodes[indexA] = nodes[indexB];
  nodes[indexB] = temp;
}

const heapify = (nodes, rootIndex) => {
  const { leftIndex, rightIndex } = getEdges(rootIndex);
  let nextIndex = rootIndex;

  const leftNode = nodes[leftIndex] || null;
  const rightNode = nodes[rightIndex] || null;

  if (leftNode && leftNode.value < nodes[nextIndex].value) {
    nextIndex = leftIndex;
  }

  if (rightNode && rightNode.value < nodes[nextIndex].value) {
    nextIndex = rightIndex;
  }

  if (nextIndex !== rootIndex) {
    swap(nodes, rootIndex, nextIndex);
    return heapify(nodes, nextIndex);
  }

  return nodes;
};

const insert = (heap, source) => {
  const node = createNode(source);

  const updateParents = (nodes, targetIndex) => {
    const targetNode = nodes[targetIndex];
    const parentIndex = getParentIndex(targetIndex);
    const parentNode = nodes[parentIndex] || null;

    if (parentNode && parentNode.value > targetNode.value) {
      swap(nodes, targetIndex, parentIndex);
      return updateParents(nodes, parentIndex);
    }

    return nodes;
  }

  heap.push(node);

  return updateParents(heap, heap.length - 1)
};

const removeRoot = (heap) => {
  if (heap.length === 0) {
    return null;
  }

  if (heap.length <= 2) {
    return heap.shift().source;
  }

  swap(heap, 0, heap.length - 1);
  const root = heap.pop();
  
  heapify(heap, 0)

  return root.source;
};

module.exports = {
  createHeap,
  heapify,
  insert,
  removeRoot,
  getEdges
}