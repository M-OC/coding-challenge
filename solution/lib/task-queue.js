const Queue = require('./queue')

class TaskQueue extends Queue {
  constructor(taskArr, options) {
    super(taskArr, options)

    this.autoRun = options.autoRun || false;
    this.running = false;
  }

  async runTasks() {
    if (this.running) {
      return
    }

    this.running = true;
    let currentTask = this.dequeue();

    while (currentTask) {
      await currentTask();
      currentTask = this.dequeue();
    }

    this.running = false;
  }

  addTask(taskFn) {
    this.enqueue(taskFn);

    if (this.autoRun && this.running === false) {
      this.runTasks();
    }
  }
}

module.exports = TaskQueue;