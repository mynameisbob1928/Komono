import Event from 'bases/event';
import Slash from 'bases/slash';
import Env from 'libs/env';
import { Translate } from 'libs/locales';
import type { SlashType, ComponentType } from 'types/types';
import { TextDisplay } from 'utils/component';
import { Container } from 'utils/container';
import { CheckCooldown } from 'utils/cooldown';
import { Log } from 'utils/log';
import { Highlight, Codeblock, Link } from 'utils/markdown';
import { CommandInteractionOptionResolver, InteractionType, MessageFlags } from 'discord.js';
import crypto from 'crypto';
import Redis from 'libs/cache';

export default new Event({
  name: 'interactions',
  type: 'interactionCreate',
  async run(interaction) {
    switch (interaction.type) {
      case InteractionType.ApplicationCommand: {
        if (!interaction.isChatInputCommand()) return;
        const l = interaction.locale;

        const command = interaction.client.slashes.find(
          (slash: SlashType) => ((slash.name as any).global ?? slash.name) === interaction.commandName,
        ) as SlashType;
        if (!command) return;

        Log(`Received slash command interaction: ${(command.name as any).global ?? command.name}`, 'green');

        const dev = Env.Required('dev');

        if (interaction.inCachedGuild()) {
          const permissions = command.permissions;

          if (permissions.author.length && !permissions.author.every((p) => interaction.member.permissions.has(p))) {
            await interaction.reply({
              content: Translate(l, 'command:authorMissingPerms', [
                Highlight(permissions.author.map((perm) => perm).join(', ')),
              ]),
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          if (
            permissions.client.length &&
            !permissions.client.every((p) => interaction.guild.members.me?.permissions.has(p))
          ) {
            await interaction.reply({
              content: Translate(l, 'command:clientMissingPerms', [
                Highlight(permissions.client.map((perm) => perm).join(', ')),
              ]),
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
        }

        try {
          CheckCooldown(
            interaction.client,
            interaction.user.id,
            typeof command.name === 'string' ? command.name : command.name.global,
            command.cooldown || 0,
          );
        } catch (e) {
          if (!dev.includes(interaction.user.id)) {
            await interaction.reply({
              content: (e as Error).message,
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
        }

        const incognito = (interaction.options as CommandInteractionOptionResolver).getBoolean('incognito') ?? false;

        if (command.defer) {
          await interaction.deferReply(command.ephemeral || incognito ? { flags: MessageFlags.Ephemeral } : {});
        }

        if (command.cache) {
          Log(`Cache is enabled for: ${command.name}`, 'green');

          const value = command.name + JSON.stringify(interaction.options.data);
          const key = crypto.createHash('sha1').update(value).digest('hex');
          const cached = await Redis.get(key);

          if (cached) {
            try {
              const parsed = JSON.parse(cached);

              if (command.defer) {
                await interaction.editReply(parsed);
              } else {
                await interaction.reply(parsed);
              }
              return;
            } catch (e) {
              Log(`Error parsing cached data: ${e}`, 'red');
            }
          }

          let reply = command.defer ? interaction.editReply.bind(interaction) : interaction.reply.bind(interaction);
          let response;

          if (command.defer) {
            interaction.editReply = function (...args) {
              response = args[0];
              // @ts-ignore
              return reply(...args) as any;
            };
          } else {
            interaction.reply = function (...args) {
              response = args[0];
              // @ts-ignore
              return reply(...args) as any;
            };
          }

          try {
            await command.run(interaction, Slash.Resolve(interaction, command.args));
          } catch (e) {
            Log(`Command ${command.name} has errored`, 'red');
            Log(e, 'red');

            const text = new TextDisplay({
              content: Translate(l, 'command:errorExecution', [
                Codeblock('ansi', (e as Error).message),
                Link('https://discord.gg/7b234YFhmn', Translate(l, 'command:supportLink')),
              ]),
            });

            const container = new Container({ components: [text] });

            if (command.defer) {
              await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              });
            } else {
              await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              });
            }
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
            await command.run(interaction, Slash.Resolve(interaction, command.args));
          } catch (e) {
            Log(`Command ${command.name} has errored`, 'red');
            Log(e, 'red');

            const text = new TextDisplay({
              content: Translate(l, 'command:errorExecution', [
                Codeblock('ansi', (e as Error).message),
                Link('https://discord.gg/7b234YFhmn', Translate(l, 'command:supportLink')),
              ]),
            });

            const container = new Container({ components: [text] });

            if (command.defer) {
              await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              });
            } else {
              await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              });
            }
            return;
          }
        }
        break;
      }
      case InteractionType.ApplicationCommandAutocomplete: {
        if (!interaction.isAutocomplete()) return;

        const command = interaction.client.slashes.find(
          (slash: SlashType) => slash.name === interaction.commandName,
        ) as SlashType;
        if (!command || !command.autocomplete) return;

        Log(`Received autocomplete interaction: ${command.name}`, 'green');

        try {
          await command.autocomplete(interaction);
        } catch (e) {
          Log(e, 'red');
        }
        break;
      }
      case InteractionType.MessageComponent: {
        const [id, ...args] = interaction.customId.split('-');
        if (!id || !args) return;

        if (interaction.isButton()) {
          const button = interaction.client.components.find(
            (component: ComponentType) => component.id === id,
          ) as ComponentType;
          if (!button) return;

          Log(`Received button interaction: ${interaction.customId}`, 'green');

          try {
            await button.run(interaction, args);
          } catch (e) {
            Log(e, 'red');
          }
        } else if (interaction.isAnySelectMenu()) {
          const menu = interaction.client.components.find(
            (component: ComponentType) => component.id === id,
          ) as ComponentType;
          if (!menu) return;

          Log(`Received select menu interaction: ${interaction.customId}`, 'green');

          try {
            await menu.run(interaction, args);
          } catch (e) {
            Log(e, 'red');
          }
        }
        break;
      }
      case InteractionType.ModalSubmit: {
        const [id, ...args] = interaction.customId.split('-');
        if (!id || !args) return;

        const modal = interaction.client.components.find(
          (component: ComponentType) => component.id === id,
        ) as ComponentType;
        if (!modal) return;

        Log(`Received modal submit interaction: ${interaction.customId}`, 'green');

        try {
          await modal.run(interaction, args);
        } catch (e) {
          Log(e, 'red');
        }
        break;
      }
    }
  },
});
