import { ClusterManager } from 'status-sharding';
import { Required } from 'utils/env';
import { Write } from 'utils/log';

const client = 'src/client/app.ts';
const token = Required("token").ToString();

const manager = new ClusterManager(client, {
    mode: "process",
    token: token,
    // shardsPerClusters: 4,
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
  Write(`Uncaught Exception: ${error}`, "red");
});

process.on("unhandledRejection", (reason, promise) => {
  Write(`Unhandled Rejection at: ${promise} with the reason: ${reason}`, "red");
});

process.on("warning", (warning) => {
  Write(`WARNING: ${warning.name} : ${warning.message}`, "red");
});

manager.on("clusterCreate", (cluster) => {
  cluster.on("ready", () => {
    Write(`Cluster ${cluster.id} is ready!`, "green")
  });

  cluster.on("death", (cluster) => {
    Write(`Cluster ${cluster.id} died.`, "red")
  });
});

await manager.spawn();