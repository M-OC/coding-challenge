const stub = () => {}

class Queue {
  constructor(itemArr = [], options = {}) {
    this.items = {};
    this.headIndex = 0;
    this.tailIndex = 0;
    this.onDrain = options.onDrain || stub;

    itemArr.forEach(el => {
      this.items[this.tailIndex] = el;
      this.tailIndex++;
    })
  }

  enqueue(item) {
    this.items[this.tailIndex] = item;
    this.tailIndex++;
  }

  dequeue() {
    if (this.headIndex === this.tailIndex) {
      return this.onDrain();
    } else {
      const item = this.items[this.headIndex];

      delete this.items[this.headIndex];
      this.headIndex++;
      return item;
    }
  }

  check() {
    return this.items[this.headIndex];
  }

  checkLength() {
    return this.tailIndex - this.headIndex;
  }
}

module.exports = Queue;