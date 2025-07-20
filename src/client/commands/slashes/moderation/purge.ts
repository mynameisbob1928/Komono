import Slash from "bases/slash";
import { MessageFlags } from "discord.js";
import { Translate } from "libs/locales";
import { Component } from "utils/component";
import { Container } from "utils/container";
import { Log } from "utils/log";
import { Highlight, Icon } from "utils/markdown";

export default new Slash({
    name: "purge",
    description: "Delete messages in the current channel",
    integrations: ["guild"],
    contexts: ["guild"],
    cooldown: 5,
    permissions: {
        author: ["ManageMessages"],
        client: []
    },
    args: {
        amount: {
            type: "number",
            name: "amount",
            description: "Number of messages to delete",
            min: 1,
            max: 100,
            isInteger: true,
            required: true
        },
        content: {
            type: "string",
            name: "content",
            description: "Message content to delete"
        }
    },
    defer: true,
    async run(interaction, args) {
        if (!interaction.inCachedGuild()) return;
        const l = interaction.locale;

        const amount = args.amount;
        const content = args.content;
        const channel = interaction.channel;

        if (!channel?.isTextBased()) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Error")} ${Translate(l, "channelTypeError")}`
            });

            const container = Container.Create({ components: [text] });

            await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };
        
        const messages = await channel.messages.fetch({ limit: amount + 1 });
        const i = await interaction.fetchReply();
        let filtered = messages;
        if (content) {
            filtered = messages.filter(msg => msg.content === content && msg.id !== i.id);
        } else {
            filtered = messages.filter(msg => msg.id !== i.id);
        };
    

        if (filtered.size === 0) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Info")} ${Translate(l, "noContentError")}`
            });

            const container = Container.Create({ components: [text] });

            await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        await channel.bulkDelete(filtered, true);

        const text = Component.Create({
            type: "textDisplay",
            content: `${Icon("Success")} ${Translate(l, "bulkDeleteSuccess", [filtered.size])}`
        });

        const container = Container.Create({ components: [text] });

        const int = await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        setTimeout(() => int.delete(), 5000);
    }
});