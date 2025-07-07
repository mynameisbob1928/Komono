import { Event } from "bases/event";
import { Log } from "utils/log";

export default Event.Create({
    name: "linkViewer",
    type: "messageCreate",
    async callback(message) {
        try {
            if (message.author.bot || !message.guild?.members.me?.permissions.has("SendMessages")) return;

            const match = message.content.match(/https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
            if (match) {
                const [, guildId, channelId, messageId] = match;
                if (!guildId || !channelId || !messageId) return;

                const channel = message.client.channels.cache.get(channelId) || await message.client.channels.fetch(channelId).catch(() => null);
                if (!channel || !channel?.isTextBased()) return;

                const linkedMessage = channel.messages.cache.get(messageId) || await channel.messages.fetch(messageId).catch(() => null);
                if (!linkedMessage) return;

                await linkedMessage.forward(message.channel);
            };

        } catch (e) {
            Log.Write(e);
        };
    }
});