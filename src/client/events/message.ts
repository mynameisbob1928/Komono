import { ChannelType,  type PermissionResolvable } from "discord.js";
import { Event } from "bases/event";
import { Parse  } from "bases/prefix";
import { Required } from "utils/env";
import type { PrefixType } from "utils/types";
import { Highlight, Codeblock, Link, Icon } from "utils/markdown";
import { Write } from "utils/log";
import { Embed } from "utils/embed";
import { Check } from "utils/cooldown";

export default Event({
    name: "message",
    type: "messageCreate",
    async callback(message) {
        if (!message.inGuild() || !message.guild.members.me || !message.channel.permissionsFor(message.guild.members.me).has("SendMessages") || message.guild.members.me.isCommunicationDisabled() || message.author.bot) return;

        const prefix = message.client.prefix;
        const dev = Required("dev").ToArray();

        const name = message.content.slice(prefix.length).trim().split(/\s+/).shift()?.toLowerCase();
        if (!name) return;

        const command = message.client.prefixes.find((prefix: PrefixType) => prefix.name === name || prefix.aliases.includes(name));
        if (!command) return;

        Write(`Received prefix command interaction: ${command.name}`, "green");

        if (command.dev === true && !dev.includes(message.author.id)) return;

        const permissions = command.permissions;
        if (permissions.client.length && !permissions.client.every((p: PermissionResolvable) => message.guild.members.me?.permissions.has(p))) {
            await message.reply(`I'm missing the following permissions: ${Highlight(permissions.client.map((perm: PermissionResolvable) => perm).join(', '))}`);
            return;
        };

        if (permissions.author.length && !permissions.author.every((p: PermissionResolvable) => message.member?.permissions.has(p))) {
            await message.reply(`You're missing the following permissions: ${Highlight(permissions.author.map((perm: PermissionResolvable) => perm).join(', '))}`);
            return;
        };

        if (command.nsfw && (message.channel.type === ChannelType.GuildText) && !message.channel.nsfw) {
            await message.reply({
                embeds: [Embed({
                    description: `${Icon("Nsfw")} this command is only available in NSFW channels.`,
                    color: "DarkRed"
                })]
            });
            return;
        };

        try {
            Check(message.client, message.author.id, command.name, command.cooldown);
        } catch (e) {
            if (!dev.includes(message.author.id)) {
                await message.reply((e as Error).message);
            };
        };

        await message.channel.sendTyping();

        let args: Record<string, any>;
        try {
            args = await Parse(message.client, message, command.args);
        } catch (e) {
            await message.reply({
                embeds: [Embed({
                    description: `${Icon("Warning")} ${Highlight((e as Error).message)}`,
                    color: "Yellow"
                })]
            });
            return;
        };

        try {
            await command.callback(message.client, message, args);
        } catch (e) {
            Write(e, "red");
            await message.reply({
                embeds: [Embed({
                    description: `Something went wrong while attempting to run this command.\n${Codeblock("ansi", (e as Error).message)}\n-# Contact support ${Link("https://discord.gg/7b234YFhmn", "here")}`,
                    color: "Red"
                })]
            });
            return;
        };
    }
});