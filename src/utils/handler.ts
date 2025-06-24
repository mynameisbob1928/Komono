import fs from "fs";
import { Collection, REST, Routes, type Client } from "discord.js";
import { Env } from "./env";
import { Slash } from "../bases/slash";
import { Event } from "../bases/event";
import { Prefix } from "../bases/prefix";
import { Component } from "../bases/component";

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

  export const Cache = {
    events: new Collection<string, EventType>(),
    slashes: new Collection<string, SlashType>(),
    prefixes: new Collection<string, PrefixType>(),
    components: new Collection<string, ComponentType>()
  };

  export function ReadDirRecursive(path: string, callback: (path: string, filename: string) => any): any[] {
    return fs.readdirSync(path).map((filename) => {
      const filepath = `${path}\\${filename}`;

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
        if (!data) {
          throw new Error(`Failed to load data from file: ${file}`);
        };

        const key = data.name || data.body?.name || data.type || data.id
        if (!key) {
          throw new Error(`Data in file ${file} does not have a valid name or type.`);
        };
        
        data.path = file;
        cache.set(key, data);

        return data;
      }));
    });

    return Promise.all(promises);
  };

  export async function Initialize(paths: Paths) {
    const awaitList: (Promise<any>)[] = [];

    if(paths.events) awaitList.push(Load(paths.events, Cache.events));
    if(paths.slashes) awaitList.push(Load(paths.slashes, Cache.slashes));
    if(paths.prefixes) awaitList.push(Load(paths.prefixes, Cache.prefixes));
    if(paths.components) awaitList.push(Load(paths.components, Cache.components));

    return Promise.all(awaitList);
  };

  export namespace Events {
    export function Bind(client: Client) {
      Unbind(client);

      Cache.events.forEach((event) => client.on(event.type, event.callback));
    };

    export function Unbind(client: Client) {
      Cache.events.forEach((event) => client.off(event.type, event.callback));
    };

    export async function Reload(client: Client, event: EventType) {
      Cache.events.delete(event.type);

      client.off(event.type, event.callback);

      return Load(event.path, Cache.events);
    };
  };

  export namespace Slashes {
    export const Rest = new REST().setToken(Env.Required("token").ToString());

    export async function Bind(client: Client) {
      if (client.isReady()) return Rest.put(Routes.applicationCommands(client.user.id), { body: Cache.slashes.map((slash) => Slash.ToJSON(slash.body)) });

      client.once("ready", async (client) => {
        return Rest.put(Routes.applicationCommands(client.user.id), { body: Cache.slashes.map((slash) => Slash.ToJSON(slash.body)) });
      });
    };

    export async function Reload(client: Client, slash: SlashType) {
      Cache.slashes.delete(slash.body.name);

      [slash] = await Load(slash.path, Cache.slashes) as SlashType[];

      // @ts-ignore
      return Rest.put(Routes.applicationCommands(client.user.id), { body: Slash.ToJSON(slash.body) })
    };
    
    export function Find(name: string) {
      return Cache.slashes.find(slash => slash.body.name === name);
    };
  };
  
  export namespace Prefixes {
    export async function Reload(prefix: PrefixType) {
      Cache.prefixes.delete(prefix.name);

      return Load(prefix.path, Cache.prefixes);
    };

    export function Find(name: string) {
      return Cache.prefixes.find(prefix => prefix.name === name);
    };
  };

  export namespace Components {
    export async function Reload(component: ComponentType) {
      Cache.components.delete(component.id);

      return Load(component.path, Cache.components);
    };

    export function Find(id: string) {
      return Cache.components.find(component => component.id === id);
    };
  }
};