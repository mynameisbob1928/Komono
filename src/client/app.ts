import { ActivityType, Collection, ComponentType, GatewayIntentBits, Options, Partials, Sweepers } from "discord.js";
import { Env } from "libs/env";
import path from "path";
import { ShardingClient } from "status-sharding";
import type { EventType, SlashType, PrefixType } from "types/types";
import { Handler } from "utils/handler";
import { Log } from "utils/log";
import { Debounce, TimeFormat } from "utils/utils";
import FolderWatcher from "utils/watcher";

class Client extends ShardingClient {
    public events = new Collection<string, EventType>();
    public slashes = new Collection<string, SlashType>();
    public prefixes = new Collection<string, PrefixType>();
    public components = new Collection<string, ComponentType>()
    public cooldown = new Collection<string, Collection<string, number>>();
    public prefix = "k.";
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message],
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
      ThreadMemberManager: 0
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
    presence: { status: "online", activities: [{ name: "Canary version of Komono.", type: ActivityType.Custom }] }
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
  Log.Write(`WARNING: ${warning.name} : ${warning.message}`, "yellow");
});

process.on("SIGINT", async () => {
  Log.Write("Shutting down Komono...", "cyan");
  await client.destroy();

  process.exit(0);
});

await Handler.Initialize(client, {
  events: `${__dirname}/events`,
  slashes: `${__dirname}/commands/slashes`,
  prefixes: `${__dirname}/commands/prefixes`,
  components: `${__dirname}/components`
});

const watcher = new FolderWatcher(path.join("src", "client"), true);

async function HotReload(filepath: string) {
  Log.Write(`Hot reload triggered for ${path.normalize(filepath)}`, "yellow");
  let cache, dir;

  const normalized = path.normalize(filepath);

  switch (true) {
    case normalized.includes(path.join("events")): {
      dir = path.join("src", "client", "events");
      cache = client.events;
      break;
    };
    case normalized.includes(path.join("commands", "slashes")): {
      dir = path.join("src", "client", "commands", "slashes");
      cache = client.slashes;
      break;
    };
    case normalized.includes(path.join("commands", "prefixes")): {
      dir = path.join("src", "client", "commands", "prefixes");
      cache = client.prefixes;
      break;
    };
    case normalized.includes(path.join("components")): {
      dir = path.join("src", "client", "components");
      cache = client.components;
      break;
    };
  };

  if (!cache || !dir) {
    Log.Write("Hot reload ignored", "red");
    return;
  };

  Log.Write(`Reloading ${dir}`, "yellow")
  await Handler.Reload(client, dir, cache);
};

watcher.onAdd = Debounce(HotReload, 5000);
watcher.onChange = Debounce(HotReload, 5000);
watcher.onRemove = Debounce(HotReload, 5000);

Handler.Events.Bind(client);
await Handler.Slashes.Register(client);

client.once("ready", (client) => {
  Log.Write(`${client.user!.username} is ready! Application startup took: ${TimeFormat(Date.now() - now)}.`, "cyan");
});

await client.login(token);