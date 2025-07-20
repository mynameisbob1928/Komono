import type { ClusterClient } from 'status-sharding';
import type { Client } from 'discord.js';
import type { ComponentType, EventType, PrefixType, SlashType } from './types';

declare module 'discord.js' {
  interface Client {
    cluster: ClusterClient<Client>;
    events: Collection<string, EventType>;
    slashes: Collection<string, SlashType>;
    prefixes: Collection<string, PrefixType>;
    components: Collection<string, ComponentType>;
    cooldown: Collection<string, Collection<string, number>>;
    prefix: string;
  }
}
