import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Slash } from "bases/slash";
import { Locales } from "utils/locales";

export default Slash.Create({
    name: "ping",
    type: Slash.SlashType.Command,
    integrations: [Slash.Integration.Guild, Slash.Integration.User],
    contexts: [Slash.Context.Bot, Slash.Context.DM, Slash.Context.Guild],
    description: "Check if the bot is alive",
    category: "Core",
    defer: true,
    async callback(interaction, args) {
        const prisma = new PrismaClient().$extends(withAccelerate());
        
        const start = performance.now();
        await prisma.dummy.count();
        const end = performance.now();
        const latency = Math.round((end - start));
        await prisma.$disconnect();
        
        const l = interaction.locale;
        await interaction.editReply(Locales.Translate("pong", l, [interaction.client.ws.ping, latency]));
    }
});