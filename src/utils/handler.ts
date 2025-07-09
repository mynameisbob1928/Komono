import { Collection, REST, Routes, type Client } from "discord.js";
import fs from "fs";
import { Event } from "bases/event";
import { Slash } from "bases/slash";
import { Prefix } from "bases/prefix";
import { Component } from "bases/component";
import { Env } from "./env";
import path from "path";

export namespace Handler {
  export type Paths = {
    events?: string;
    slashes?: string;
    prefixes?: string;
    components?: string;
  };

  export type EventType = ReturnType<typeof Event["Create"]> & { path: string; };
  export type SlashType = ReturnType<typeof Slash["Create"]> & { path: string; };
  export type PrefixType = ReturnType<typeof Prefix["Create"]> & { path: string; };
  export type ComponentType = ReturnType<typeof Component["Create"]> & { path: string; };

  /*
  export const Cache = {
    events: new Collection<string, EventType>(),
    slashes: new Collection<string, SlashType>(),
    prefixes: new Collection<string, PrefixType>(),
    components: new Collection<string, ComponentType>()
  };
  */

  export function ReadDirRecursive(dir: string, callback: (filepath: string, filename: string) => any): any[] {
    return fs.readdirSync(dir).flatMap((filename) => {
      const filepath = path.join(dir, filename);

      if(fs.statSync(filepath).isDirectory()) {
        return ReadDirRecursive(filepath, callback);
      };

      return callback(filepath, filename);
    });
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

  export namespace Events {
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

    export function Unbind(client: Client) {
      client.events.forEach((event: EventType) => client.off(event.type, event.callback));
    };
    
    export async function Reload(client: Client, path: string) {
      Unbind(client);
      
      client.events.clear();

      await Load(path, client.events) as EventType[];

      Bind(client);
      return;
    };
  };

  export namespace Slashes {
    export const Rest = new REST().setToken(Env.Required("token").ToString());

    export async function Bind(client: Client) {
      if (client.isReady()) {
        await Rest.put(Routes.applicationCommands(client.user.id), { body: client.slashes.map((slash: SlashType) => Slash.ToJSON(slash)) });
        return;
      };

      client.once("ready", async (client) => {
        await Rest.put(Routes.applicationCommands(client.user.id), { body: client.slashes.map((slash: SlashType) => Slash.ToJSON(slash)) });
        return;
      });
    };

    export async function Reload(client: Client, path: string) {
      client.slashes.clear();

      await Load(path, client.slashes) as SlashType[];

      // @ts-ignore
      await Rest.put(Routes.applicationCommands(client.user.id), { body: Cache.slashes.map((slash) => Slash.ToJSON(slash)) });
      return;
    };
  };
  
  export namespace Prefixes {
    export async function Reload(client: Client, path: string) {
      client.prefixes.clear();

      await Load(path, client.prefixes) as PrefixType[];
      return;
    };
  };

  export namespace Components {
    export async function Reload(client: Client, path: string) {
      client.components.clear();

      await Load(path, client.components) as ComponentType[];
      return;
    };
  }
};