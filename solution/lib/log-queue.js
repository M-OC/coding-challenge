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

  updateLast() {
    this.last = this.queue.check() || this.last;
  }

  getLogsIfApplicable() {
    const logCount = this.queue.checkLength();

    if (this.drained === false && logCount < this.limit) {
      this.tasks.addTask(() => this.addLog())
    }
  }

  async addLog() {
    const log = await this.source.popAsync();

    if (log === false) {
      this.drained = true;
    } else {
      this.queue.enqueue(log);
    }

    this.updateLast();
    this.getLogsIfApplicable();
  }

  async checkLatest() {
    let log = this.queue.check();

    if (log) {
      return log;
    } else {
      return new Promise(resolve => {
        this.tasks.addTask(() => this.addLog())
        this.tasks.addTask(resolve)
      }).then(() => {
        return this.queue.check();
      })
    }
  }

  async getLatest() {
    const log = this.queue.dequeue();

    if (log) {
      this.getLogsIfApplicable();
      this.updateLast();
      return log;
    } else {

      return new Promise(resolve => {
        this.tasks.addTask(() => this.addLog())
        this.tasks.addTask(resolve)
      }).then(() => {
        const log = this.queue.dequeue();
        this.updateLast();
        return log;
      })
    }
  }
}