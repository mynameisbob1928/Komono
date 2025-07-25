import Prefix from 'bases/prefix';
import Env from 'libs/env';
import Prisma from 'libs/database';
import { AttachmentBuilder, MessageFlags } from 'discord.js';
import { Section, TextDisplay, Thumbnail } from 'utils/component';
import { Container } from 'utils/container';
import { Icon, Link } from 'utils/markdown';
import { Request } from 'libs/request';
import { Commas } from 'utils/utils';

export default new Prefix({
  name: 'lastfm',
  aliases: ['fm'],
  description: "Show the music that you're listening to",
  cooldown: 5,
  args: {
    user: {
      type: 'string',
      name: 'user',
      description: 'Lastfm account username',
    },
  },
  async run(client, message, args) {
    const userId = message.author.id;
    const key = Env.Required('lastfm');

    if (args.user) {
      const username = args.user;

      await Prisma.lastfm.upsert({
        where: { userId },
        update: { username },
        create: { userId, username },
      });

      const text = new TextDisplay({ content: `${Icon('Sucess')} Last.fm username saved as **${username}**!` });

      const container = new Container({ components: [text] });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const data = await Prisma.lastfm.findUnique({ where: { userId } });
    if (!data) {
      const text = new TextDisplay({
        content: `${Icon('Error')} You need to set your Last.fm username first with the command, e.g., k.lastfm <username>`,
      });

      const container = new Container({ components: [text] });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const username = data.username;

    const trackRes = await Request({
      url: `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
      method: 'GET',
      response: 'JSON',
    });

    const userRes = await Request({
      url: `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
      method: 'GET',
      response: 'JSON',
    });

    if (!userRes) {
      const text = new TextDisplay({
        content: `${Icon('Error')} Username "${username}" is invalid. Please update it using the command k.lastfm <username>`,
      });

      const container = new Container({ components: [text] });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const tracks = trackRes.recentTracks?.track;
    if (!tracks) {
      const text = new TextDisplay({ content: `${Icon('Error')} No recent tracks found` });

      const container = new Container({ components: [text] });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const track = tracks[0];

    const playing = track['@attr']?.nowplaying === 'true';
    if (!playing) {
      const text = new TextDisplay({ content: `${Icon('Error')} No track playing right now` });

      const container = new Container({ components: [text] });

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    let attach;
    if (track.image[2]['#text']) {
      const res = await fetch(track.image[2]['#text']);
      const arrBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrBuffer);

      attach = new AttachmentBuilder(buffer, { name: 'cover.jpg' });
    }

    const text1 = new TextDisplay({
      content: `${message.author} is playing ${Link(track.url, track.name)} by ${track.artist['#text']}`,
    });
    const text2 = new TextDisplay({ content: `## ${Link(track.url, `${track.name} ・ ${track.artist['#text']}`)}` });
    const text3 = new TextDisplay({
      content: `Album: **${track.album?.['#text'] ?? 'Album not found'}** ・ Scrobbles: **${Commas(userRes.playcount) || 'N/A'}**`,
    });

    let content;
    if (attach) {
      const thumb = new Thumbnail({
        description: 'Cover image',
        url: 'attachment://cover.jpg',
      });

      const sect = new Section({
        components: [text3],
        accessory: thumb,
      });

      content = sect;
    } else {
      content = text3;
    }

    const container = new Container({ components: [text2, content] });

    await message.reply({
      components: [text1, container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
