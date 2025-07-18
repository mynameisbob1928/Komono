import type { Client, Message } from "discord.js";
import type { CommandPermission, Optional } from "types/types";
import type { Args } from "libs/arg";

export interface CommandProps {
    name: string;
    aliases: string[];
    description: string;
    cooldown: number;
    permissions: CommandPermission;
    nsfw: boolean;
    dev: boolean;
    args: Args.ArgsItems[]
    run(client: Client, message: Message, args: Record<string, any>): any;
};

export default class Prefix {
    public name;
    public aliases;
    public cooldown;
    public permissions;
    public nsfw;
    public dev;
    public args;
    public run;

    constructor(props: Optional<CommandProps, "aliases" | "cooldown" | "args" | "permissions" | "nsfw" | "dev" | "args">) {
        props.permissions = props.permissions || { client: [], author: [] };

        this.name = props.name;
        this.aliases = props.aliases || [];
        this.cooldown = props.cooldown;
        this.permissions = props.permissions;
        this.nsfw = !!props.nsfw;
        this.dev = !!props.dev;
        this.args = props.args || []
        this.run = props.run
    };
};