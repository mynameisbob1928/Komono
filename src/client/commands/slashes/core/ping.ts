import Slash from 'bases/slash';
import Prisma from 'libs/database';
import { Routes } from 'discord.js';
import { Translate } from 'libs/locales';

export default new Slash({
  name: 'ping',
  description: {
    global: 'Check if the bot is alive',
    'pt-BR': 'Verifica se o bot está vivo',
  },
  cooldown: 3,
  integrations: ['guild', 'user'],
  contexts: ['guild', 'bot', 'DM'],
  defer: true,
  async run(interaction, args) {
    const l = interaction.locale;

    // REST
    const restStart = performance.now();
    await interaction.client.rest.get(Routes.user('@me'));
    const restLatency = Math.round(performance.now() - restStart);

    // Database
    const databaseStart = performance.now();
    await Prisma.dummy.count();
    const databaseLatency = Math.round(performance.now() - databaseStart);

    // WS
    const wsLatency = interaction.client.ws.ping;

    await interaction.editReply(Translate(l, 'ping:response', [restLatency, databaseLatency, wsLatency]));
  },
});
