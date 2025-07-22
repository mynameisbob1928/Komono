import Prefix from 'bases/prefix';
import Prisma from 'libs/database';
import Redis from 'libs/cache';
import { Routes } from 'discord.js';

export default new Prefix({
  name: 'ping',
  description: 'Check if the bot is alive',
  cooldown: 3,
  // cache: true,
  async run(client, message, args) {
    // REST
    const restStart = performance.now();
    await client.rest.get(Routes.user('@me'));
    const restLatency = Math.round(performance.now() - restStart);

    // Database
    const databaseStart = performance.now();
    await Prisma.dummy.count({ cacheStrategy: { ttl: 120, swr: 60 } });
    const databaseLatency = Math.round(performance.now() - databaseStart);

    // Cache
    const cacheStart = performance.now();
    await Redis.ping();
    const cacheLatency = Math.round(performance.now() - cacheStart);

    // WS
    const wsLatency = client.ws.ping;

    await message.reply(
      `Pong!\n-# Gateway (Shard ${message.guild?.shardId ?? 'N/A'}): **${wsLatency}ms** ・ REST: **${restLatency}ms** ・ Database: **${databaseLatency}ms** ・ Cache: **${cacheLatency}ms**`,
    );
  },
});
