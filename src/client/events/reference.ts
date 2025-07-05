import { Event } from "bases/event";
import { Log } from "utils/log";
import { Utils } from "utils/utils";

export default Event.Create({
    name: "reference",
    type: "messageDelete",
    async callback(message) {
        try {
            if (message.partial) await message.fetch();
            if (!message.inGuild() || message.author?.bot || !message.guild.members.me) return;

            const references = await Utils.Reference(message);
            for (const reference of references) {
                await reference.delete();
            };
        } catch (e) {
            Log.Write(e, "red");
        };
    }
});