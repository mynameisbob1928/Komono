import type { ClientEvents } from "discord.js";
import type { EventProps } from "utils/types";

export function Event<T extends keyof ClientEvents>(props: EventProps<T>) {
  return {
    name: props.name,
    type: props.type,
    once: props.once ?? false,
    callback: props.callback
  };
};