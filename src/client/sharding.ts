import { ClusterManager } from 'status-sharding';
import { Env } from 'utils/env';

const client = 'src/client/app.ts';
const token = Env.Required("token").ToString();

const manager = new ClusterManager(client, {
    mode: "process",
    token: token,
    // shardsPerClusters: 4,
    // Auto for now cause little bot
    respawn: true,
    heartbeat: {
        enabled: true,
        maxMissedHeartbeats: 2,
        interval: 1000 * 10,
        timeout: 1000 * 12
    },
    spawnOptions: {
        delay: 6000
    }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "Reason:", reason);
});

process.on("warning", (warning) => {
  console.warn(`WARNING: ${warning.name} : ${warning.message}`);
});

manager.on("clusterCreate", (cluster) => {
    cluster.on("death", (shard) => {
        console.error(`Cluster ${shard.id} died.`)
    });
});

await manager.spawn();