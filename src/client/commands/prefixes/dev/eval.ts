import { Prefix } from "bases/prefix";
import { MessageFlags } from "discord.js";
import { Component } from "utils/component";
import { Container } from "utils/container";
import { Embed } from "utils/embed";
import { Icon, Codeblock } from "utils/markdown";

export default Prefix({
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
            evaled = eval(code);

            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled, { depth: 1, maxArrayLength: 10 });
            };
        } catch (e) {
            evaled = (e as Error).toString();
        };

        if (evaled.length > 2000) {
            const components = Component({
                text: {
                    type: "TextDisplay",
                    content: `${Icon("Error")} Output too long to display.`
                }
            });

            const container = Container({ components: [components.text] });

            await message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
                /*
                embeds: [Embed({
                    description: `${Icon("Error")} Output too long to display.`,
                    color: "Red"
                })]
                */
            });
            return;
        };

        const components = Component({
            text: {
                type: "TextDisplay",
                content: Codeblock("ts", evaled)
            }
        });

        const container = Container({ components: [components.text] });

        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
            /*
            embeds: [Embed({
                description: Codeblock("ts", evaled)
            })]
            */
        });
    }
});