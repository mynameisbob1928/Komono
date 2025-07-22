import { ClusterManager } from 'status-sharding';
import Env from 'libs/env';
import { Log } from 'utils/log';

const client = 'src/client/app.ts';
const token = Env.Required('token');

const manager = new ClusterManager(client, {
  mode: 'process',
  token: token,
  // shardsPerClusters: 4,
  respawn: true,
  heartbeat: {
    enabled: true,
    maxMissedHeartbeats: 2,
    interval: 1000 * 10,
    timeout: 1000 * 12,
  },
  spawnOptions: {
    delay: 6000,
  },
});

process.on('uncaughtException', (error) => {
  Log(error, 'red');
});

process.on('unhandledRejection', (reason, promise) => {
  Log(reason, 'red');
  Log(promise, 'red');
});

process.on('warning', (warning) => {
  Log(warning, 'red');
});

manager.on('clusterCreate', (cluster) => {
  cluster.on('ready', () => {
    Log(`Cluster ${cluster.id} is ready!`, 'green');
  });

  cluster.on('death', (cluster) => {
    Log(`Cluster ${cluster.id} died.`, 'red');
  });
});

await manager.spawn();
