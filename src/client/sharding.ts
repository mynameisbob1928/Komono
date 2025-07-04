import { ClusterManager } from 'status-sharding';
import { Env } from 'utils/env';
import { Log } from 'utils/log';

const client = 'src/client/app.ts';
const token = Env.Required("token").ToString();

const manager = new ClusterManager(client, {
    mode: "process",
    token: token,
    shardsPerClusters: 4,
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
  Log.Write(`Uncaught Exception: ${error}`);
});

process.on("unhandledRejection", (reason, promise) => {
  Log.Write(`Unhandled Rejection at: ${promise} Reason: ${reason}`);
});

process.on("warning", (warning) => {
  Log.Write(`WARNING: ${warning.name} : ${warning.message}`);
});

manager.on("clusterCreate", (cluster) => {
    cluster.on("death", (shard) => {
        Log.Write(`Cluster ${shard.id} died.`)
    });
});

await manager.spawn();