import { Prefix } from "bases/prefix";
import { Handler } from "utils/handler"

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
                await Handler.Events.Reload(client, `${__dirname}/../../../../events`);
                break;
            case "slash":
                await Handler.Slashes.Reload(client, `${__dirname}/../../../slash`);
                break;
            case "prefix":
                await Handler.Prefixes.Reload(`${__dirname}/..`);
                break;
            case "component":
                await Handler.Components.Reload(`${__dirname}/../../../components`);
                break;
            default:
                await message.reply("Invalid type! Use: event, slash, prefix, or component.");
                return;
        };
        
        await message.reply(`${type} reloaded successfully!`);
    }
});