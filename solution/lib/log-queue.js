const TaskQueue = require('./task-queue');
const Queue = require('./queue');

module.exports = class LogQueue {
  constructor(source, limit = 50) {
    this.source = source;
    this.drained = source.drained;
    this.last = {
      date: source.last.date,
      msg: source.last.msg
    };

    this.limit = limit;
    this.queue = new Queue([source.last]);
    this.tasks = new TaskQueue([], {autoRun: true});
  }

  getLogsIfApplicable() {
    const logCount = this.queue.checkLength();

    if (this.drained === false && logCount < this.limit) {
      this.tasks.addTask(() => {this.addLog()})
    }
  }

  async addLog() {
    const log = await this.source.popAsync();

    if (log === false) {
      this.drained = true;
    } else {
      this.queue.enqueue(log);
    }

    this.getLogsIfApplicable();
  }

  async getLatest() {
    let log = this.queue.dequeue();

    if (log) {
      return log;
    } else {
      return new Promise(resolve => {
        this.tasks.enqueue(resolve)
      }).then(() => this.queue.dequeue())
    }
  }
}