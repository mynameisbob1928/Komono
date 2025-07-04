import { Collection } from "discord.js";

export namespace Cooldown {
  const Base = 1000;

  const Cache = new Collection<string, Collection<string, number>>();

  export function Get(user: string, command: string) {
    const userCooldowns = Cache.get(user);
    if (!userCooldowns) return 0;

    const cdEnd = userCooldowns.get(command) || 0;
    const now = Date.now();

    if (cdEnd > now) {
      return cdEnd - now;
    }

    return 0;
  };

  export function Set(user: string, command: string, cooldown = Base) {
    const userCooldowns = Cache.get(user) || new Collection<string, number>();
    
    userCooldowns.set(command, Date.now() + cooldown);
    
    return Cache.set(user, userCooldowns);
  };
};