import Event from 'bases/event';
import Prefix from 'bases/prefix';
import Env from 'libs/env';
import type { PrefixType } from 'types/types';
import { TextDisplay } from 'utils/component';
import { Container } from 'utils/container';
import { CheckCooldown } from 'utils/cooldown';
import { Log } from 'utils/log';
import { Highlight, Icon, Codeblock, Link } from 'utils/markdown';
import { ChannelType, MessageFlags } from 'discord.js';
import crypto from 'crypto';
import Redis from 'libs/cache';

export default new Event({
  name: 'message',
  type: 'messageCreate',
  async run(message) {
    if (
      !message.inGuild() ||
      !message.guild.members.me ||
      !message.channel.permissionsFor(message.guild.members.me).has('SendMessages') ||
      message.guild.members.me.isCommunicationDisabled() ||
      message.author.bot
    )
      return;

    const prefix = message.client.prefix;
    if (!message.content.startsWith(prefix)) return;

    const dev = Env.Required('dev');

    const name = message.content.slice(prefix.length).trim().split(/\s+/).shift()?.toLowerCase();
    if (!name) return;

    const command = message.client.prefixes.find(
      (prefix: PrefixType) => prefix.name === name || prefix.aliases.includes(name),
    ) as PrefixType;
    if (!command) return;

    Log(`Received prefix command interaction: ${command.name}`, 'green');

    if (command.dev === true && !dev.includes(message.author.id)) return;

    const permissions = command.permissions;
    if (permissions.author.length && !permissions.author.every((p) => message.member?.permissions.has(p))) {
      await message.reply(
        `You're missing the following permissions: ${Highlight(permissions.author.map((perm) => perm).join(', '))}`,
      );
      return;
    }

    if (permissions.client.length && !permissions.client.every((p) => message.guild.members.me?.permissions.has(p))) {
      await message.reply(
        `I'm missing the following permissions: ${Highlight(permissions.client.map((perm) => perm).join(', '))}`,
      );
      return;
    }

    if (command.nsfw && message.channel.type === ChannelType.GuildText && !message.channel.nsfw) {
      const text = new TextDisplay({ content: `${Icon('Nsfw')} this command is only available in NSFW channels.` });

      const container = new Container({ components: [text] });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    try {
      CheckCooldown(message.client, message.author.id, command.name, command.cooldown || 0);
    } catch (e) {
      if (!dev.includes(message.author.id)) {
        await message.reply((e as Error).message);
      }
    }

    await message.channel.sendTyping();

    let args;
    try {
      args = await Prefix.Parse(message.client, message, command.args);
    } catch (e) {
      const text = new TextDisplay({ content: `${Icon('Warning')} ${Highlight((e as Error).message)}` });

      const container = new Container({ components: [text] });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    if (command.cache) {
      Log(`Cache is enabled for: ${command.name}`, 'green');

      const value = command.name + JSON.stringify(args);
      const key = crypto.createHash('sha1').update(value).digest('hex');
      const cached = await Redis.get(key);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);

          await message.reply(parsed);
          return;
        } catch (e) {
          Log(`Error parsing cached data`, 'red');
          Log(e, 'red');
        }
      }

      const reply = message.reply.bind(message);
      let response;

      message.reply = function (...args) {
        response = args[0];
        return reply(...args);
      };

      try {
        await command.run(message.client, message, args);
      } catch (e) {
        Log(`Command ${command.name} has errored`, 'red');
        Log(e, 'red');

        const text = new TextDisplay({
          content: `Something went wrong while attempting to run this command.\n${Codeblock('ansi', (e as Error).message)}\n-# Contact support ${Link('https://discord.gg/7b234YFhmn', 'here')}`,
        });

        const container = new Container({ components: [text] });

        await message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      try {
        await Redis.setex(key, 120, JSON.stringify(response));
      } catch (e) {
        Log('Error saving cache', 'red');
        Log(e, 'red');
        return;
      }
    } else {
      try {
        await command.run(message.client, message, args);
      } catch (e) {
        Log(`Command ${command.name} has errored`, 'red');
        Log(e, 'red');

        const text = new TextDisplay({
          content: `Something went wrong while attempting to run this command.\n${Codeblock('ansi', (e as Error).message)}\n-# Contact support ${Link('https://discord.gg/7b234YFhmn', 'here')}`,
        });

        const container = new Container({ components: [text] });

        await message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }
    }
  },
});
