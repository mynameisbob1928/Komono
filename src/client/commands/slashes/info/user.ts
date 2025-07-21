import Slash from 'core/bases/slash';
import { MessageFlags, SeparatorSpacingSize } from 'discord.js';
import Env from 'libs/env';
import { Translate } from 'libs/locales';
import { Section, Separator, TextDisplay, Thumbnail } from 'utils/component';
import { Container } from 'utils/container';
import { Icon, IconPill, Pill, SmallPill, Timestamp } from 'utils/markdown';

export default new Slash({
  name: {
    global: 'user',
    'pt-BR': 'usuário',
  },
  description: {
    global: 'View user profile',
    'pt-BR': 'Veja o perfil do usuário',
  },
  integrations: ['guild', 'user'],
  contexts: ['guild', 'DM', 'bot'],
  cooldown: 5,
  args: {
    user: {
      type: 'user',
      name: {
        global: 'user',
        'pt-BR': 'usuário',
      },
      description: {
        global: 'The user to view info',
        'pt-BR': 'O usuário para ver o perfil',
      },
    },
  },
  defer: true,
  async run(interaction, args) {
    const l = interaction.locale;

    const user = await interaction.client.users.fetch(args.user?.id || interaction.user.id, { force: true });
    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    const dev = Env.Required('dev');

    let badges: string[] = [];
    if (user.flags) {
      for (const flag of user.flags) {
        switch (flag) {
          case 'Staff': {
            badges.push('Staff');
            break;
          }
          case 'Partner': {
            badges.push('Partner');
            break;
          }
          case 'Hypesquad': {
            badges.push('Hypesquad');
            break;
          }
          case 'BugHunterLevel1': {
            badges.push('BugHunterLevel1');
            break;
          }
          case 'BugHunterLevel2': {
            badges.push('BugHunterLevel2');
            break;
          }
          case 'HypeSquadOnlineHouse1': {
            badges.push('HypeSquadOnlineHouse1');
            break;
          }
          case 'HypeSquadOnlineHouse2': {
            badges.push('HypeSquadOnlineHouse2');
            break;
          }
          case 'HypeSquadOnlineHouse3': {
            badges.push('HypeSquadOnlineHouse3');
            break;
          }
          case 'PremiumEarlySupporter': {
            badges.push('PremiumEarlySupporter');
            break;
          }
          case 'VerifiedBot': {
            badges.push('VerifiedBot');
            break;
          }
          case 'VerifiedDeveloper': {
            badges.push('VerifiedDeveloper');
            break;
          }
          case 'ActiveDeveloper': {
            badges.push('ActiveDeveloper');
            break;
          }
          case 'CertifiedModerator': {
            badges.push('CertifiedModerator');
            break;
          }
        }
      }
    }

    if (user.bannerURL() || user.avatarURL()?.endsWith('.gif')) {
      badges.push('Nitro');
    }

    let tag = '';
    if (dev.includes(user.id)) {
      tag = `\n-# Developer\n`;
    }

    const icons = badges.map((badge) => Icon(badge)).join('');

    const avatar = user.avatarURL?.() ?? user.defaultAvatarURL;

    const text1 = new TextDisplay({
      content: `${Icon('Mention')} **${user.username}** ${Pill(`${user.id}`)}\n${icons}${tag}`,
    });
    const text2 = new TextDisplay({
      content: `${IconPill('Member', Translate(l, 'user:display'))}\n${SmallPill(member ? member.displayName : user.displayName)}`,
    });
    const text3 = new TextDisplay({
      content: `${IconPill('Calendar', Translate(l, 'user:created'))}\n${Timestamp(user.createdTimestamp, 'D')}`,
    });

    let text4;
    if (member) {
      text4 = new TextDisplay({
        content: `${IconPill('Greenie', Translate(l, 'user:joined'))}\n${Timestamp(member.joinedTimestamp!, 'D')}`,
      });
    }

    const thumb = new Thumbnail({
      url: avatar,
      description: 'User avatar',
    });

    const sect = new Section({
      components: [text1],
      accessory: thumb,
    });

    const sep = new Separator({
      spacing: SeparatorSpacingSize.Large,
      divider: true,
    });

    const container = new Container({ components: [sect, sep, text2, text3] });

    if (text4 !== undefined) {
      container.addTextDisplayComponents(text4);
    }

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
