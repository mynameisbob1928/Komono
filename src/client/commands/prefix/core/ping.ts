import { Prefix } from "bases/prefix";
import { Routes } from "discord.js";
import { Button } from "utils/button";
import Prisma from "utils/database";

export default Prefix.Create({
    name: "ping",
    description: "Check if the bot is alive",
    category: "Core",
    cooldown: 3000,
    async callback(client, message, args) {
        // REST
        const restStart = performance.now();
        await client.rest.get(Routes.user("@me"));
        const restLatency = Math.round((performance.now() - restStart));

        // Database      
        const dbStart = performance.now();
        await Prisma.dummy.count();
        const dbLatency = Math.round((performance.now() - dbStart));

        await message.reply({ content: `Pong!\n-# Gateway (Shard ${message.guild?.shardId ?? "N/A"}): **${client.ws.ping}ms** ・ REST: **${restLatency}ms** ・ Database: **${dbLatency}ms**` });
    }
});