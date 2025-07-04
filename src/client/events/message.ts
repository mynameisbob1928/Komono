import { ChannelType } from "discord.js";
import { Event } from "bases/event";
import { Prefix } from "bases/prefix";
import { Cooldown } from "utils/cooldown";
import { Env } from "utils/env";
import { Handler } from "utils/handler";
import { Markdown } from "utils/markdown";
import { Embed } from "utils/embed";
import { Log } from "utils/log";

export default Event.Create({
    name: "message",
    type: "messageCreate",
    async callback(message) {
        if (!message.inGuild() || !message.guild.members.me || !message.channel.permissionsFor(message.guild.members.me).has("SendMessages") || message.guild.members.me.isCommunicationDisabled() || message.author.bot) return;

        const prefix = "k.";
        const dev = Env.Required("dev").ToArray();

        const name = message.content.slice(prefix.length).trim().split(/\s+/).shift()?.toLowerCase();
        if (!name) return;

        const command = Handler.Prefixes.Find(name);
        if (!command) return;

        Log.Write(`Received command interaction: ${command.name}`);

        if (command.dev === true && !dev.includes(message.author.id)) return;

        const permissions = command.permissions;
        if (permissions.client.length && !permissions.client.some(p => message.guild.members.me?.permissions.has(p))) {
            await message.reply(`I'm missing the following permissions: ${Markdown.Highlight(permissions.client.map(perm => perm).join(', '))}`);
            return;
        };

        if (permissions.author.length && !permissions.author.some(p => message.member?.permissions.has(p))) {
            await message.reply(`You're missing the following permissions: ${Markdown.Highlight(permissions.author.map(perm => perm).join(', '))}`);
            return;
        };

        if (command.nsfw && (message.channel.type === ChannelType.GuildText) && !message.channel.nsfw) {
            await message.reply({
                embeds: [Embed.Create({
                    description: `${Markdown.Icon("Nsfw")} this command is only available in NSFW channels.`,
                    color: "DarkRed"
                })]
            });
            return;
        };

        const data = Cooldown.Get(message.author.id, command.name);
        if (data && !dev.includes(message.author.id)) {
            const now = Date.now();
            await message.reply(`Please wait ${Markdown.Timestamp(now + data, "R")} before using this command again.`);
            return;
        };

        Cooldown.Set(message.author.id, command.name, command.cooldown);

        await message.channel.sendTyping();

        let args: Record<string, any>;
        try {
            args = await Prefix.Args.Parse(message.client, message, command.args);
        } catch (e) {
            await message.reply({
                embeds: [Embed.Create({
                    description: `${Markdown.Icon("Warning")} ${Markdown.Highlight((e as Error).message)}`,
                    color: "Yellow"
                })]
            });
            return;
        };

        try {
            await command.callback(message.client, message, args);
        } catch (e) {
            Log.Write(e);
            await message.reply({
                embeds: [Embed.Error({
                    description: `Something went wrong while attempting to run this command.\n${Markdown.Codeblock("ansi", (e as Error).message)}\n-# Contact support ${Markdown.Link("https://discord.gg/7b234YFhmn", "here")}`
                })]
            });
            return;
        };
    }
});