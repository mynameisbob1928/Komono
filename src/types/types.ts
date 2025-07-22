import { ChannelType, type ClientEvents, type PermissionResolvable } from 'discord.js';
import type { SlashItem } from '../bases/slash';
import type Slash from '../bases/slash';
import type Prefix from '../bases/prefix';
import type { PrefixItem } from '../bases/prefix';
import type Event from '../bases/event';
import type { ComponentCategory } from '../bases/component';
import type Component from '../bases/component';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type IsPossible<T, B extends boolean = true> = B extends true ? T : T | undefined;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Object ? DeepPartial<T[K]> : T[K];
};

export enum allowedChannelTypes {
  GuildText = ChannelType.GuildText,
  GuildVoice = ChannelType.GuildVoice,
  GuildCategory = ChannelType.GuildCategory,
  GuildAnnouncement = ChannelType.GuildAnnouncement,
  AnnouncementThread = ChannelType.AnnouncementThread,
  PublicThread = ChannelType.PublicThread,
  PrivateThread = ChannelType.PrivateThread,
  GuildStageVoice = ChannelType.GuildStageVoice,
  GuildForum = ChannelType.GuildForum,
  GuildMedia = ChannelType.GuildMedia,
}

export interface CommandPermission {
  author: PermissionResolvable[];
  client: PermissionResolvable[];
}

export type EventType<T extends keyof ClientEvents = any> = InstanceType<typeof Event<T>> & { path: string };
export type SlashType<T extends Record<string, SlashItem> = any> = InstanceType<typeof Slash<T>> & { path: string };
export type PrefixType<T extends Record<string, PrefixItem> = any> = InstanceType<typeof Prefix<T>> & { path: string };
export type ComponentType<T extends ComponentCategory = any> = InstanceType<typeof Component<T>> & { path: string };
