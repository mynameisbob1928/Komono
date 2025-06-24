import { Slash } from "../../../../bases/slash";
import { i18n } from "../../../../utils/i18n";

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
        await interaction.editReply(i18n.Translate("pong", l));
    }
});