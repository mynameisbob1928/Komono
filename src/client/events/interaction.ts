import { CommandInteractionOptionResolver, InteractionType, MessageFlags, type CacheType } from "discord.js";
import { Event } from "../../bases/event";
import { Handler } from "../../utils/handler";
import { Slash } from "../../bases/slash";
import { Embed } from "../../utils/embed";
import { Markdown } from "../../utils/markdown";
import { Cooldown } from "../../utils/cooldown";
import { Env } from "../../utils/env";

export default Event.Create({
    name: "interaction",
    type: "interactionCreate",
    async callback(interaction) {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                if (!interaction.isChatInputCommand()) return;
                console.log(`Received command interaction: ${interaction.commandName}`);
                const command = Handler.Slashes.Find(interaction.commandName);
                if (!command) return;
                const dev = Env.Required("dev").ToArray();
                if (interaction.inCachedGuild()) {
                    const permissions = command.body.permissions;
                    if (permissions?.client?.length && permissions.client.some(p => interaction.guild.members.me?.permissions.has(p))) {
                        await interaction.reply({
                            content: `I'm missing the following permissions: ${Markdown.Highlight(permissions.client.map(perm => perm).join(', '))}`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                    if (permissions?.author?.length && permissions.author.some(p => interaction.member.permissions.has(p))) {
                        await interaction.reply({
                            content: `You're missing the following permissions: ${Markdown.Highlight(permissions.author.map(perm => perm).join(', '))}`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                    const data = Cooldown.Get(interaction.user.id, command.body.name);
                    if (data && !dev.includes(interaction.user.id)) {
                        const now = Date.now();
                        await interaction.reply({
                            content: `Please wait ${Markdown.Timestamp(now + data, "R")} before using this command again.`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                    Cooldown.Set(interaction.user.id, command.body.name, command.body.cooldown);
                };
                const incognito = (interaction.options as CommandInteractionOptionResolver<CacheType>).getBoolean("incognito") ?? false;
                if (command.defer) {
                    await interaction.deferReply( command.ephemeral || incognito ? { flags: MessageFlags.Ephemeral }: {} );
                };
                try {
                    await command.callback(interaction, {
                        name: command.body.name,
                        description: command.body.description,
                        body: Slash.GetSlashCommands(interaction.options.data as any, command.body.body)
                    });
                } catch (e) {
                    await interaction.reply({
                        embeds: [Embed.Error({
                            description: `Something went wrong while attempting to run this command.\n${Markdown.Codeblock("ansi", (e as Error).message)}\n-# Contact support ${Markdown.Link("https://discord.gg/7b234YFhmn", "here")}`
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                };
                break;
            case InteractionType.ApplicationCommandAutocomplete:
                console.log(`Received autocomplete interaction: ${interaction.commandName}`);
                if (!command || !command.autocomplete || !interaction.isAutocomplete()) return;
                await command.autocomplete(interaction);
                break;
            case InteractionType.MessageComponent:
                const [name, ...args] = interaction.customId.split("_");
                if (!name || !args) return;
                if (interaction.isButton()) {
                    console.log(`Received button interaction: ${interaction.customId}`);
                    const button = Handler.Components.Find(name);
                    if (!button) return;
                    await button.callback(interaction, args);
                } else if (interaction.isAnySelectMenu()) {
                    console.log(`Received select menu interaction: ${interaction.customId}`);
                    const menu = Handler.Components.Find(name);
                    if (!menu) return;
                    await menu.callback(interaction, args);
                };
                break;
            case InteractionType.ModalSubmit:
                console.log(`Received modal submit interaction: ${interaction.customId}`);
                const [modalName, ...modalArgs] = interaction.customId.split("_");
                if (!modalName || !modalArgs) return;
                const modal = Handler.Components.Find(modalName);
                if (!modal) return;
                await modal.callback(interaction, modalArgs);
        };
    }
});