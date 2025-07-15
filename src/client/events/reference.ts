import { Event } from "bases/event";
import { Write } from "utils/log";
import { Reference } from "utils/utils";

export default Event({
    name: "reference",
    type: "messageDelete",
    async callback(message) {
        try {
            if (!message.inGuild() || message.author?.bot || !message.guild.members.me) return;

            const references = await Reference(message);
            for (const reference of references) {
                await reference.delete();
            };
        } catch (e) {
            Write(e, "red");
        };
    }
});