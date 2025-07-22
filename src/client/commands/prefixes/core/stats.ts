import Prefix from 'bases/prefix';
import { ButtonStyle, MessageFlags, SeparatorSpacingSize } from 'discord.js';
import { ActionRow, Button, Separator, TextDisplay } from 'utils/component';
import { Container } from 'utils/container';
import { Icon, IconPill, SmallIconPill } from 'utils/markdown';
import { FormatTime, ReadableFileSize } from 'utils/utils';
import os from 'os';

export default new Prefix({
  name: 'stats',
  aliases: ['debug', 'usage', 'status'],
  description: 'View some stats',
  cooldown: 3,
  cache: true,
  async run(client, message, args) {
    if (!message.inGuild()) return;

    const app = await client.application?.fetch();
    const data = await client.cluster.broadcastEval((c) => ({
      guilds: c.guilds.cache.size,
      memoryUsage: process.memoryUsage().heapUsed,
      uptime: c.uptime,
    }));

    const guilds = data.reduce((sum, shard) => sum + shard!.guilds, 0);
    const memoryUsage = data.reduce((sum, shard) => sum + shard!.memoryUsage, 0);
    const totalMemory = os.totalmem();
    const uptime = FormatTime(data.reduce((sum, shard) => sum + shard!.uptime!, 0));
    const installations = app?.approximateUserInstallCount;
    const shards = client.cluster.info.TotalShards;
    const shard = message.guild.shardId;
    const clusters = client.cluster.info.ClusterCount;
    const cluster = client.cluster.id;

    const text1 = new TextDisplay({
      content: `### Cluster: #${cluster} ・ Shard: #${shard}`,
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
      content: `${SmallIconPill('Clock', 'Uptime')}: ${uptime}\n${SmallIconPill('NeutralPing', 'Memory')}: ${ReadableFileSize(memoryUsage)} (${ReadableFileSize(totalMemory)})\n${SmallIconPill('Core', 'Guild')}: ${guilds}\n${SmallIconPill('Member', 'Installations')}: ${installations}\n${SmallIconPill('Fields', 'Clusters')}: ${clusters}\n${SmallIconPill('Bot', 'Shards')}: ${shards}`,
    });

    const button1 = new Button({
      text: 'Support',
      // emoji: Icon('Discord'),
      url: 'https://discord.gg/7b234YFhmn',
      color: ButtonStyle.Link,
    });

    const button2 = new Button({
      text: 'Add Komono',
      // emoji: Icon('Link'),
      url: 'https://discord.com/oauth2/authorize?client_id=1240033877917962392',
      color: ButtonStyle.Link,
    });

    const action = new ActionRow(button1, button2);

    const container = new Container({ components: [text1, sepTest, text2, sep, action] });

    await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  },
});
