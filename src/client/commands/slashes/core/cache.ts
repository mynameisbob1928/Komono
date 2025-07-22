import Slash from 'bases/slash';

export default new Slash({
  name: 'cache',
  description: 'tests new cache system',
  integrations: ['guild'],
  contexts: ['guild'],
  cache: true,
  async run(interaction, args) {
    await interaction.reply('meow');
  },
});
