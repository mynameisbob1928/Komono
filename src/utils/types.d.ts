import type { Component, ComponentType } from "bases/component";
import type { Event } from "bases/event";
import type { Prefix } from "bases/prefix";
import type { ClusterClient } from "status-sharding";
import type { ButtonColors } from "./component";
import {
  ActionRowBuilder,
  Attachment,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  Colors,
  FileBuilder,
  GuildMember,
  MediaGalleryBuilder,
  MentionableSelectMenuBuilder,
  Message,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  PermissionResolvable,
  Role,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  User,
  UserContextMenuCommandInteraction,
  UserSelectMenuBuilder,
  type AnySelectMenuInteraction,
  type CacheType,
  type Channel,
  type Client,
  type ClientEvents,
  Collection
} from "discord.js";


declare module 'discord.js' {
  interface Client {
    cluster: ClusterClient<Client>;
    events: Collection<string, EventType>;
    slashes: Collection<string, SlashType>;
    prefixes: Collection<string, PrefixType>;
    components: Collection<string, ComponentType>;
    cooldown: Collection<string, Collection<string, number>>;
    prefix: string;
  };
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Object ? DeepPartial<T[K]> : T[K];
};

export type Paths = {
  events?: string;
  slashes?: string;
  prefixes?: string;
  components?: string;
};

export type EventType = ReturnType<typeof Event["Event"]> & { path: string; };
export type SlashType = ReturnType<typeof Slash["Slash"]> & { path: string; };
export type PrefixType = ReturnType<typeof Prefix["Prefix"]> & { path: string; };
export type ComponentType = ReturnType<typeof Component["Component"]> & { path: string; };

export type EmbedOptions = {
  title: string;
  description: string;
  url: string;
  image: string;
  thumb: string;
  timestamp: Date | number | string;
  color: keyof typeof Colors; 
  author: {
    name: string;
    avatar: string;
    url: string;
  };
  footer: {
    image: string;
    content: string;
  };
  fields: {
    name: string;
    content: string;
    inline: boolean;
  }[];
};

export type ActionRowComponentBuilder = ButtonBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder | ChannelSelectMenuBuilder;

export type ButtonOptions = {
    text?: string;
    emoji?: string;
    url?: string;
    color: keyof typeof ButtonColors;
    disabled?: boolean;
};

export type BaseMenuOptions = {
    text?: string;
    max?: number;
    min?: number;
    disabled?: boolean;
};

export type StringMenuOptions = BaseMenuOptions & {
    options?: { label: string; value: string }[];
};

export type UserMenuOptions = BaseMenuOptions

export type RoleMenuOptions = BaseMenuOptions

export type MentionableMenuOptions = BaseMenuOptions

export type ChannelMenuOptions = BaseMenuOptions & {
    channelType: ChannelType[];
};

export type FileOptions = {
    file: string;
};

export type MediaGalleryOptions = {
    items: { description: string; media: { url: string}; }[];
};

export type SectionOptions = {
    components: TextDisplayBuilder[],
    accessory: ButtonBuilder | ThumbnailBuilder
};

export type TextDisplayOptions = {
    content: string;
};

export type ThumbnailOptions = {
  description: string;
  media: string;
};

export type SeparatorOptions = {
    spacing: SeparatorSpacingSize;
    divider?: boolean;
};

export type ComponentOptions =
    | ({ type: "Button" } & ButtonOptions)
    | ({ type: "StringMenu" } & StringMenuOptions)
    | ({ type: "UserMenu" } & UserMenuOptions)
    | ({ type: "RoleMenu" } & RoleMenuOptions)
    | ({ type: "MentionableMenu" } & MentionableMenuOptions)
    | ({ type: "ChannelMenu" } & ChannelMenuOptions)
    | ({ type: "File" } & FileOptions)
    | ({ type: "MediaGallery" } & MediaGalleryOptions)
    | ({ type: "Section" } & SectionOptions)
    | ({ type: "TextDisplay" } & TextDisplayOptions)
    | ({ type: "Thumbnail" } & ThumbnailOptions )
    | ({ type: "Separator" } & SeparatorOptions);

export type ComponentBuilder =
    | ButtonBuilder
    | StringSelectMenuBuilder
    | UserSelectMenuBuilder
    | RoleSelectMenuBuilder
    | MentionableSelectMenuBuilder
    | ChannelSelectMenuBuilder
    | FileBuilder
    | MediaGalleryBuilder
    | SectionBuilder
    | TextDisplayBuilder
    | SeparatorBuilder

export type ComponentInteraction<T extends ComponentType> = T extends "button" ? ButtonInteraction<CacheType> : T extends "menu" ? AnySelectMenuInteraction<CacheType> : ModalSubmitInteraction<CacheType>;

export type ComponentProps<T extends ComponentType> = {
  id: string;
  type: T;
  callback(interaction: ComponentInteraction<T>, args?: string[]): Promise<void>;
};

export type EventProps<T extends keyof ClientEvents> = {
  name: string;
  type: T;
  once?: boolean;
  callback(...args: ClientEvents[T]): Promise<void>;
};

export type PrefixProps = {
  name: string;
  aliases?: string[];
  description: string;
  category: "Core" | "Dev" | "Info" | "Moderation" | "Utility";
  usage?: string;
  examples?: string[];
  cooldown?: number;
  nsfw?: boolean;
  dev?: boolean;
  permissions?: {
    client?: PermissionResolvable[];
    author?: PermissionResolvable[];
  };
  args?: ArgsProps[];
  callback(client: Client, message: Message, args: Record<string, any>): Promise<void>;
};

export type ArgsProps = {
  name: string;
  description: string;
  type: "string" | "number" | "boolean" | "channel" | "user" | "role";
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  int?: boolean;
  isMember?: boolean;
  channelType?: ChannelType[];
};

export type SlashOptions = {
  name: string;
  type: keyof typeof SlashType;
  integrations: (keyof typeof Integration)[];
  contexts: (keyof typeof Context)[];
  description: string;
  category: "Core" | "Dev" | "Info" | "Moderation" | "Utility"
  usage?: string;
  examples?: string[];
  cooldown?: number;
  nsfw?: boolean
  permissions?: {
    client?: PermissionResolvable[];
    author?: PermissionResolvable[];
  };
  args?: {
    [key: string]: OptionHandler<keyof OptionDict>;
  };
};

export type OptionDict = {
  string: string;
  number: number;
  boolean: boolean;
  attachment: Attachment
  user: User;
  role: Role;
  member: GuildMember;
  channel: Channel;
  group: {};
  command: {};
};

export type OptionHandler<T extends keyof OptionDict> =     
    T extends "group" ? CommandOrGroupOption<T>
  : T extends "command" ? CommandOrGroupOption<T>
  : T extends "channel" ? ChannelOption<T>
  : T extends "number" ? NumberOption<T>
  : StringOption<T>;

export type StringOption<T extends keyof OptionDict> = {
  type: T;
  required?: boolean;
  description: string;
  choices?: Array<{ name: any; value: any }>;
  autocomplete?: boolean;
};

export type NumberOption<T extends keyof OptionDict> = {
  type: T;
  max?: number;
  min?: number;
  isInt?: boolean;
  required?: boolean;
  description: string;
};

export type ChannelOption<T extends keyof OptionDict> = {
  type: T;
  required?: boolean;
  description: string;
  channelType: keyof typeof ChannelType;
};
  
export type CommandOrGroupOption<T extends keyof OptionDict> = {
  type: T;
  description: string;
  args: {
    [key: string]: OptionHandler<keyof Omit<OptionDict, "command" | "group">>
  };
};

export type Callback<T extends SlashOptions> = {
  name: string;
  description: string;
  body: T["args"] extends Record<string, OptionHandler<keyof OptionDict>> ? { [K in keyof T["args"]]: CallbackHandler<T["args"][K]> } : {};
};

export type CallbackHandler<T extends OptionHandler<keyof OptionDict>> = 
  T["type"] extends "command" ?
  // @ts-ignore
  { [K in keyof T["args"]]: CallbackHandler<T["args"][K]>; }
  // @ts-ignore
  : T["type"] extends "group" ?
  // @ts-ignore
  { [K in keyof T["args"]]: CallbackHandler<T["args"][K]> }
  // @ts-ignore
  : T["required"] extends true
  ? OptionDict[T["type"]]
  : OptionDict[T["type"]] | undefined;

export type CommandInteraction = ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType>;

export type RequestMethods = "GET" | "POST";

export type RequestResponse = {
  TEXT: string;
  JSON: { [key: string]: any };
  BUFFER: Buffer;
};

export type RequestOptions<T extends keyof RequestResponse> = {
  url: string;
  data?: any;
  method?: RequestMethods;
  response?: T;
  params?: { [key: string]: any; };
  headers?: { [key: string]: any; };
};