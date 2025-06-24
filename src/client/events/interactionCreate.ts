import { CommandInteractionOptionResolver, InteractionType, MessageFlags, type CacheType } from "discord.js";
import { Event } from "../../bases/event";
import { Handler } from "../../utils/handler";
import { Slash } from "../../bases/slash";
import { Embed } from "../../utils/embed";
import { Markdown } from "../../utils/markdown";
import { Cooldown } from "../../utils/cooldown";

export default Event.Create("interactionCreate", async function (interaction) {
    switch (interaction.type) {
        case InteractionType.ApplicationCommand:
            console.log(`Received command interaction: ${interaction.commandName}`);
            if (!interaction.isChatInputCommand()) return;
            const slash = Handler.Slashes.Find(interaction.commandName);
            if (!slash) return;
            if (interaction.inCachedGuild() && interaction.guild.members.me) {
                const permissions = slash.body.permissions;
                if (permissions?.client?.length && permissions.client.some(p => interaction.guild.members.me?.permissions.has(p))) {
                    return interaction.reply({
                        content: `I'm missing the following permissions: ${Markdown.Highlight(permissions.client.map(perm => perm).join(', '))}`,
                        flags: MessageFlags.Ephemeral
                    });
                };
                if (permissions?.author?.length && permissions.author.some(p => interaction.member.permissions.has(p))) {
                    return interaction.reply({
                        content: `You're missing the following permissions: ${Markdown.Highlight(permissions.author.map(perm => perm).join(', '))}`,
                        flags: MessageFlags.Ephemeral
                    });
                };
                const data = Cooldown.Get(interaction.user.id, slash.body.name);
                if (data) {
                    const now = Date.now();
                    return interaction.reply({
                        content: `Please wait ${Markdown.Timestamp(now + data, "R")} before using this command again.`,
                        flags: MessageFlags.Ephemeral
                    });
                };
                Cooldown.Set(interaction.user.id, slash.body.name, slash.body.cooldown);
            };
            const incognito = (interaction.options as CommandInteractionOptionResolver<CacheType>).getBoolean("incognito") ?? false;
            if (slash.defer) await interaction.deferReply( slash.ephemeral || incognito ? { flags: MessageFlags.Ephemeral }: {} );
            try {
                await slash.callback(interaction, {
                    name: slash.body.name,
                    description: slash.body.description,
                    body: Slash.GetSlashCommands(interaction.options.data as any, slash.body.body)
                });
            } catch (e) {
                return interaction.reply({
                    embeds: [Embed.Error({
                        description: `Something went wrong while attempting to run this command.\n> ${Markdown.Highlight((e as Error).message)}\n-# Contact support ${Markdown.Link("https://discord.gg/7b234YFhmn", "here")}`
                    })],
                    flags: MessageFlags.Ephemeral
                });
            };
            break;
        case InteractionType.ApplicationCommandAutocomplete:
            console.log(`Received autocomplete interaction: ${interaction.commandName}`);
            if (!slash || !slash.autocomplete || !interaction.isAutocomplete()) return;
            await slash.autocomplete(interaction);
            break;
        case InteractionType.MessageComponent:
            if (interaction.isButton()) {
                console.log(`Received button interaction: ${interaction.customId}`);
                const button = Handler.Components.Find(interaction.customId);
                if (!button) return;
                await button.callback(interaction);
            } else if (interaction.isAnySelectMenu()) {
                console.log(`Received select menu interaction: ${interaction.customId}`);
                const selectMenu = Handler.Components.Find(interaction.customId);
                if (!selectMenu) return;
                await selectMenu.callback(interaction, interaction.values);
            };
            break;
        case InteractionType.ModalSubmit:
            console.log(`Received modal submit interaction: ${interaction.customId}`);
            const modal = Handler.Components.Find(interaction.customId);
            if (!modal) return;
            await modal.callback(interaction);
            break;
    };
});