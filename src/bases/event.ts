import type { ClientEvents } from "discord.js";

export namespace Event {
  export type EventProps<T extends keyof ClientEvents = keyof ClientEvents> = {
    name: string;
    type: T;
    once?: boolean;

    callback(...args: ClientEvents[T]): Promise<void>;
  };

  export function Create<T extends keyof ClientEvents>(props: EventProps<T>) {
    return {
      name: props.name,
      type: props.type,
      once: props.once ?? false,
      callback: props.callback
    };
  };
};