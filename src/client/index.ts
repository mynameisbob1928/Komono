import { Client, GatewayIntentBits } from "discord.js";
import { Env } from "../utils/env";
import { Handler } from "../utils/handler";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const token = Env.Required("token").ToString();

await Handler.Initialize({
  events: `${__dirname}/events`,
  slashes: `${__dirname}/commands/slash`,
  prefixes: `${__dirname}/commands/prefix`
});

Handler.Events.Bind(client);
await Handler.Slashes.Bind(client);

await client.login(token);