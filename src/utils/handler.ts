import { Collection, REST, Routes, type Client } from "discord.js";
import { Env } from "../libs/env";
import { ReadDirRecursive } from "../utils/utils";
import type { EventType, SlashType } from "../types/types";
import Slash from "../bases/slash";

export namespace Handler {
  type Paths = {
    events?: string;
    slashes?: string;
    prefixes?: string;
    components?: string;
  };

  export async function Load(path: string, cache: Collection<string, any>) {
    const promises: (Promise<any>)[] = [];

    ReadDirRecursive(path, (file) => {
      delete require.cache[require.resolve(file)];

      promises.push(import(file).then(({ default: data }) => {
        data.path = file;
        cache.set(data.name, data);

        return data;
      }));
    });

    return Promise.all(promises);
  };

  export async function Initialize(client: Client, paths: Paths) {
    const awaitList: (Promise<any>)[] = [];

    if(paths.events) awaitList.push(Load(paths.events, client.events));
    if(paths.slashes) awaitList.push(Load(paths.slashes, client.slashes));
    if(paths.prefixes) awaitList.push(Load(paths.prefixes, client.prefixes));
    if(paths.components) awaitList.push(Load(paths.components, client.components));

    return Promise.all(awaitList);
  };

  export async function Reload(client: Client, path: string, cache: Collection<string, any>) {
    switch (true) {
      case cache === client.events: {
        Events.Unbind(client);
        client.events.clear();
        await Load(path, client.events);
        Events.Bind(client);
        break;
      };
      case cache === client.slashes: {
        client.slashes.clear();
        await Load(path, client.slashes);
        await Slashes.Register(client);
        break;
      };
      case cache === client.prefixes: {
        client.prefixes.clear();
        await Load(path, client.prefixes);
        break;
      };
      case cache === client.components: {
        client.components.clear();
        await Load(path, client.components);
        break;
      };
    };
  };

  export namespace Events {
    export function Bind(client: Client) {
      Unbind(client);

      client.events.forEach((event: EventType) => {
        if (event.once) {
          client.once(event.type, event.run);
        } else {
          client.on(event.type, event.run);
        };
      });
    };

    export function Unbind(client: Client) {
      client.events.forEach((event: EventType) => client.off(event.type, event.run));
    };
  };

  export namespace Slashes {
    export const Rest = new REST().setToken(Env.Required("token").ToString());

    export async function Register(client: Client) {
      if (client.isReady()) {
        await Rest.put(Routes.applicationCommands(client.user.id), { body: client.slashes.map((slash: SlashType) => (Slash.Build(slash))) });
        return;
      };

      client.once("ready", async (client) => {
        await Rest.put(Routes.applicationCommands(client.user.id), { body: client.slashes.map((slash: SlashType) => (Slash.Build(slash))) });
        return;
      });
    };
  };
};