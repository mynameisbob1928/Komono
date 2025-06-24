import { Slash } from "../../../../bases/slash";
import { Locales } from "../../../../utils/locales";

export default Slash.Create({
    body: {
        name: "ping",
        description: "Check if the bot is alive",
        category: "Core",
        cooldown: 5000,
        integrations: [Slash.IntegrationsTypes.Guild, Slash.IntegrationsTypes.User],
        contexts: [Slash.ContextsTypes.Guild, Slash.ContextsTypes.DM, Slash.ContextsTypes.Bot],
        type: Slash.SlashTypes.Command,
        body: {}
    },
    defer: true,
    async callback(interaction, args) {
        const l = interaction.locale;
        await interaction.editReply(Locales.Translate("pong", l));
    }
});