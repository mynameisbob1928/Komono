import Slash from "bases/slash";
import Prisma from "libs/database";
import { Routes } from "discord.js";

export default new Slash({
    name: "ping",
    description: "Check if the bot is alive",
    cooldown: 3,
    integrations: ["guild", "user"],
    contexts: ["guild", "bot", "DM"],
    body: {},
    defer: true,
    async run(interaction, options) {
        // REST
        const restStart = performance.now();
        await interaction.client.rest.get(Routes.user("@me"));
        const restLatency = Math.round(performance.now() - restStart);

        // Database
        const databaseStart = performance.now();
        await Prisma.dummy.count();
        const databaseLatency = Math.round(performance.now() - databaseStart);

        // WS
        const wsLatency = interaction.client.ws.ping;

        await interaction.editReply(`Pong!\n-# Gateway (Shard ${interaction.guild?.shardId ?? "N/A"}): **${wsLatency}ms** ・ REST: **${restLatency}ms** ・ Database: **${databaseLatency}ms**`);
    }
});