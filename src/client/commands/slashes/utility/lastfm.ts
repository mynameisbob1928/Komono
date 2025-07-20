import Slash from 'bases/slash';
import Env from 'libs/env';
import Prisma from 'libs/database';
import { AttachmentBuilder, MessageFlags } from 'discord.js';
import { Component } from 'utils/component';
import { Icon, Link } from 'utils/markdown';
import { Container } from 'utils/container';
import { Request } from 'libs/request';
import { Commas } from 'utils/utils';
import { Translate } from 'libs/locales';

export default new Slash({
  name: 'lastfm',
  description: {
    global: "Show the music that you're listening to",
    'pt-BR': 'Mostra a música que você está escutando',
  },
  integrations: ['guild', 'user'],
  contexts: ['guild', 'bot', 'DM'],
  cooldown: 5,
  args: {
    user: {
      type: 'string',
      name: {
        global: 'user',
        'pt-BR': 'usuário',
      },
      description: {
        global: 'Lastfm account username',
        'pt-BR': 'Nome da conta Lastfm',
      },
    },
  },
  async run(interaction, args) {
    const l = interaction.locale;

    const userId = interaction.user.id;
    const key = Env.Required('lastfm');

    if (args.user) {
      const username = args.user;

      await Prisma.lastfm.upsert({
        where: { userId },
        update: { username },
        create: { userId, username },
      });

      const text = Component.Create({
        type: 'textDisplay',
        content: `${Icon('Sucess')} ${Translate(l, 'lastfm:userSaved', [username])}`,
      });

      const container = Container.Create({ components: [text] });

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const data = await Prisma.lastfm.findUnique({ where: { userId } });
    if (!data) {
      const text = Component.Create({
        type: 'textDisplay',
        content: `${Icon('Error')} ${Translate(l, 'lastfm:noData')}`,
      });

      const container = Container.Create({ components: [text] });

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const username = data.username;

    const trackRes = await Request.Request({
      url: `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
      method: 'GET',
      response: 'JSON',
    });

    const userRes = await Request.Request({
      url: `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
      method: 'GET',
      response: 'JSON',
    });

    if (!userRes) {
      const text = Component.Create({
        type: 'textDisplay',
        content: `${Icon('Error')} ${Translate(l, 'lastfm:userNotFound', [username])}`,
      });

      const container = Container.Create({ components: [text] });

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const tracks = trackRes.recentTracks.track;
    if (!tracks) {
      const text = Component.Create({
        type: 'textDisplay',
        content: `${Icon('Error')} ${Translate(l, 'lastfm:noTracks')}`,
      });

      const container = Container.Create({ components: [text] });

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const track = tracks[0];

    const playing = track['@attr']?.nowplaying === 'true';
    if (!playing) {
      const text = Component.Create({
        type: 'textDisplay',
        content: `${Icon('Error')} ${Translate(l, 'lastfm:noTrackPlaying')}`,
      });

      const container = Container.Create({ components: [text] });

      await interaction.editReply({
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

    const text1 = Component.Create({
      type: 'textDisplay',
      content: Translate(l, 'lastfm:trackPlaying', [
        interaction.user.id,
        Link(track.url, track.name),
        track.artist['#text'],
      ]),
    });

    const text2 = Component.Create({
      type: 'textDisplay',
      content: `## ${Link(track.url, `${track.name} ・ ${track.artist['#text']}`)}`,
    });

    const text3 = Component.Create({
      type: 'textDisplay',
      content: Translate(l, 'lastfm:albumAndScrobbles', [
        track.album?.['#text'] ?? Translate(l, 'lastfm:albumNotFound'),
      ]),
    });

    let content;
    if (attach) {
      const thumb = Component.Create({
        type: 'thumbnail',
        description: 'Cover image',
        media: 'attachment://cover.jpg',
      });

      const sect = Component.Create({
        type: 'section',
        components: [text3],
        accessory: thumb,
      });

      content = sect;
    } else {
      content = text3;
    }

    const container = Container.Create({ components: [text2, content] });

    await interaction.editReply({
      components: [text1, container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
