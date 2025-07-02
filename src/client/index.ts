import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import { Env } from "../utils/env";
import { Handler } from "../utils/handler";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  allowedMentions: { parse: [] },
  presence: { status: "online", activities: [{ name: "Canary version of Komono.", type: ActivityType.Custom }] }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "Reason:", reason);
});

process.on("warning", (warning) => {
  console.warn(`WARNING: ${warning.name} : ${warning.message}`);
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