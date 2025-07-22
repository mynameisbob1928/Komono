import Prefix from 'bases/prefix';
import { MessageFlags, SeparatorSpacingSize } from 'discord.js';
import Env from 'libs/env';
import { Section, Separator, TextDisplay, Thumbnail } from 'utils/component';
import { Container } from 'utils/container';
import { Icon, IconPill, Pill, SmallPill, Timestamp } from 'utils/markdown';

export default new Prefix({
  name: 'user',
  aliases: ['userinfo', 'u', 'ui', 'profile'],
  description: 'View user profile',
  cooldown: 5,
  args: {
    user: {
      type: 'user',
      description: 'The user to view info',
      foo: 'bar',
    },
  },
  async run(client, message, args) {
    if (!message.inGuild()) return;

    const user = await client.users.fetch(args.user?.id || message.author.id, {
      force: true,
    });
    const member = await message.guild.members.fetch(user.id).catch(() => null);

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
      content: `${IconPill('Member', 'Display')}\n${SmallPill(member ? member.displayName : user.displayName)}`,
    });
    const text3 = new TextDisplay({
      content: `${IconPill('Calendar', 'Created')}\n${Timestamp(user.createdTimestamp, 'D')}`,
    });

    let text4;
    if (member) {
      text4 = new TextDisplay({
        content: `${IconPill('Greenie', 'Joined')}\n${Timestamp(member.joinedTimestamp!, 'D')}`,
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

    await message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
