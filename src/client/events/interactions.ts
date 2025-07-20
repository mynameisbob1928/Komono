import { CommandInteractionOptionResolver, InteractionType, MessageFlags } from "discord.js";
import Event from "../../bases/event";
import type { ComponentType, SlashType } from "../../types/types";
import { Log } from "../../utils/log";
import Slash from "../../bases/slash";
import { Env } from "../../libs/env";
import { Codeblock, Highlight, Link } from "../../utils/markdown";
import { Cooldown } from "../../utils/cooldown";
import { Component } from "../../utils/component";
import { Container } from "../../utils/container";
import { Translate } from "libs/locales";

export default new Event({
    name: "interactions",
    type: "interactionCreate",
    async run(interaction) {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand: {
                if (!interaction.isChatInputCommand()) return;
                const l = interaction.locale;

                const command = interaction.client.slashes.find((slash: SlashType) => slash.name === interaction.commandName) as SlashType;
                if (!command) return;

                Log.Write(`Received slash command interaction: ${command.name}`, "green");

                const dev = Env.Required("dev").ToArray();

                if (interaction.inCachedGuild()) {
                    const permissions = command.permissions;

                    if (permissions.author.length && !permissions.author.every((p) => interaction.member.permissions.has(p))) {
                        await interaction.reply({
                            content: Translate(l, "command:authorMissingPerms", [Highlight(permissions.author.map((perm) => perm).join(', '))]),
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };

                    if (permissions.client.length && !permissions.client.every((p) => interaction.guild.members.me?.permissions.has(p))) {
                        await interaction.reply({
                            content: Translate(l, "command:clientMissingPerms", [Highlight(permissions.client.map((perm) => perm).join(', '))]),
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    };
                };

                try {
                    Cooldown.Check(interaction.client, interaction.user.id, typeof command.name === "string" ? command.name : command.name.global, (command.cooldown || 0))
                } catch (e) {
                    if (!dev.includes(interaction.user.id)) {
                        await interaction.reply({ content: (e as Error).message, flags: MessageFlags.Ephemeral });
                        return;
                    };
                };

                const incognito = (interaction.options as CommandInteractionOptionResolver).getBoolean("incognito") ?? false;

                if (command.defer) {
                    await interaction.deferReply( command.ephemeral || incognito ? { flags: MessageFlags.Ephemeral }: {} );
                };

                try {
                    await command.run(interaction, Slash.Resolve(interaction, command.args));
                } catch (e) {
                    Log.Write(e, "red");

                    const text = Component.Create({
                        type: "textDisplay",
                        content: Translate(l, "command:errorExecution", [Codeblock("ansi", (e as Error).message), Link("https://discord.gg/7b234YFhmn", Translate(l, "command:supportLink"))])
                    });

                    const container = Container.Create({ components: [text] });

                    if (command.defer) {
                        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
                    };
                    return;
                };
                break;
            };
            case InteractionType.ApplicationCommandAutocomplete: {
                if (!interaction.isAutocomplete()) return;

                const command = interaction.client.slashes.find((slash: SlashType) => slash.name === interaction.commandName) as SlashType;
                if (!command || !command.autocomplete) return;

                Log.Write(`Received autocomplete interaction: ${command.name}`, "green");

                try {
                    await command.autocomplete(interaction);
                } catch (e) {
                    Log.Write(e, "red");
                };
                break;
            };
            case InteractionType.MessageComponent: {
                const [id, ...args] = interaction.customId.split("-");
                if (!id || !args) return;

                if (interaction.isButton()) {
                    const button = interaction.client.components.find((component: ComponentType) => component.id === id) as ComponentType;
                    if (!button) return;

                    Log.Write(`Received button interaction: ${interaction.customId}`, "green");

                    try {
                        await button.run(interaction, args);
                    } catch (e) {
                        Log.Write(e, "red");
                    };
                } else if (interaction.isAnySelectMenu()) {
                    const menu = interaction.client.components.find((component: ComponentType) => component.id === id) as ComponentType;
                    if (!menu) return;

                    Log.Write(`Received select menu interaction: ${interaction.customId}`, "green");

                    try {
                        await menu.run(interaction, args);
                    } catch (e) {
                        Log.Write(e, "red");
                    };
                };
                break;
            };
            case InteractionType.ModalSubmit: {
                const [id, ...args] = interaction.customId.split("-");
                if (!id || !args) return;

                const modal = interaction.client.components.find((component: ComponentType) => component.id === id) as ComponentType;
                if (!modal) return;

                Log.Write(`Received modal submit interaction: ${interaction.customId}`, "green");

                try {
                    await modal.run(interaction, args);
                } catch (e) {
                    Log.Write(e, "red");
                };
                break;
            };
        };
    }
});