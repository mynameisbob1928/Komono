import { Prefix } from "bases/prefix";
import { Embed } from "utils/embed";
import { Markdown } from "utils/markdown";

export default Prefix.Create({
    name: "eval",
    description: "Executes code",
    category: "Dev",
    cooldown: 5000,
    dev: true,
    args: [{ name: "code", type: "string", description: "Code to be executed", required: true }],
    async callback(client, message, args) {
        const code = args.code

        let evaled;
        try {
            evaled = await (async () => eval(code))();

            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled, { depth: 1, maxArrayLength: 10 });
            };
        } catch (e) {
            evaled = (e as Error).toString();
        };

        if (evaled.length > 2000) {
            await message.reply({
                embeds: [Embed.Error({
                    description: `${Markdown.Icon("Error")} Output too long to display.`
                })]
            });
            return;
        };

        await message.reply({
            embeds: [Embed.Create({
                description: Markdown.Codeblock("ts", evaled)
            })]
        });
    }
});