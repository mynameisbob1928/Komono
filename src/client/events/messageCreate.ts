import { Embed } from "../../utils/embed";
import { Event } from "../../bases/event";
import { Handler } from "../../utils/handler";
import { Cooldown } from "../../utils/cooldown";
import { Prefix } from "../../bases/prefix";
import { Markdown } from "../../utils/markdown";
import { Env } from "../../utils/env";
import { ChannelType } from "discord.js";

export default Event.Create("messageCreate", async function (message) {
  if (message.author.bot || !message.inGuild() || !message.guild.members.me || !message.channel.permissionsFor(message.guild.members.me).has("SendMessages") || message.guild.members.me.isCommunicationDisabled()) return;

  const prefix = "k."
  const dev = Env.Required("dev").ToArray();

  const name = message.content.slice(prefix.length).trim().split(/\s+/).shift()?.toLowerCase();
  if (!name) return;

  const command = Handler.Prefixes.Find(name);
  if (!command) return;

  if (command.dev && !dev.includes(message.author.id)) return;

  const permissions = command.permissions;
  if (permissions.client.length && !permissions.client.some(p => message.guild.members.me?.permissions.has(p))) {
    return message.reply(`I'm missing the following permissions: ${Markdown.Highlight(permissions.client.map(perm => perm).join(', '))}`)
  };
  if (permissions.author.length && !permissions.author.some(p => message.member?.permissions.has(p))) {
    return message.reply(`You're missing the following permissions: ${Markdown.Highlight(permissions.author.map(perm => perm).join(', '))}`)
  };

  if (command.nsfw && (message.channel.type === ChannelType.GuildText) && !message.channel.nsfw) {
    return message.reply({
      embeds: [Embed.Create({
        description: `${Markdown.Icon("Nsfw")} this command is only available in NSFW channels.`,
        color: "DarkRed"
      })]
    });
  };

  const data = Cooldown.Get(message.author.id, command.name);
  if (data) {
    const now = Date.now();
    return message.reply(`Please wait ${Markdown.Timestamp(now + data, "R")} before using this command again.`)
  };
  Cooldown.Set(message.author.id, command.name, command.cooldown);

  await message.channel.sendTyping();

  let args: Record<string, any>;
  try {
    args = Prefix.Args.Extract(message.client, message, command.args);
  } catch (e) {
    return message.reply({
      embeds: [Embed.Create({
        description: `${Markdown.Icon("Warning")} ${Markdown.Highlight((e as Error).message)}`,
        color: "Yellow"
      })]
    });
  };

  try {
    await command.callback(message.client, message, args);
  } catch (e) {
    return message.reply({
      embeds: [Embed.Error({
        description: `Something went wrong while attempting to run this command.\n> ${Markdown.Highlight((e as Error).message)}\n-# Contact support ${Markdown.Link("https://discord.gg/7b234YFhmn", "here")}`
      })]
    });
  };
});