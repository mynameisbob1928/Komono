import type { ClusterClient } from "status-sharding";

declare module 'discord.js' {
  interface Client {
    cluster: ClusterClient<Client>;
    events: Collection<string, Handler.EventType>;
    slashes: Collection<string, Handler.SlashType>;
    prefixes: Collection<string, Handler.PrefixType>;
    components: Collection<string, Handler.ComponentType>;
    prefix: string;
  };
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Object ? DeepPartial<T[K]> : T[K];
};