import { ChannelType, MessageFlags } from "discord.js";
import Event from "../../bases/event";
import { Env } from "../../libs/env";
import type { PrefixType } from "../../types/types";
import { Log } from "../../utils/log";
import { Codeblock, Highlight, Icon, Link } from "../../utils/markdown";
import { Component } from "../../libs/component";
import { Container } from "../../libs/container";
import { Cooldown } from "../../utils/cooldown";
import { Args } from "../../libs/arg";

export default new Event({
    name: "message",
    type: "messageCreate",
    async run(message) {
        if (!message.inGuild() || !message.guild.members.me || !message.channel.permissionsFor(message.guild.members.me).has("SendMessages") || message.guild.members.me.isCommunicationDisabled() || message.author.bot) return;

        const prefix = message.client.prefix;
        const dev = Env.Required("dev").ToArray();

        const name = message.content.slice(prefix.length).trim().split(/\s+/).shift()?.toLowerCase();
        if (!name) return;

        const command = message.client.prefixes.find((prefix: PrefixType) => prefix.name === name || prefix.aliases.includes(name)) as PrefixType;
        if (!command) return;
        
        Log.Write(`Received prefix command interaction: ${command.name}`, "green");

        if (command.dev === true && !dev.includes(message.author.id)) return;

        const permissions = command.permissions;
        if (permissions.author.length  && !permissions.author.every((p) => message.member?.permissions.has(p))) {
            await message.reply(`You're missing the following permissions: ${Highlight(permissions.author.map((perm) => perm).join(', '))}`);
            return;
        };

        if (permissions.client.length && !permissions.client.every((p) => message.guild.members.me?.permissions.has(p))) {
            await message.reply(`I'm missing the following permissions: ${Highlight(permissions.client.map((perm) => perm).join(', '))}`);
            return;
        };

        if (command.nsfw && (message.channel.type === ChannelType.GuildText) && !message.channel.nsfw) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Nsfw")} this command is only available in NSFW channels.`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        try {
            Cooldown.Check(message.client, message.author.id, command.name, (command.cooldown || 0));
        } catch (e) {
            if (!dev.includes(message.author.id)) {
                await message.reply((e as Error).message);
            };
        };

        await message.channel.sendTyping();

        let args;
        try {
            args = await Args.Parse(message.client, message, command.args)
        } catch (e) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Warning")} ${Highlight((e as Error).message)}`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        try {
            await command.run(message.client, message, args)
        } catch (e) {
            Log.Write(e, "red");
            const text = Component.Create({
                type: "textDisplay",
                content: `Something went wrong while attempting to run this command.\n${Codeblock("ansi", (e as Error).message)}\n-# Contact support ${Link("https://discord.gg/7b234YFhmn", "here")}`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };
    }
});