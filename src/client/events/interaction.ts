import { CommandInteractionOptionResolver, InteractionType, MessageFlags, type CacheType, type PermissionResolvable } from "discord.js";
import { Event } from "bases/event";
import { Slash } from "bases/slash";
import { Cooldown } from "utils/cooldown";
import { Env } from "utils/env";
import { Handler } from "utils/handler";
import { Markdown } from "utils/markdown";
import { Embed } from "utils/embed";
import { Log } from "utils/log";

export default Event.Create({
    name: "interaction",
    type: "interactionCreate",
    async callback(interaction) {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                if (!interaction.isChatInputCommand()) return;
                const command = Handler.Slashes.Find(interaction.client, interaction.commandName);
                if (!command) return;
                Log.Write(`Received command interaction: ${command.name}`, "green");
                const dev = Env.Required("dev").ToArray();
                if (interaction.inCachedGuild()) {
                    const permissions = command.permissions;
                    if (permissions?.client?.length && permissions.client.every((p: PermissionResolvable) => interaction.guild.members.me?.permissions.has(p))) {
                        await interaction.reply({
                            content: `I'm missing the following permissions: ${Markdown.Highlight(permissions.client.map((perm: PermissionResolvable) => perm).join(', '))}`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                    if (permissions?.author?.length && permissions.author.every((p: PermissionResolvable) => interaction.member.permissions.has(p))) {
                        await interaction.reply({
                            content: `You're missing the following permissions: ${Markdown.Highlight(permissions.author.map((perm: PermissionResolvable) => perm).join(', '))}`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                    const data = Cooldown.Get(interaction.user.id, command.name);
                    if (data && !dev.includes(interaction.user.id)) {
                        const now = Date.now();
                        await interaction.reply({
                            content: `Please wait ${Markdown.Timestamp(now + data, "R")} before using this command again.`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                    Cooldown.Set(interaction.user.id, command.name, command.cooldown);
                };
                const incognito = (interaction.options as CommandInteractionOptionResolver<CacheType>).getBoolean("incognito") ?? false;
                if (command.defer) {
                    await interaction.deferReply( command.ephemeral || incognito ? { flags: MessageFlags.Ephemeral }: {} );
                };
                try {
                    await command.callback(interaction, {
                        name: command.name,
                        description: command.description,
                        body: Slash.GetSlashCommands(interaction.options.data as any, command.args ?? {})
                    });
                } catch (e) {
                    Log.Write(e, "red");
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
                if (!command || !command.autocomplete || !interaction.isAutocomplete()) return;
                Log.Write(`Received autocomplete interaction: ${command.name}`, "green");
                try {
                    await command.autocomplete(interaction);
                } catch (e) {
                    Log.Write(e, "red")
                };
                break;
            case InteractionType.MessageComponent:
                const [name, ...args] = interaction.customId.split("-");
                if (!name || !args) return;
                if (interaction.isButton()) {
                    Log.Write(`Received button interaction: ${interaction.customId}`, "green");
                    const button = Handler.Components.Find(interaction.client, name);
                    if (!button) return;
                    try {
                        await button.callback(interaction, args);
                    } catch (e) {
                        Log.Write(e, "red");
                    };
                } else if (interaction.isAnySelectMenu()) {
                    Log.Write(`Received select menu interaction: ${interaction.customId}`, "green");
                    const menu = Handler.Components.Find(interaction.client, name);
                    if (!menu) return;
                    try {
                        await menu.callback(interaction, args);
                    } catch (e) {
                        Log.Write(e, "red");
                    };
                };
                break;
            case InteractionType.ModalSubmit:
                Log.Write(`Received modal submit interaction: ${interaction.customId}`, "green");
                const [modalName, ...modalArgs] = interaction.customId.split("-");
                if (!modalName || !modalArgs) return;
                const modal = Handler.Components.Find(interaction.client, modalName);
                if (!modal) return;
                try {
                    await modal.callback(interaction, modalArgs);
                } catch (e) {
                    Log.Write(e, "red");
                };
                break;
            default:
                Log.Write(`Received invalid interaction type.`, "red");
                return;
        };
    }
});