import { ActivityType, GatewayIntentBits } from "discord.js";
import { ShardingClient } from "status-sharding";
import { Env } from "utils/env";
import { Handler } from "utils/handler";
import { Log } from "utils/log";
import { Utils } from "utils/utils";

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
const now = Date.now();

await Handler.Initialize({
  events: `${__dirname}/events`,
  slashes: `${__dirname}/commands/slash`,
  prefixes: `${__dirname}/commands/prefix`,
  components: `${__dirname}/components`
});

Handler.Events.Bind(client);
await Handler.Slashes.Bind(client);

client.once("ready", (client) => {
  Log.Write(`${client.user?.username} is ready! Application startup took: ${Utils.Format(Date.now() - now)}.`, "green")
});

await client.login(token);