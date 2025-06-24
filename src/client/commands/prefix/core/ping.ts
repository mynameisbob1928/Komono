import { Prefix } from "../../../../bases/prefix";

export default Prefix.Create({
    name: "ping",
    description: "Check if the bot is alive",
    category: "Core",
    cooldown: 5000,
    async callback(client, messagee, args) {
        await messagee.reply({
            content: client.ws.ping.toString()
        });
    }
});