import { Prefix } from "bases/prefix";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export default Prefix.Create({
    name: "ping",
    description: "Check if the bot is alive",
    category: "Core",
    cooldown: 3000,
    async callback(client, message, args) {
        const prisma = new PrismaClient().$extends(withAccelerate());
        
        const start = performance.now();
        await prisma.dummy.count();
        const end = performance.now();
        const latency = Math.round((end - start));
        await prisma.$disconnect();

        await message.reply(`Pong!\n-# Latency: ${client.ws.ping}ms | Database: ${latency}ms`);
    }
});