import { Prefix } from "bases/prefix";
import Together from "together-ai";
import { Required } from "utils/env";

export default Prefix({
    name: "ask",
    description: "Ask AI anything you want",
    category: "Dev",
    cooldown: 5000,
    dev: true,
    args: [{ name: "msg", type: "string", description: "Message to send to the AI for processing" }],
    async callback(client, message, args) {
        const model = Required("together_model").ToString();
        const key = Required('together_key').ToString();
        const instruction = `You are a friendly chatbot named Komono, designed to assist people. Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Always use gender-neutral pronouns when possible. Be concise and to the point. Keep responses under 2000 characters. Respond naturally using Markdown formatting.`
        const msg = args.msg;

        const together = new Together({ apiKey: key });

        const res = await together.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: instruction },
                { role: "user", content: msg }
            ],
            max_tokens: 2000
        });

        if (!res.choices[0]?.message?.content) {
            await message.reply("No response from AI.");
            return;
        };

        await message.reply(`${res.choices[0].message.content}\n-# ${model}`);
    }
});