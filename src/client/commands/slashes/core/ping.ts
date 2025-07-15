import { Slash } from "bases/slash";
import { Routes } from "discord.js";
import { Prisma } from "utils/database";
import { Translate } from "utils/locales";

export default Slash({
    body: {
        name: "ping",
        type: "Command",
        integrations: ["Guild", "User"],
        contexts: ["Guild", "DM", "Bot"],
        description: "Check if the bot is alive",
        category: "Core",
        cooldown: 3000,
    },
    defer: true,
    async callback(interaction, args) {
        // REST
        const restStart = performance.now();
        await interaction.client.rest.get(Routes.user("@me"));
        const restLatency = Math.round((performance.now() - restStart));

        // Database      
        const dbStart = performance.now();
        await Prisma.dummy.count();
        const dbLatency = Math.round((performance.now() - dbStart));
        
        const l = interaction.locale;
        await interaction.editReply(Translate("pong", l, [(interaction.guild?.shardId ?? "N/A"), interaction.client.ws.ping, restLatency, dbLatency]));
    }
});