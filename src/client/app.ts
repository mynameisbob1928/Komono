import { ActivityType, Collection, ComponentType, GatewayIntentBits, Options, Partials, Sweepers } from 'discord.js';
import Env from 'libs/env';
import path from 'path';
import { ShardingClient } from 'status-sharding';
import type { EventType, SlashType, PrefixType } from 'types/types';
import { Initialize, Reload } from 'libs/loader';
import { Bind } from 'libs/listener';
import { Register } from 'libs/register';
import { Log } from 'utils/log';
import { Debounce, TimeFormat } from 'utils/utils';
import FolderWatcher from 'utils/watcher';
import Prisma from 'libs/database';

class Client extends ShardingClient {
  public events = new Collection<string, EventType>();
  public slashes = new Collection<string, SlashType>();
  public prefixes = new Collection<string, PrefixType>();
  public components = new Collection<string, ComponentType>();
  public cooldown = new Collection<string, Collection<string, number>>();
  public prefix = 'k.';
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
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
    ThreadMemberManager: 0,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    guildMembers: {
      interval: 300,
      filter: Sweepers.filterByLifetime({
        lifetime: 300,
        excludeFromSweep: (member): boolean => member.id !== client.user?.id,
      }),
    },
    messages: {
      interval: 3600,
      filter: Sweepers.filterByLifetime({
        lifetime: 3600,
      }),
    },
  },
  allowedMentions: { parse: [] },
  presence: {
    status: 'online',
    activities: [{ name: 'Canary version of Komono.', type: ActivityType.Custom }],
  },
});

const token = Env.Required('token');
const now = Date.now();

process.on('uncaughtException', (error) => {
  Log('Uncaught Exception', 'red');
  Log(error, 'red');
});

process.on('unhandledRejection', (reason, promise) => {
  Log('Unhandled Rejection', 'red');
  Log(promise, 'red');
  Log('With the reason', 'red');
  Log(reason, 'red');
});

process.on('warning', (warning) => {
  Log('WARNING', 'yellow');
  Log(warning, 'yellow');
});

process.on('SIGINT', async () => {
  Log('Shutting down Komono...', 'cyan');
  await client.destroy();

  Log('Shutting down prisma...', 'cyan');
  await Prisma.$disconnect();

  process.exit(0);
});

await Initialize(client, {
  events: `${__dirname}/events`,
  slashes: `${__dirname}/commands/slashes`,
  prefixes: `${__dirname}/commands/prefixes`,
  // components: `${__dirname}/components`,
});

const watcher = new FolderWatcher(path.join('src', 'client'), true);

async function HotReload(filepath: string) {
  Log(`Hot reload triggered for ${path.normalize(filepath)}`, 'yellow');
  let cache, dir;

  const normalized = path.normalize(filepath);

  switch (true) {
    case normalized.includes(path.join('events')): {
      dir = path.join('src', 'client', 'events');
      cache = client.events;
      break;
    }

    case normalized.includes(path.join('commands', 'slashes')): {
      dir = path.join('src', 'client', 'commands', 'slashes');
      cache = client.slashes;
      break;
    }

    case normalized.includes(path.join('commands', 'prefixes')): {
      dir = path.join('src', 'client', 'commands', 'prefixes');
      cache = client.prefixes;
      break;
    }

    case normalized.includes(path.join('components')): {
      dir = path.join('src', 'client', 'components');
      cache = client.components;
      break;
    }
  }

  if (!cache || !dir) {
    Log('Hot reload ignored', 'red');
    return;
  }

  Log(`Reloading ${dir}`, 'yellow');
  await Reload(client, dir, cache);
}

watcher.onAdd = Debounce(HotReload, 5000);
watcher.onChange = Debounce(HotReload, 5000);
watcher.onRemove = Debounce(HotReload, 5000);

Bind(client);
await Register(client);

client.once('ready', (client) => {
  Log(`${client.user!.username} is ready! Application startup took: ${TimeFormat(Date.now() - now)}.`, 'cyan');
});

await client.login(token);
