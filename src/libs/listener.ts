import type { Client } from 'discord.js';
import type { EventType } from 'types/types';

export function Bind(client: Client) {
  Unbind(client);

  client.events.forEach((event: EventType) => {
    if (event.once) {
      client.once(event.type, event.run);
    } else {
      client.on(event.type, event.run);
    }
  });
}

export function Unbind(client: Client) {
  client.events.forEach((event: EventType) => client.off(event.type, event.run));
}
