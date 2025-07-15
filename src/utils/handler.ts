import { type Collection, type Client, Routes, REST } from "discord.js";
import type { EventType, Paths, SlashType } from "utils/types";
import { ReadDirRecursive } from "utils/utils";
import { ToJSON } from "bases/slash";
import { Required } from "./env";
import { pathToFileURL } from "bun";
import path from "path";

export const Rest = new REST().setToken(Required("token").ToString());

export async function Load(dir: string, cache: Collection<string, any>) {
  const promises: (Promise<any>)[] = [];

  ReadDirRecursive(dir, (file) => {
    delete require.cache[require.resolve(file)];

    promises.push(import(pathToFileURL(path.resolve(file)).href).then(({ default: data }) => {
      data.path = file;
      cache.set(data.name, data);

      return data;
    }));
  });

  return Promise.all(promises);
};

export async function Reload(client: Client, path: string, cache: Collection<string, any>) {
  switch (true) {
    case cache === client.events: {
      Unbind(client);

      client.events.clear();

      await Load(path, client.events);

      Bind(client);
      break;
    };
    case cache === client.slashes: {
      client.slashes.clear();

      await Load(path, client.slashes);

      await Register(client);
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

export async function Initialize(client: Client, paths: Paths) {
  const awaitList: (Promise<any>)[] = [];

  if(paths.events) awaitList.push(Load(paths.events, client.events));
  if(paths.slashes) awaitList.push(Load(paths.slashes, client.slashes));
  if(paths.prefixes) awaitList.push(Load(paths.prefixes, client.prefixes));
  if(paths.components) awaitList.push(Load(paths.components, client.components));

  return Promise.all(awaitList);
};

export function Bind(client: Client) {
    Unbind(client);

    client.events.forEach((event: EventType) => {
        if (event.once) {
            client.once(event.type, event.callback);
        } else {
            client.on(event.type, event.callback);
        };
    });
};

function Unbind(client: Client) {
    client.events.forEach((event: EventType) => client.off(event.type, event.callback));
};

export async function Register(client: Client) {
  client.once("ready", async (client) => {
    await Rest.put(Routes.applicationCommands(client.user.id), { body: client.slashes.map((slash: SlashType) => ToJSON(slash)) });
  }) 
}
