import Slash from 'bases/slash';
import { MessageFlags } from 'discord.js';
import { Translate } from 'libs/locales';
import { TextDisplay } from 'utils/component';
import { Container } from 'utils/container';
import { Highlight, Icon } from 'utils/markdown';

export default new Slash({
  name: {
    global: 'purge',
    'pt-BR': 'limpar',
  },
  description: {
    global: 'Delete messages in the current channel',
    'pt-BR': 'Deleta mensagens no canal atual',
  },
  integrations: ['guild'],
  contexts: ['guild'],
  cooldown: 5,
  permissions: {
    author: ['ManageMessages'],
    client: [],
  },
  args: {
    amount: {
      type: 'number',
      name: {
        global: 'amount',
        'pt-BR': 'quantidade',
      },
      description: {
        global: 'Number of messages to delete',
        'pt-BR': 'Número de mensagens para deletar',
      },
      min: 1,
      max: 100,
      isInteger: true,
      required: true,
    },
    content: {
      type: 'string',
      name: {
        global: 'content',
        'pt-BR': 'conteúdo',
      },
      description: {
        global: 'Message content to delete',
        'pt-BR': 'Conteúdo das mensagens para deletar',
      },
    },
  },
  defer: true,
  async run(interaction, args) {
    if (!interaction.inCachedGuild()) return;
    const l = interaction.locale;

    const amount = args.amount;
    const content = args.content;
    const channel = interaction.channel;

    if (!channel?.isTextBased()) {
      const text = new TextDisplay({ content: `${Icon('Error')} ${Translate(l, 'purge:channelTypeError')}` });

      const container = new Container({ components: [text] });

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const messages = await channel.messages.fetch({ limit: amount + 1 });
    const i = await interaction.fetchReply();
    let filtered = messages;
    if (content) {
      filtered = messages.filter((msg) => msg.content === content && msg.id !== i.id);
    } else {
      filtered = messages.filter((msg) => msg.id !== i.id);
    }

    if (filtered.size === 0) {
      const text = new TextDisplay({ content: `${Icon('Info')} ${Translate(l, 'purge:noContentError')}` });

      const container = new Container({ components: [text] });

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    await channel.bulkDelete(filtered, true);

    const text = new TextDisplay({
      content: `${Icon('Success')} ${Translate(l, 'purge:bulkDeleteSuccess', [Highlight(filtered.size)])}`,
    });

    const container = new Container({ components: [text] });

    const int = await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    setTimeout(() => int.delete(), 5000);
  },
});
