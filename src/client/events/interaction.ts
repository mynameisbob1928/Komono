import { CommandInteractionOptionResolver, InteractionType, MessageFlags, type CacheType, type PermissionResolvable } from "discord.js";
import { Event } from "bases/event";
import { GetSlashCommands } from "bases/slash";
import { Required } from "utils/env";
import type { ComponentType, SlashType } from "utils/types";
import { Write } from "utils/log";
import { Highlight, Codeblock, Timestamp, Link } from "utils/markdown";
import { Embed } from "utils/embed";
import { Check } from "utils/cooldown";

export default Event({
    name: "interaction",
    type: "interactionCreate",
    async callback(interaction) {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand: {
                if (!interaction.isChatInputCommand()) return;

                const command = interaction.client.slashes.find((slash: SlashType) => slash.name === interaction.commandName) as SlashType;
                if (!command) return;

                Write(`Received slash command interaction: ${command.name}`, "green");

                const dev = Required("dev").ToArray();

                if (interaction.inCachedGuild()) {
                    const permissions = command.permissions;

                    if (permissions?.client?.length && permissions.client.every((p: PermissionResolvable) => interaction.guild.members.me?.permissions.has(p))) {
                        await interaction.reply({
                            content: `I'm missing the following permissions: ${Highlight(permissions.client.map((perm: PermissionResolvable) => perm).join(', '))}`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };

                    if (permissions?.author?.length && permissions.client?.every((p: PermissionResolvable) => interaction.member.permissions.has(p))) {
                        await interaction.reply({
                            content: `You're missing the following permissions: ${Highlight(permissions.author.map((perm: PermissionResolvable) => perm).join(', '))}`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                };

                try {
                    Check(interaction.client, interaction.user.id, command.name, command.cooldown);
                } catch (e) {
                    if (!dev.includes(interaction.user.id)) {
                        await interaction.reply({ content: (e as Error).message, flags: MessageFlags.Ephemeral });
                    };
                };

                const incognito = (interaction.options as CommandInteractionOptionResolver<CacheType>).getBoolean("incognito") ?? false;

                if (command.defer) {
                    await interaction.deferReply( command.ephemeral || incognito ? { flags: MessageFlags.Ephemeral }: {} );
                };

                try {
                    await command.callback(interaction, {
                        name: command.name,
                        description: command.description,
                        body: GetSlashCommands(interaction.options.data as any, command.args ?? {})
                    });
                } catch (e) {
                    Write(e, "red");
                    await interaction.reply({
                        embeds: [Embed({
                            description: `Something went wrong while attempting to run this command.\n${Codeblock("ansi", (e as Error).message)}\n-# Contact support ${Link("https://discord.gg/7b234YFhmn", "here")}`
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                };
                break;
            };
            case InteractionType.ApplicationCommandAutocomplete: {
                if (!interaction.isAutocomplete()) return;

                const command = interaction.client.slashes.find((slash: SlashType) => slash.name === interaction.commandName) as SlashType;

                if (!command || !command.autocomplete) return;

                Write(`Received autocomplete interaction: ${command.name}`, "green");

                try {
                    await command.autocomplete(interaction);
                } catch (e) {
                    Write(e);
                };
                break;
            };
            case InteractionType.MessageComponent: {
                const [id, ...args] = interaction.customId.split("-");

                if (!id || !args) return;
                
                if (interaction.isButton()) {
                    const button = interaction.client.components.find((component: ComponentType) => component.id === id) as ComponentType;

                    if (!button) return;

                    Write(`Received button interaction: ${interaction.customId}`, "green");

                    try {
                        await button.callback(interaction, args);
                    } catch (e) {
                        Write(e);
                    };
                } else if (interaction.isAnySelectMenu()) {
                    const menu = interaction.client.components.find((component: ComponentType) => component.id === id) as ComponentType;

                    if (!menu) return;

                    Write(`Received select menu interaction: ${interaction.customId}`, "green");

                    try {
                        await menu.callback(interaction, args);
                    } catch (e) {
                        Write(e);
                    };
                };
                break;
            };
            case InteractionType.ModalSubmit: {
                const [id, ...args] = interaction.customId.split("-");

                if (!id || !args) return;

                const modal = interaction.client.components.find((component: ComponentType) => component.id === id) as ComponentType;
                
                if (!modal) return;

                Write(`Received modal submit interaction: ${interaction.customId}`, "green");

                try {
                    await modal.callback(interaction, args);
                } catch (e) {
                    Write(e);
                };
                break;
            };
        };
    }
});