import type { ClusterClient } from "status-sharding";

declare module 'discord.js' {
  interface Client {
    cluster: ClusterClient<Client>;
  };
};