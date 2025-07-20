import Prefix from "bases/prefix";
import { MessageFlags } from "discord.js";
import { Component } from "utils/component";
import { Container } from "utils/container";
import { Highlight, Icon } from "utils/markdown";

export default new Prefix({
    name: "purge",
    aliases: ["clean", "wipe"],
    description: "Delete messages in the current channel",
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
    async run(client, message, args) {
        if (!message.inGuild()) return;
        const amount = args.amount;
        const content = args.content;
        const channel = message.channel;

        if (!channel?.isTextBased()) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Error")} This command can only be used in text channels`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };
        
        const messages = await channel.messages.fetch({ limit: amount + 1 });
        let filtered = messages;
        if (content) {
            filtered = messages.filter(msg => msg.content === content && msg.id !== message.id);
        } else {
            filtered = messages.filter(msg => msg.id !== message.id)
        };
    

        if (filtered.size === 0) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Info")} No messages found with that content`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        await channel.bulkDelete(filtered, true);

        const text = Component.Create({
            type: "textDisplay",
            content: `${Icon("Success")} Successfully deleted ${Highlight(filtered.size)} messages`
        });

        const container = Container.Create({ components: [text] });

        const msg = await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        setTimeout(() => msg.delete(), 5000);
    }
});