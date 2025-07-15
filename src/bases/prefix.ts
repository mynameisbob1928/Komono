import { Client, GuildChannel, Message, Role, type ChannelType, type PermissionResolvable } from "discord.js";
import type { ArgsProps, PrefixProps } from "utils/types";
  
export function Prefix(options: PrefixProps) {
  options.permissions = { ...(options.permissions || {}) };
  
  return {
    name: options.name,
    aliases: options.aliases || [],
    description: options.description,
    category: options.category,
    usage: options.usage || "",
    examples: options.examples || [],
    cooldown: options.cooldown ?? 0,
    nsfw: options.nsfw || false,
    dev: options.dev || false,
    permissions: {
      client: options.permissions.client || [],
      author: options.permissions.author || []
    },
    args: options.args || [],
    callback: options.callback,
  };
};

export async function Parse(client: Client, message: Message, args: ArgsProps[]): Promise<Record<string, any>> {
  const solved: Record<string, any> = {};
  const input = message.content.match(/(?:[^\s"']+|"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')+/g)?.slice(1) || [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg) continue;

    let value = input.shift();

    if (arg.required && !value) {
      throw new Error(`Missing required argument: "${arg.name}".`);
    };

    if (!value) {
      solved[arg.name] = arg.default ?? null;
      continue;
    };

    if (arg.type === 'string' && i === args.length - 1) {
      value = [value, ...input].join(' ');

      input.length = 0;
    };

    function Clean(v: string) {
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      };

      v.replace(/\\(["'\\])/g, "$1");
      return v;
    };

    const cleanValue = Clean(value);

    switch(arg.type) {
      case "string": {
        if (arg.min && cleanValue.length < arg.min) {
          throw new Error(`Arg "${arg.name}" must have at least ${arg.min} characters.`);
        };

        if (arg.max && cleanValue.length > arg.max) {
          throw new Error(`Arg "${arg.name}" must have at most ${arg.max} characters.`);
        };

        solved[arg.name] = cleanValue;
        break;
      };
      case "number": {
        const number = parseFloat(cleanValue);

        if (isNaN(number)) {
          throw new Error(`Arg "${arg.name}" must be a number.`);
        };

        if (arg.int && !Number.isInteger(number)) {
          throw new Error(`Arg "${arg.name}" must be an integer.`);
        };

        if (arg.min && number < arg.min) {
          throw new Error(`Arg "${arg.name}" must be at least ${arg.min}.`);
        };

        if (arg.max && number > arg.max) {
          throw new Error(`Arg "${arg.name}" must be at most ${arg.max}.`);
        };

        solved[arg.name] = number;
        break;
      };
      case "boolean": {
        if (!["true", "false"].includes(cleanValue.toLowerCase())) {
          throw new Error(`Arg "${arg.name}" must be true or false.`);
        };

        solved[arg.name] = cleanValue.toLowerCase() === "true";
        break;
      };
      case "channel": {
        const channel = message.guild?.channels.cache.get(cleanValue.replace(/[<#>]/g, ""));

        if (!channel || !(channel instanceof GuildChannel)) {
          throw new Error(`Invalid channel for arg "${arg.name}".`);
        };

        if (!arg.channelType?.includes(channel.type)) {
          throw new Error(`Channel type "${channel.type}" is not allowed for arg "${arg.name}".`);
        };

        solved[arg.name] = channel;
        break;
      };
      case "user": {
        const id = cleanValue.replace(/[<@!>]/g, "");

        if (/^\d{17,19}$/.test(id)) {
          const found = await (arg.isMember === true
            ? message.guild?.members.fetch(id).catch(() => null)
            : client.users.fetch(id, { force: true }).catch(() => null));
          if (!found) {
            throw new Error(`Invalid ${arg.isMember === true ? "member" : "user"} for arg "${arg.name}".`);
          };
              
          solved[arg.name] = found;
        } else {
          if (args[i + 1]) {
            input.unshift(cleanValue);
            continue;
          } else {
            solved[arg.name] = null;
          };
        };
        break;
      };
      case "role": {
        const role = message.guild?.roles.cache.get(cleanValue.replace(/[<@&>]/g, ""));

        if (!role || !(role instanceof Role)) {
          throw new Error(`Invalid role for arg "${arg.name}".`);
        };

        solved[arg.name] = role;
        break;
      };
    };
  };

  return solved;
};