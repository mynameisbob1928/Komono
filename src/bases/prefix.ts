import type { Client, Message, Role, User, GuildMember, ChannelType } from 'discord.js';
import type { allowedChannelTypes, CommandPermission, Optional } from 'types/types';
import { Highlight } from 'utils/markdown';

export type PrefixArgType = 'string' | 'number' | 'boolean' | 'channel' | 'user' | 'role';

export interface PrefixArgBase<T extends PrefixArgType> {
  description: string;
  type: T;
}

export interface PrefixArgRole extends PrefixArgBase<'role'> {
  required?: boolean;
}

export interface PrefixArgUser extends PrefixArgBase<'user'> {
  required?: boolean;
  isMember?: boolean;
}

export interface PrefixArgString extends PrefixArgBase<'string'> {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  choices?: Record<string, string>;
}

export interface PrefixArgNumber extends PrefixArgBase<'number'> {
  required?: boolean;
  max?: number;
  min?: number;
  isInteger?: boolean;
  choices?: Record<string, number>;
}

export interface PrefixArgBoolean extends PrefixArgBase<'boolean'> {
  required?: boolean;
}

export interface PrefixArgChannel extends PrefixArgBase<'channel'> {
  required?: boolean;
  channelType: (keyof typeof allowedChannelTypes)[] | keyof typeof allowedChannelTypes;
}

export type PrefixItem =
  | PrefixArgRole
  | PrefixArgUser
  | PrefixArgString
  | PrefixArgNumber
  | PrefixArgBoolean
  | PrefixArgChannel;

export type PrefixResolvedItem<T extends PrefixItem> = T extends PrefixArgRole
  ? Role
  : T extends PrefixArgUser
    ? T['isMember'] extends true
      ? GuildMember
      : User
    : T extends PrefixArgString
      ? T['choices'] extends Record<string, string>
        ? { target: keyof T['choices']; value: string }
        : string
      : T extends PrefixArgNumber
        ? T['choices'] extends Record<string, number>
          ? { target: keyof T['choices']; value: number }
          : number
        : T extends PrefixArgBoolean
          ? boolean
          : T extends PrefixArgChannel
            ? T['channelType'] extends Array<keyof typeof ChannelType>
              ? (typeof ChannelType)[T['channelType'][number]]
              : (typeof ChannelType)[ChannelType]
            : never;

export interface PrefixProps<T extends Record<string, PrefixItem>> {
  name: string;
  aliases: string[];
  description: string;
  cooldown: number;
  permissions: CommandPermission;
  nsfw: boolean;
  dev: boolean;
  cache: boolean;
  args: T;
  run(client: Client, message: Message, args: { [K in keyof T]: PrefixResolvedItem<T[K]> }): any;
}

export default class Prefix<T extends Record<string, PrefixItem>> {
  public name;
  public aliases;
  public description;
  public cooldown;
  public permissions;
  public args;
  public nsfw;
  public dev;
  public cache;
  public run;

  public static async Parse<T extends Record<string, PrefixItem>>(client: Client, message: Message, args: T) {
    const solved: Record<string, any> = {};
    const input = message.content.match(/(?:[^\s"']+|"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')+/g)?.slice(1) || [];

    const entries = Object.entries(args);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const arg = entry[1];
      if (!arg) continue;

      const name = entry[0];

      let raw = input.shift();

      if (!raw && arg.required) {
        throw new Error(`Missing required argument: ${Highlight(name)}`);
      }

      if (!raw) {
        solved[name] = null;
        continue;
      }

      if (arg.type === 'string' && i === entries.length - 1) {
        raw = [raw, ...input].join(' ');
        input.length = 0;
      }

      function Clean(v: string) {
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }

        v = v.replace(/\\(["'\\])/g, '$1');
        return v;
      }

      const value = Clean(raw);

      switch (arg.type) {
        case 'string': {
          if (arg.maxLength && value.length > arg.maxLength!) {
            throw new Error(`Arg "${name}" must have at most ${arg.maxLength} characters`);
          }

          if (arg.minLength && value.length < arg.minLength!) {
            throw new Error(`Arg "${name}" must have at least ${arg.minLength} characters`);
          }

          if (arg.choices) {
            const match = Object.keys(arg.choices!).find((key) => key.toLowerCase() === value.toLowerCase());
            if (!match) {
              throw new Error(
                `Invalid choice for arg "${name}". Choose between: ${Object.keys(arg.choices!).join(', ')}`,
              );
            }

            solved[name] = arg.choices![match];
            break;
          }

          solved[name] = value;
          break;
        }

        case 'number': {
          const number = Number(value);
          if (isNaN(number)) {
            throw new Error(`Arg "${name}" must be a number`);
          }

          if (arg.isInteger && !Number.isInteger(number)) {
            throw new Error(`Arg "${name}" must be an integer`);
          }

          if (arg.max && number > arg.max!) {
            throw new Error(`Arg "${name}" must be at most ${arg.max}`);
          }

          if (arg.min && number < arg.min!) {
            throw new Error(`Arg "${name}" must be at least ${arg.min}`);
          }

          if (arg.choices) {
            const match = Object.keys(arg.choices!).find((key) => key.toLowerCase() === value.toLowerCase());
            if (!match) {
              throw new Error(
                `Invalid choice for arg "${name}". Choose between: ${Object.keys(arg.choices!).join(', ')}`,
              );
            }

            let key: string | number = match;
            if (!isNaN(Number(match))) {
              key = Number(match);
            }

            solved[name] = arg.choices && arg.choices![key];
            break;
          }

          solved[name] = number;
          break;
        }

        case 'boolean': {
          if (!['true', 'false'].includes(value.toLowerCase())) {
            throw new Error(`Arg "${name}" must be true or false`);
          }

          solved[name] = value.toLowerCase() === 'true';
          break;
        }

        case 'channel': {
          const channel = message.guild?.channels.cache.get(value.replace(/[<#>]/g, ''));
          if (!channel) {
            throw new Error(`Invalid channel for arg "${name}"`);
          }

          if (arg.channelType) {
            if (Array.isArray(arg.channelType)) {
              if (!arg.channelType!.includes(channel.type.toString() as any)) {
                throw new Error(`Channel type "${channel.type}" is not allowed for arg "${name}"`);
              }
            } else if (arg.channelType !== channel.type.toString()) {
              throw new Error(`Channel type "${channel.type}" is not allowed for arg "${name}"`);
            }
          }

          solved[name] = channel;
          break;
        }

        case 'user': {
          const id = value.replace(/[<@!>]/g, '');
          if (/^\d{17,19}$/.test(id)) {
            const user = await (arg.isMember === true
              ? message.guild?.members.fetch(id).catch(() => null)
              : client.users.fetch(id, { force: true }).catch(() => null));
            if (!user) {
              throw new Error(`Invalid ${arg.isMember === true ? 'member' : 'user'} for arg "${name}"`);
            }

            solved[name] = user;
          } else {
            if (entries[i + 1]) {
              input.unshift(value);
              continue;
            } else {
              solved[name] = null;
            }
          }
          break;
        }

        case 'role': {
          const role = message.guild?.roles.cache.get(value.replace(/[<@&>]/g, ''));
          if (!role) {
            throw new Error(`Invalid role for arg "${name}"`);
          }

          solved[name] = role;
          break;
        }
      }
    }

    return solved;
  }

  constructor(
    props: Optional<PrefixProps<T>, 'aliases' | 'cooldown' | 'permissions' | 'args' | 'nsfw' | 'dev' | 'cache'>,
  ) {
    props.permissions = props.permissions || { client: [], author: [] };

    this.name = props.name;
    this.aliases = props.aliases || [];
    this.description = props.description;
    this.cooldown = props.cooldown;
    this.permissions = props.permissions;
    this.args = props.args || {};
    this.nsfw = !!props.nsfw;
    this.dev = !!props.dev;
    this.cache = !!props.cache;
    this.run = props.run;
  }
}
