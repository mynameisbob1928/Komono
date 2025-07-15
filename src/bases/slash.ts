import { ApplicationCommandType, ApplicationIntegrationType, AutocompleteInteraction, ChannelType, ContextMenuCommandBuilder, InteractionContextType, SlashCommandBuilder, type CacheType,  type CommandInteractionOption } from "discord.js";
import type { Callback, CommandInteraction, OptionDict, OptionHandler, SlashOptions } from "utils/types";

export enum SlashType {
  Command = 'command',
  ContextUser = 'context_user',
  ContextMessage = 'context_message'
};

export enum Integration {
  Guild = 'guild',
  User = 'user'
};

export enum Context {
  Guild = 'guild',
  Bot = 'bot',
  DM = 'dm'
};
  
export function Slash<T extends SlashOptions>(options: { body: T, defer?: boolean, ephemeral?: boolean, callback: (interaction: CommandInteraction, args: Callback<T>) => Promise<void>; autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => Promise<void> }) {
  options.body.permissions = { ...(options.body.permissions || {}) };

  return {
    ...options.body,
    defer: !(options.defer == undefined ? true : !options.defer),
    ephemeral: !!options.ephemeral,
    callback: options.callback,
    autocomplete: options.autocomplete
  };
};

export function ToJSON(slash: SlashOptions) {
  if (slash.type === "Command") {
    const builder = new SlashCommandBuilder()
    .setName(slash.name)
    .setDescription(slash.description)
    .setIntegrationTypes(
      slash.integrations
      .map(type => {
        if (type === "Guild") return ApplicationIntegrationType.GuildInstall;
        if (type === "User") return ApplicationIntegrationType.UserInstall
      })
      .filter((type): type is ApplicationIntegrationType => type!== undefined)
    )
    .setContexts(
      slash.contexts
      .map(context => {
        if (context === "Guild") return InteractionContextType.Guild;
        if (context === "DM") return InteractionContextType.PrivateChannel;
        if (context === "Bot") return InteractionContextType.BotDM
      })
      .filter((context): context is InteractionContextType => context!== undefined)
    );

    for (const name in slash.args) {
      const body = slash.args[name];
      if (!body) continue;
      AppendToSlash(builder, { name, ...body });
    };

    const subcmd = Object.values(slash.args || {}).some(cmd => cmd.type === "command" || cmd.type === "group");

    if (!subcmd) {
      builder.addBooleanOption(option =>
        option.setName("incognito")
        .setDescription("Makes the response only visible to you")
      );
    }

    return builder.toJSON();
  } else if (slash.type === "ContextUser" || slash.type === "ContextMessage") {
    const builder = new ContextMenuCommandBuilder()
    .setName(slash.name)
    .setType(slash.type === "ContextUser" ? ApplicationCommandType.User : ApplicationCommandType.Message)
    .setIntegrationTypes(
      slash.integrations
      .map(type => {
        if (type === "Guild") return ApplicationIntegrationType.GuildInstall;
        if (type === "User") return ApplicationIntegrationType.UserInstall
      })
      .filter((type): type is ApplicationIntegrationType => type!== undefined)
    )
    .setContexts(
      slash.contexts
      .map(context => {
        if (context === "Guild") return InteractionContextType.Guild;
        if (context === "DM") return InteractionContextType.PrivateChannel;
        if (context === "Bot") return InteractionContextType.BotDM
      })
      .filter((context): context is InteractionContextType => context!== undefined)
    );

    return builder.toJSON();
  };
};
    
export function AppendToSlash(builder: SlashCommandBuilder, item: { name: string } & OptionHandler<keyof OptionDict>) {
  if(item.type == "command" || item.type == "group") {
    builder[item.type == "command" ? "addSubcommand" : "addSubcommandGroup"]((builder: any) => {
      for(const name in item.args) {
        const body = item.args[name];
        if (!body) continue;
        AppendToSlash(builder as any, { name, ...body });
      };

      return builder.setName(item.name).setDescription(item.description);
    });

    return builder;
  };

  switch(item.type) {
    case "channel": {
      builder.addChannelOption((option) => option.setName(item.name).setDescription(item.description).addChannelTypes(ChannelType[item.channelType] as any).setRequired(!!item.required))
      break;
    };
    case "member": {
      builder.addUserOption((option) => option.setName(item.name).setDescription(item.description).setRequired(!!item.required))
      break;
    };
    case "number": {
      if(item.isInt) builder.addNumberOption((option) => option.setName(item.name).setDescription(item.description).setMaxValue(item.max ?? Infinity).setMinValue(item.min ?? -Infinity).setRequired(!!item.required));
      else builder.addNumberOption((option) => option.setName(item.name).setDescription(item.description).setMaxValue(item.max ?? Infinity).setMinValue(item.min ?? -Infinity).setRequired(!!item.required));
      break;
    };
    case "role": {
      builder.addRoleOption((option) => option.setName(item.name).setDescription(item.description).setRequired(!!item.required))
      break;
    };
    case "string": {
      builder.addStringOption((option) => { option.setName(item.name).setDescription(item.description).setRequired(!!item.required).setAutocomplete(!!item.autocomplete); 
        if (item.choices && !item.autocomplete) {
          option.addChoices(item.choices);
        };
        return option;
      });
      break;
    };
    case "user": {
      builder.addUserOption((option) => option.setName(item.name).setDescription(item.description).setRequired(!!item.required))
      break;
    };
  };

  return builder;
};
  
export function GetSlashCommands(options: CommandInteractionOption<CacheType>[], body: { [key: string]: OptionHandler<keyof OptionDict> }) {
  return options.reduce((data, option) => {
    const item = body[option.name];

    if(!item) return data;

    switch(item.type) {
      case "boolean": {
        data[option.name] = !!option.value;
        break;
      };
      case "string": {
        data[option.name] = option.value;
        break;
      };
      case "channel": {
        data[option.name] = option.channel;
        break;
      };
      case "role": {
        data[option.name] = option.role;
        break;
      };
      case "number": {
        data[option.name] = Number(option.value);
        break;
      };
      case "user": {
        data[option.name] = option.user;
        break;
      };
      case "member": {
        data[option.name] = option.member;
        break;
      };
      case "group":
      case "command": {
        data[option.name] = GetSlashCommands(option.options as any, item.args);
        break;
      };
    };

    return data;
  }, {} as { [key: string]: any });
};