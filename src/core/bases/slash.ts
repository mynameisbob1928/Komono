import {
  GuildMember,
  Role,
  SlashCommandBuilder,
  User,
  type LocalizationMap,
  ChannelType,
  ChatInputCommandInteraction,
  Locale,
  AutocompleteInteraction,
  type CacheType,
  ApplicationIntegrationType,
  InteractionContextType,
} from 'discord.js';
import type { allowedChannelTypes, CommandPermission, Optional } from 'types/types';

export type SlashArgType =
  | 'command'
  | 'channel'
  | 'boolean'
  | 'string'
  | 'number'
  | 'option'
  | 'group'
  | 'user'
  | 'role';
export type SlashLocalization = (Partial<Record<keyof LocalizationMap, string>> & { global: string }) | string;

export type Integrations = 'guild' | 'user';
export type Contexts = 'guild' | 'DM' | 'bot';

export interface BaseItem<T extends SlashArgType> {
  name?: SlashLocalization;
  description?: SlashLocalization;
  type: T;
}

export interface SlashItemRole extends BaseItem<'role'> {
  required?: boolean;
}

export interface SlashItemUser extends BaseItem<'user'> {
  required?: boolean;
  isMember?: boolean;
}

export interface SlashItemString extends BaseItem<'string'> {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  choices?: Record<string, string>;
  autocomplete?: boolean;
}

export interface SlashItemNumber extends BaseItem<'number'> {
  max?: number;
  min?: number;
  required?: boolean;
  isInteger?: boolean;
  choices?: Record<string, number>;
}

export interface SlashItemBoolean extends BaseItem<'boolean'> {
  required?: boolean;
}

export interface SlashItemChannel extends BaseItem<'channel'> {
  required?: boolean;
  channelType: (keyof typeof allowedChannelTypes)[] | keyof typeof allowedChannelTypes;
}

export interface SlashItemGroup extends BaseItem<'group'> {
  body: Record<string, SlashItem>;
}

export interface SlashItemCommand extends BaseItem<'command'> {
  body: Record<string, SlashItem>;
}

export type SlashItem =
  | SlashItemRole
  | SlashItemUser
  | SlashItemString
  | SlashItemNumber
  | SlashItemBoolean
  | SlashItemChannel
  | SlashItemGroup
  | SlashItemCommand;

export type SlashResolvedItem<T extends SlashItem> = T extends SlashItemRole
  ? Role
  : T extends SlashItemUser
    ? T['isMember'] extends true
      ? GuildMember
      : User
    : T extends SlashItemString
      ? T['choices'] extends Record<string, string>
        ? { target: keyof T['choices']; value: string }
        : string
      : T extends SlashItemNumber
        ? T['choices'] extends Record<string, number>
          ? { target: keyof T['choices']; value: number }
          : number
        : T extends SlashItemBoolean
          ? boolean
          : T extends SlashItemChannel
            ? T['channelType'] extends Array<keyof typeof ChannelType>
              ? (typeof ChannelType)[T['channelType'][number]]
              : (typeof ChannelType)[ChannelType]
            : T extends SlashItemGroup
              ? { [K in keyof T['body']]: SlashResolvedItem<T['body'][K]> }
              : T extends SlashItemCommand
                ? { [K in keyof T['body']]: SlashResolvedItem<T['body'][K]> }
                : never;

export interface SlashProps<T extends Record<string, SlashItem>> {
  name: SlashLocalization;
  description: SlashLocalization;
  integrations: Integrations[];
  contexts: Contexts[];
  args?: T;
  cooldown: number;
  permissions: CommandPermission;
  nsfw: boolean;
  dev: boolean;
  defer: boolean;
  ephemeral: boolean;
  run(interaction: ChatInputCommandInteraction, args: { [K in keyof T]: SlashResolvedItem<T[K]> }): any;
  autocomplete(interaction: AutocompleteInteraction): any;
}

export default class Slash<T extends Record<string, SlashItem>> {
  public name;
  public description;
  public integrations;
  public contexts;
  public args;
  public cooldown;
  public permissions;
  public nsfw;
  public dev;
  public defer;
  public ephemeral;
  public run;
  public autocomplete;

  public static Build<T extends Record<string, SlashItem>>(
    props: Optional<
      SlashProps<T>,
      'cooldown' | 'defer' | 'ephemeral' | 'permissions' | 'nsfw' | 'dev' | 'autocomplete'
    >,
  ) {
    const base = new SlashCommandBuilder()
      .setName(typeof props.name === 'string' ? props.name : props.name.global)
      .setDescription(typeof props.description === 'string' ? props.description : props.description.global)
      .setIntegrationTypes(
        props.integrations
          .map((i) => {
            if (i === 'guild') return ApplicationIntegrationType.GuildInstall;
            if (i === 'user') return ApplicationIntegrationType.UserInstall;
          })
          .filter((type): type is ApplicationIntegrationType => type !== undefined),
      )
      .setContexts(
        props.contexts
          .map((i) => {
            if (i === 'bot') return InteractionContextType.BotDM;
            if (i === 'guild') return InteractionContextType.Guild;
            if (i === 'DM') return InteractionContextType.PrivateChannel;
          })
          .filter((type): type is InteractionContextType => type !== undefined),
      );

    if (typeof props.name !== 'string') {
      for (const [locale, value] of Object.entries(props.name)) {
        if (locale !== 'global') base.setNameLocalization(locale as Locale, value);
      }
    }

    if (typeof props.description !== 'string') {
      for (const [locale, value] of Object.entries(props.description)) {
        if (locale !== 'global') base.setDescriptionLocalization(locale as Locale, value);
      }
    }

    this.Parse(base, props.args || {});

    return base;
  }

  public static Parse<T extends Record<string, SlashItem>>(base: SlashCommandBuilder, props: T) {
    for (const [key, arg] of Object.entries(props)) {
      const name = key;
      const description = typeof arg.description === 'string' ? arg.description : arg.description!.global;

      const required = !!(arg as any).required;

      const Localize = (opt: any) => {
        if (arg.name && typeof arg.name !== 'string') {
          for (const [locale, value] of Object.entries(arg.name)) {
            if (locale !== 'global') opt.setNameLocalization(locale, value);
          }
        }

        if (arg.description && typeof arg.description !== 'string') {
          for (const [locale, value] of Object.entries(arg.description)) {
            if (locale !== 'global') opt.setDescriptionLocalization(locale, value);
          }
        }

        return opt;
      };

      if (arg.type == 'command' || arg.type == 'group') {
        base[arg.type === 'command' ? 'addSubcommand' : 'addSubcommandGroup']((base: any) => {
          this.Parse(base, props.args || {});

          return Localize(base.setName(arg.name).setDescription(arg.description));
        });

        return base;
      }

      switch (arg.type) {
        case 'string': {
          base.addStringOption((opt) => {
            opt.setName(name).setDescription(description).setRequired(required).setAutocomplete(!!arg.autocomplete);
            if ('maxLength' in arg) opt.setMaxLength(arg.maxLength!);
            if ('minLength' in arg) opt.setMinLength(arg.minLength!);
            if (arg.choices && !arg.autocomplete) {
              for (const [label, value] of Object.entries(arg.choices)) {
                if (!label || !value) continue;

                opt.addChoices({ name: label, value });
              }
            }

            return Localize(opt);
          });
          break;
        }

        case 'number': {
          base.addNumberOption((opt) => {
            opt.setName(name).setDescription(description).setRequired(required);
            if ('max' in arg) opt.setMaxValue(arg.max!);
            if ('min' in arg) opt.setMinValue(arg.min!);
            if (arg.choices) {
              for (const [label, value] of Object.entries(arg.choices)) {
                if (!label || !value) continue;

                opt.addChoices({ name: label, value });
              }
            }

            return Localize(opt);
          });
          break;
        }

        case 'boolean': {
          base.addBooleanOption((opt) => Localize(opt.setName(name).setDescription(description).setRequired(required)));
          break;
        }

        case 'user': {
          base.addUserOption((opt) => Localize(opt.setName(name).setDescription(description).setRequired(required)));
          break;
        }

        case 'role': {
          base.addRoleOption((opt) => Localize(opt.setName(name).setDescription(description).setRequired(required)));
          break;
        }

        case 'channel': {
          base.addChannelOption((opt) => {
            opt.setName(name).setDescription(description).setRequired(required);
            if ('channelType' in arg && arg.channelType) {
              const types = Array.isArray(arg.channelType) ? arg.channelType : [arg.channelType];

              opt.addChannelTypes(...types.map((t) => ChannelType[t]));
            }

            return Localize(opt);
          });
          break;
        }
      }
    }

    if (!Object.values(props).some((opt) => opt.type === 'command' || opt.type === 'group')) {
      base.addBooleanOption((opt) => opt.setName('incognito').setDescription('Makes the response only visible to you'));
    }

    return base;
  }

  public static Resolve<T extends Record<string, SlashItem>>(
    interaction: ChatInputCommandInteraction<CacheType>,
    props: T,
  ): { [K in keyof T]: SlashResolvedItem<T[K]> } {
    const result: Partial<{ [K in keyof T]: SlashResolvedItem<T[K]> }> = {};

    for (const [key, arg] of Object.entries(props) as [keyof T, SlashItem][]) {
      switch (arg.type) {
        case 'boolean': {
          result[key] = interaction.options.getBoolean(key as string, (arg as any).required) as any;
          break;
        }

        case 'string': {
          result[key] = interaction.options.getString(key as string, (arg as any).required) as any;
          break;
        }

        case 'channel': {
          result[key] = interaction.options.getChannel(key as string, (arg as any).required) as any;
          break;
        }

        case 'role': {
          result[key] = interaction.options.getRole(key as string, (arg as any).required) as any;
          break;
        }

        case 'number': {
          result[key] = interaction.options.getNumber(key as string, (arg as any).required) as any;
          break;
        }

        case 'user': {
          const isMember = (arg as SlashItemUser).isMember;
          if (isMember) {
            result[key] = interaction.options.getMember(key as string) as any;
          } else {
            result[key] = interaction.options.getUser(key as string, (arg as any).required) as any;
          }
          break;
        }

        case 'group':
        case 'command':
          result[key] = Slash.Resolve(interaction, (arg as SlashItemGroup | SlashItemCommand).body) as any;
          break;
      }
    }

    return result as { [K in keyof T]: SlashResolvedItem<T[K]> };
  }

  constructor(
    props: Optional<
      SlashProps<T>,
      'cooldown' | 'permissions' | 'defer' | 'ephemeral' | 'nsfw' | 'dev' | 'autocomplete'
    >,
  ) {
    props.permissions = props.permissions || { client: [], author: [] };

    this.name = props.name;
    this.description = props.description;
    this.integrations = props.integrations;
    this.contexts = props.contexts;
    this.args = props.args || {};
    this.cooldown = props.cooldown;
    this.permissions = props.permissions;
    this.nsfw = !!props.nsfw;
    this.dev = !!props.dev;
    this.defer = !(props.defer == undefined ? true : !props.defer);
    this.ephemeral = !!props.ephemeral;
    this.run = props.run;
    this.autocomplete = props.autocomplete;
  }
}
