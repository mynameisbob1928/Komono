import { Prefix } from "bases/prefix";
import { Handler } from "utils/handler"
import path from "path"

export default Prefix.Create({
    name: "reload",
    description: "Reloads events/commands/components",
    category: "Dev",
    cooldown: 5000,
    dev: true,
    args: [{ name: "type", type: "string", description: "Type of the item to reload (event, slash, prefix, component)", required: true }],
    async callback(client, message, args) {
        const type = args.type.toLowerCase();
        
        switch (type) {
            case "event":
                await Handler.Events.Reload(client, path.join(__dirname, "../../../events"));
                break;
            case "slash":
                await Handler.Slashes.Reload(client, path.join(__dirname, "../../slash"));
                break;
            case "prefix":
                await Handler.Prefixes.Reload(path.join(__dirname, ".."));
                break;
            case "component":
                await Handler.Components.Reload(path.join(__dirname, "../../../components"));
                break;
            default:
                await message.reply("Invalid type! Use: event, slash, prefix, or component.");
                return;
        };
        
        await message.reply(`${type} reloaded successfully!`);
    }
});