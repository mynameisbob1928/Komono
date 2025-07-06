import { Slash } from "bases/slash";
import { Routes } from "discord.js";
import Prisma from "utils/database";
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
        // REST
        const restStart = performance.now();
        await interaction.client.rest.get(Routes.user("@me"));
        const restLatency = Math.round((performance.now() - restStart));

        // Database      
        const dbStart = performance.now();
        await Prisma.dummy.count();
        const dbLatency = Math.round((performance.now() - dbStart));
        
        const l = interaction.locale;
        await interaction.editReply(Locales.Translate("pong", l, [(interaction.client.cluster.id ?? "N/A"), interaction.client.ws.ping, restLatency, dbLatency]));
    }
});