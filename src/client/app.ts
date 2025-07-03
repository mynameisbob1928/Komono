import { ActivityType, GatewayIntentBits } from "discord.js";
import { ShardingClient } from "status-sharding";
import { Env } from "utils/env";
import { Handler } from "utils/handler";

const client = new ShardingClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  allowedMentions: { parse: [] },
  presence: { status: "online", activities: [{ name: "Canary version of Komono.", type: ActivityType.Custom }] }
});

const token = Env.Required("token").ToString();

await Handler.Initialize({
  events: `${__dirname}/events`,
  slashes: `${__dirname}/commands/slash`,
  prefixes: `${__dirname}/commands/prefix`,
  components: `${__dirname}/components`
});

Handler.Events.Bind(client);
await Handler.Slashes.Bind(client);

await client.login(token);