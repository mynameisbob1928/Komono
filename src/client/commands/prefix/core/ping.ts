import { Prefix } from "bases/prefix";

export default Prefix.Create({
    name: "ping",
    description: "Check if the bot is alive",
    category: "Core",
    cooldown: 3000,
    async callback(client, message, args) {
        await message.reply("Pong!");
    }
});