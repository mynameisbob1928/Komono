import { Collection, type Client } from 'discord.js';
import { SmallPill, Timestamp } from './markdown';

export namespace Cooldown {
  export function Check(client: Client, id: string, command: string, cooldown: number) {
    const now = Date.now();

    let userCd = client.cooldown.get(id);

    if (!userCd) {
      userCd = new Collection<string, number>();
      client.cooldown.set(id, userCd);
    }

    const expiresAt = userCd.get(command) || 0;

    if (expiresAt > now) {
      throw new Error(`Please wait ${Timestamp(expiresAt, 'R')} before reusing the ${SmallPill(command)} command!`);
    }

    userCd.set(command, now + cooldown * 1000);
  }
}
