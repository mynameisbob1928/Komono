import { REST, Routes, type Client } from 'discord.js';
import Env from 'libs/env';
import type { SlashType } from 'types/types';
import Slash from 'core/bases/slash';

export const Rest = new REST().setToken(Env.Required('token'));

export async function Register(client: Client) {
  await Rest.put(Routes.applicationCommands(Env.Required('id')), {
    body: client.slashes.map((slash: SlashType) => Slash.Build(slash)),
  });
}
