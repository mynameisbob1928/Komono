import { Slash } from "../../../../bases/slash";
import { Locales } from "../../../../utils/locales";

export default Slash.Create({
    name: "ping",
    type: Slash.SlashTypes.Command,
    integrations: [Slash.IntegrationsTypes.Guild, Slash.IntegrationsTypes.User],
    contexts: [Slash.ContextsTypes.Bot, Slash.ContextsTypes.DM, Slash.ContextsTypes.Guild],
    description: "Check if the bot is alive",
    category: "Core",
    defer: true,
    async callback(interaction, args) {
        const l = interaction.locale;
        await interaction.editReply(Locales.Translate("pong", l));
    }
});