import Prefix from 'bases/prefix';

export default new Prefix({
  name: 'egg',
  description: 'egg',
  category: 'core',
  cooldown: 0,
  // cache: true,
  async run(client, message, args) {
    await message.reply(`egg`);
  },
});
