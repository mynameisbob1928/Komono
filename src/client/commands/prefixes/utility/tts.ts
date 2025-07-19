import Prefix from "bases/prefix";
import { Component } from "utils/component";
import { ButtonStyle, ChannelType, MessageFlags, SeparatorSpacingSize } from "discord.js";
import { Container } from "utils/container";

export default new Prefix({
    name: "tts",
    description: "Set up TTS system for your server",
    permissions: {
        author: ["ManageGuild"],
        client: []
    },
    dev: true,
    async run(client, message, args) {
        const text1 = Component.Create({
            type: "textDisplay",
            content: "## Set up Komono's TTS system"
        });

        const text2 = Component.Create({
            type: "textDisplay",
            content: "Choose a channel where Komono will read messages using TTS"
        });

        const text3 = Component.Create({
            type: "textDisplay",
            content: "Select a voice for your TTS"
        });

        const text4 = Component.Create({
            type: "textDisplay",
            content: "Auto-detect:\n- If enabled, Komono will read all messages, not just mentions\n-# Example: @komono Hello chat -> Hello chat"
        });

        const text5 = Component.Create({
            type: "textDisplay",
            content: "Reset server config:\n- Clicking delete will erase all TTS data for this server"
        });

        const channelSelectMenu = Component.Create({
            type: "channelSelectMenu",
            customId: "channelTTS",
            text: "Select a channel",
            channelType: [ChannelType.GuildText]
        });

        const stringSelectMenu = Component.Create({
            type: "stringSelectMenu",
            customId: "voiceTTS",
            text: "Select a voice",
            options: [
                { label: "Male (en-US)", value: "s0XGIcqmceN2l7kjsqoZ" },
                { label: "Female (en-US", value: "fsl9wxwCbGk0XzqV61Fj" },
                { label: "Neutral (en-US)", value: "QBKybXDLvDJ91ojuRiOU" }
            ]
        });

        const action1 = Component.CreateActionRow([channelSelectMenu]);
        const action2 = Component.CreateActionRow([stringSelectMenu]);

        const button1 = Component.Create({
            type: "button",
            customId: "autoDetectTTS",
            text: "Enable",
            color: ButtonStyle.Primary
        });
        
        const button2 = Component.Create({
            type: "button",
            customId: "dataWipeTTS",
            text: "Reset",
            color: ButtonStyle.Danger
        });

        const sect1 = Component.Create({
            type: "section",
            components: [text4],
            accessory: button1
        });

        const sect2 = Component.Create({
            type: "section",
            components: [text5],
            accessory: button2
        });

        const sep = Component.Create({
            type: "separator",
            spacing: SeparatorSpacingSize.Large,
            divider: true
        });

        const container = Container.Create({ components: [text1, sep, text2, action1, sep, text3, action2, sep, sect1, sep, sect2] });

        await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
});