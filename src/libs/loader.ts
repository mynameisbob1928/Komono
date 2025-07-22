import { Collection, type Client } from 'discord.js';
import { ReadDirRecursive } from 'utils/utils';
import { Bind, Unbind } from './listener';
import { Register } from './register';

export type Paths = {
  events?: string;
  slashes?: string;
  prefixes?: string;
  components?: string;
};

export async function Load(path: string, cache: Collection<string, any>) {
  const promises: Promise<any>[] = [];

  ReadDirRecursive(path, (file) => {
    delete require.cache[require.resolve(file)];

    promises.push(
      import(file).then(({ default: data }) => {
        data.path = file;
        cache.set(data.name, data);

        return data;
      }),
    );
  });

  return Promise.all(promises);
}

export async function Initialize(client: Client, paths: Paths) {
  const awaitList: Promise<any>[] = [];

  if (paths.events) awaitList.push(Load(paths.events, client.events));
  if (paths.slashes) awaitList.push(Load(paths.slashes, client.slashes));
  if (paths.prefixes) awaitList.push(Load(paths.prefixes, client.prefixes));
  if (paths.components) awaitList.push(Load(paths.components, client.components));

  return Promise.all(awaitList);
}

export async function Reload(client: Client, path: string, cache: Collection<string, any>) {
  switch (true) {
    case cache === client.events: {
      Unbind(client);
      client.events.clear();
      await Load(path, client.events);
      Bind(client);
      break;
    }
    case cache === client.slashes: {
      client.slashes.clear();
      await Load(path, client.slashes);
      await Register(client);
      break;
    }
    case cache === client.prefixes: {
      client.prefixes.clear();
      await Load(path, client.prefixes);
      break;
    }
    case cache === client.components: {
      client.components.clear();
      await Load(path, client.components);
      break;
    }
  }
}
