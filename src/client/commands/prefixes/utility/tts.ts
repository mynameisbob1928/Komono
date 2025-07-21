import Prefix from 'core/bases/prefix';
import { ButtonStyle, ChannelType, MessageFlags, SeparatorSpacingSize } from 'discord.js';
import {
  TextDisplay,
  StringSelectMenu,
  ChannelSelectMenu,
  ActionRow,
  Button,
  Section,
  Separator,
} from 'utils/component';
import { Container } from 'utils/container';

export default new Prefix({
  name: 'tts',
  description: 'Set up TTS system for your server',
  permissions: {
    author: ['ManageGuild'],
    client: [],
  },
  dev: true,
  async run(client, message, args) {
    const text1 = new TextDisplay({ content: "## Set up Komono's TTS system" });

    const text2 = new TextDisplay({ content: 'Choose a channel where Komono will read messages using TTS' });

    const text3 = new TextDisplay({ content: 'Select a voice for your TTS' });

    const text4 = new TextDisplay({
      content:
        'Auto-detect:\n- If enabled, Komono will read all messages, not just mentions\n-# Example: @komono Hello chat -> Hello chat',
    });

    const text5 = new TextDisplay({
      content: 'Reset server config:\n- Clicking delete will erase all TTS data for this server',
    });

    const channelSelectMenu = new ChannelSelectMenu({
      customId: 'channelTTS',
      placeholder: 'Select a channel',
      channelTypes: [ChannelType.GuildText],
    });

    const stringSelectMenu = new StringSelectMenu({
      customId: 'voiceTTS',
      placeholder: 'Select a voice',
      options: [
        { label: 'Male (en-US)', value: 's0XGIcqmceN2l7kjsqoZ' },
        { label: 'Female (en-US', value: 'fsl9wxwCbGk0XzqV61Fj' },
        { label: 'Neutral (en-US)', value: 'QBKybXDLvDJ91ojuRiOU' },
      ],
    });

    const action1 = new ActionRow(channelSelectMenu);
    const action2 = new ActionRow(stringSelectMenu);

    const button1 = new Button({
      customId: 'autoDetectTTS',
      text: 'Enable',
      color: ButtonStyle.Primary,
    });

    const button2 = new Button({
      customId: 'dataResetTTS',
      text: 'Reset',
      color: ButtonStyle.Danger,
    });

    const sect1 = new Section({
      components: [text4],
      accessory: button1,
    });

    const sect2 = new Section({
      components: [text5],
      accessory: button2,
    });

    const sep = new Separator({
      spacing: SeparatorSpacingSize.Large,
      divider: true,
    });

    const container = new Container({
      components: [text1, sep, text2, action1, sep, text3, action2, sep, sect1, sep, sect2],
    });

    await message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
