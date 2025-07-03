import type { ClusterClient } from "status-sharding";

declare module 'discord.js' {
  interface Client {
    cluster: ClusterClient<Client>;
  };
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Object ? DeepPartial<T[K]> : T[K];
};