import type { ClientEvents } from 'discord.js';
import type { Optional } from 'types/types';

export interface EventProps<T extends keyof ClientEvents> {
  name: string;
  type: T;
  once: boolean;
  run(...args: ClientEvents[T]): any;
}

export default class Event<T extends keyof ClientEvents> {
  public name;
  public type;
  public once;
  public run;

  constructor(props: Optional<EventProps<T>, 'once'>) {
    this.name = props.name;
    this.type = props.type;
    this.once = !!props.once;
    this.run = props.run;
  }
}
