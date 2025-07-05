import { ActivityType, GatewayIntentBits, Options, Partials, Sweepers } from "discord.js";
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
  partials: [Partials.Message, Partials.Channel],
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    ApplicationCommandManager: 0,
    ApplicationEmojiManager: 0,
    AutoModerationRuleManager: 0,
    BaseGuildEmojiManager: 0,
    DMMessageManager: 0,
    EntitlementManager: 0,
    GuildBanManager: 0,
    GuildEmojiManager: 0,
    GuildForumThreadManager: 0,
    GuildInviteManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    GuildTextThreadManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadMemberManager: 0,
    VoiceStateManager: 0
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    guildMembers: {
      interval: 300,
      filter: Sweepers.filterByLifetime({
        lifetime: 300,
        excludeFromSweep: (member): boolean => member.id !== client.user?.id
      })
    },
    messages: {
      interval: 3600,
      filter: Sweepers.filterByLifetime({
        lifetime: 3600
      })
    }
  },
  allowedMentions: { parse: [] },
  presence: { status: "online", activities: [{ name: "Canary version of Komono.", type: ActivityType.Custom }] },
  enforceNonce: true
});

const token = Env.Required("token").ToString();
const now = Date.now();

process.on("uncaughtException", (error) => {
  Log.Write(`Uncaught Exception: ${error}`, "red");
});

process.on("unhandledRejection", (reason, promise) => {
  Log.Write(`Unhandled Rejection at: ${promise} with the reason: ${reason}`, "red");
});

process.on("warning", (warning) => {
  Log.Write(`WARNING: ${warning.name} : ${warning.message}`, "red");
});

await Handler.Initialize({
  events: `${__dirname}/events`,
  slashes: `${__dirname}/commands/slash`,
  prefixes: `${__dirname}/commands/prefix`,
  components: `${__dirname}/components`
});

Handler.Events.Bind(client);
await Handler.Slashes.Bind(client);

client.once("ready", (client) => {
  Log.Write(`${client.user?.username} is ready! Application startup took: ${Utils.Format(Date.now() - now)}.`, "yellow")
});

await client.login(token);