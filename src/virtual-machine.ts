import vm from "vm";
import { Attribute } from "./models/attribute";
import { Entity } from "./models/entity";
import { World } from "./world";
import { Writable } from "stream";
import { ConnectionQueue } from "./connection";
import { Console } from "console";

const scriptCache: Record<string, vm.Script> = {};

const contextOptions: vm.CreateContextOptions = {
  codeGeneration: {
    strings: false,
    wasm: false,
  },
};

const runScriptOptions: vm.RunningScriptOptions = {
  timeout: 100,
};

export function compileString(script: string, filename = "immediate") {
  console.debug(`Compiling ${script}`);
  const compiledScript = new vm.Script(script, { filename });
  return compiledScript;
}

export function compileAttribute(attribute: Attribute) {
  const scriptId = `#${attribute.owner.id}.#${attribute.name}`;
  if (typeof attribute.value !== "string") {
    throw new Error(`VM error: attribute ${scriptId} is not a string.`);
  }

  console.debug(`Compiling ${scriptId}`);
  const compiledScript = compileString(attribute.value, scriptId);
  scriptCache[scriptId] = compiledScript;
  return compiledScript;
}

function getAllGameProperties(world: World, thing: Entity, target: Entity) {
  console.log(`${target}: getAllGameProperties`);
  const invalidKeys = ["attributes", "client"];
  const t = world.database.getEntityById(thing.id);
  if (!t) {
    throw new Error(`Object #${target.id} does not exist.`);
  }
  console.log("0", Object.keys(t));
  console.log(t);
  const keys = Object.keys(t)
    //    .filter((key) => typeof (t as any)[key] !== "object")
    .filter((key) => !invalidKeys.includes(key));
  console.log("1", t.attributes.keys());
  console.log("2", keys);
  keys.push(...t.attributes.keys());
  console.log("3", keys);
  return new Set<string>(keys);
}

function createEntityProxy(world: World, thing: Entity) {
  return new Proxy(thing, {
    get: function (target, prop, receiver) {
      console.log("get", target, prop, receiver);
      const t = world.database.getEntityById(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      if (typeof prop !== "string") {
        return undefined;
      }
      let value: any;
      if (prop in t) {
        if (typeof (t as any)[prop] === "object") {
          return undefined;
        }

        value = (t as any)[prop];
      }
      if (value === undefined) {
        value = t.attributes.get(prop);
        if (value) {
          value = value.value;
        }
      }
      /*
      if (isDbRef(value)) {
        const refenencedEntity = world.database.getEntityById(value);
        if (!refenencedEntity) {
          return undefined;
        }
        value = createEntityProxy(world, refenencedEntity);
      }
        */
      console.log({ prop, value });
      return value;
    },
    set: function (target, prop, value, receiver) {
      console.log("set", target, prop, value, receiver);
      const t = world.database.getEntityById(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      console.log("in", prop in t);
      if (prop in t) {
        return false;
      }
      console.log(typeof prop);
      if (typeof prop !== "string") {
        return false;
      }
      t.setAttribute(prop, value);
      return true;
    },
    ownKeys: function (target: Entity) {
      return [...getAllGameProperties(world, thing, target)];
    },
    getOwnPropertyDescriptor(
      target: Entity,
      property: string
    ): PropertyDescriptor | undefined {
      const properties = getAllGameProperties(world, thing, target);
      console.log("properties", properties);
      if (!properties.has(property)) {
        return undefined;
      }
      const descriptor: PropertyDescriptor = {
        enumerable: true,
        configurable: true,
      };
      return descriptor;
    },
  });
}

class ConnectionStream extends Writable {
  constructor(public world: World) {
    super();
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    this.world.connections;
    callback();
  }
}

export class VirtualMachine {
  constructor(public world: World) {}

  connectionStream(queue: ConnectionQueue) {
    return new (class extends Writable {
      constructor(public queue: ConnectionQueue) {
        super();
      }

      _write(
        chunk: any,
        encoding: BufferEncoding,
        callback: (error?: Error | null | undefined) => void
      ): void {
        queue.add(chunk.toString());
        callback();
      }
    })(queue);
  }

  executeScript(actor: Entity, script: string) {
    console.log("Executing", script);
    const compiledScript = compileString(script);
    const actorProxy = createEntityProxy(this.world, actor);
    const connection = this.world.connections.get(actor);
    const consoleStream = connection
      ? this.connectionStream(connection.output)
      : process.stdout;

    console.debug(`Creating VM context`);
    const context = vm.createContext(
      {
        me: actorProxy,
        console: new Console({ stdout: consoleStream }),
      },
      contextOptions
    );
    console.debug(`Running`);
    const result = compiledScript.runInContext(context, runScriptOptions);
    console.debug({ context });

    return result;
  }
}
