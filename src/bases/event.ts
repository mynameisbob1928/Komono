import type { ClientEvents } from "discord.js";

export namespace Event {
  export function Create<T extends keyof ClientEvents>(type: T, callback: (...args: ClientEvents[T]) => void) {
    return {
      type,
      callback
    };
  };
};