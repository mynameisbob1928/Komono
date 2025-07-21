import Event from 'bases/event';
import { Log } from 'utils/log';
import { Reference } from 'utils/utils';

export default new Event({
  name: 'refDel',
  type: 'messageDelete',
  async run(message) {
    try {
      if (message.author?.bot || !message.inGuild() || !message.guild.members.me) return;
      if (message.partial) await message.fetch();

      const references = await Reference(message);

      for (const reference of references) {
        await reference.delete();
      }
    } catch (e) {
      Log(e, 'red');
    }
  },
});
