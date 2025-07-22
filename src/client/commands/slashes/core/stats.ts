import Slash from 'bases/slash';
import { ButtonStyle, MessageFlags, SeparatorSpacingSize } from 'discord.js';
import { ActionRow, Button, Separator, TextDisplay } from 'utils/component';
import { Container } from 'utils/container';
import { Icon, SmallIconPill } from 'utils/markdown';
import { FormatTime, ReadableFileSize } from 'utils/utils';
import os from 'os';
import { Translate } from 'libs/locales';

export default new Slash({
  name: {
    global: 'stats',
    'pt-BR': 'Estatísticas',
  },
  description: {
    global: 'View some stats',
    'pt-BR': 'Veja algumas estatísticas',
  },
  integrations: ['guild', 'user'],
  contexts: ['guild', 'DM', 'bot'],
  cooldown: 3,
  defer: true,
  cache: true,
  async run(interaction, args) {
    const l = interaction.locale;

    const app = await interaction.client.application?.fetch();
    const data = await interaction.client.cluster.broadcastEval((c) => ({
      guilds: c.guilds.cache.size,
      memoryUsage: process.memoryUsage().heapUsed,
      uptime: c.uptime,
    }));

    const guilds = data.reduce((sum, shard) => sum + shard!.guilds, 0);
    const memoryUsage = data.reduce((sum, shard) => sum + shard!.memoryUsage, 0);
    const totalMemory = os.totalmem();
    const uptime = FormatTime(data.reduce((sum, shard) => sum + shard!.uptime!, 0));
    const installations = app?.approximateUserInstallCount;
    const shards = interaction.client.cluster.info.TotalShards;
    const shard = interaction.guild?.shardId ?? 'N/A';
    const clusters = interaction.client.cluster.info.ClusterCount;
    const cluster = interaction.client.cluster.id;

    const text1 = new TextDisplay({
      content: Translate(l, 'stats:cluster&shard', [cluster, shard]),
    });

    const sep = new Separator({
      spacing: SeparatorSpacingSize.Large,
      divider: true,
    });

    const sepTest = new Separator({
      spacing: SeparatorSpacingSize.Small,
      divider: true,
    });

    const text2 = new TextDisplay({
      content: `${SmallIconPill('Clock', Translate(l, 'stats:uptime'))}: ${uptime}\n${SmallIconPill('NeutralPing', Translate(l, 'stats:memory'))}: ${ReadableFileSize(memoryUsage)} (${ReadableFileSize(totalMemory)})\n${SmallIconPill('Core', Translate(l, 'stats:guilds'))}: ${guilds}\n${SmallIconPill('Member', Translate(l, 'stats:installations'))}: ${installations}\n${SmallIconPill('Fields', Translate(l, 'stats:clusters'))}: ${clusters}\n${SmallIconPill('Bot', Translate(l, 'stats:shards'))}: ${shards}`,
    });

    const button1 = new Button({
      text: Translate(l, 'stats:support'),
      // emoji: Icon('Discord'),
      url: 'https://discord.gg/7b234YFhmn',
      color: ButtonStyle.Link,
    });

    const button2 = new Button({
      text: Translate(l, 'stats:addKomono'),
      // emoji: Icon('Link'),
      url: 'https://discord.com/oauth2/authorize?client_id=1240033877917962392',
      color: ButtonStyle.Link,
    });

    const action = new ActionRow(button1, button2);

    const container = new Container({ components: [text1, sepTest, text2, sep, action] });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  },
});
