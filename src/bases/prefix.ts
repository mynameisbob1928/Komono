import type { Client, Message, Role, User, GuildMember, ChannelType } from "discord.js";
import type { CommandPermission, Optional } from "types/types";
import type { Args } from "utils/arg";

export type PrefixResolvedItem<T extends Args.ArgsItems> =
    T extends Args.ArgsItemRole ? Role
  : T extends Args.ArgsItemUser ? T["isMember"] extends true ? GuildMember : User
  : T extends Args.ArgsItemString ? string
  : T extends Args.ArgsItemNumber ? number
  : T extends Args.ArgsItemBoolean ? boolean
  : T extends Args.ArgsItemChannel ? T["channelType"] extends Array<keyof typeof ChannelType> ? (typeof ChannelType)[T["channelType"][number]] : (typeof ChannelType)[ChannelType]
  : never;

export interface PrefixProps<T extends Record<string, Args.ArgsItems>> {
    name: string;
    aliases?: string[];
    description: string;
    cooldown?: number;
    permissions?: CommandPermission;
    nsfw?: boolean;
    dev?: boolean;
    args?: T;
    run(client: Client, message: Message, args: { [K in keyof T]: PrefixResolvedItem<T[K]> }): any;
};

export default class Prefix<T extends Record<string, Args.ArgsItems>> {
    public name;
    public aliases;
    public cooldown;
    public permissions;
    public nsfw;
    public dev;
    public args;
    public run;

    constructor(props: Optional<PrefixProps<T>, "aliases" | "cooldown" | "args" | "permissions" | "nsfw" | "dev">) {
        props.permissions = props.permissions || { client: [], author: [] };

        this.name = props.name;
        this.aliases = props.aliases || [];
        this.cooldown = props.cooldown;
        this.permissions = props.permissions;
        this.nsfw = !!props.nsfw;
        this.dev = !!props.dev;
        this.args = props.args || {};
        this.run = props.run;
    };
};