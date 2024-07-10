import { Entity } from "./models/entity";

export abstract class Connection {
  constructor(public entity: Entity) {}

  input = new ConnectionQueue();

  output = new ConnectionQueue();

  abstract send(text: string): void;

  sendAll() {
    let text: string | undefined;
    while ((text = this.output.pop())) {
      this.send(text);
    }
  }
}

export class ConnectionQueue {
  queue: string[] = [];

  add(text: string) {
    this.queue.push(text);
  }

  pop() {
    return this.queue.shift();
  }

  peek() {
    return this.queue[0];
  }

  flush() {
    this.queue.length = 0;
  }
}
