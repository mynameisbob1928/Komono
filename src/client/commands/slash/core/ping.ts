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
        const l = interaction.locale;
        await interaction.editReply(Locales.Translate("pong", l));
    }
});