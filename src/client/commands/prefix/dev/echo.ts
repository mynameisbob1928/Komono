import { Prefix } from "bases/prefix";

export default Prefix.Create({
    name: "echo",
    description: "Repeats the message you send",
    category: "Dev",
    cooldown: 3000,
    dev: true,
    args: [{ name: "message", type: "string", description: "message to be repeated", required: true }],
    async callback(client, message, args) {
        await message.reply(args.message);
    }
});