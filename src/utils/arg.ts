import type { Client, Message } from "discord.js";
import type { allowedChannelTypes } from "../types/types";

export namespace Args {
    export type ArgsType = "string" | "number" | "boolean" | "channel" | "user" | "role"

    export interface BaseItem<T extends ArgsType> {
        description: string;
        type: T;
    };

    export interface ArgsItemRole extends BaseItem<"role"> {
        required?: boolean;
    };

    export interface ArgsItemUser extends BaseItem<"user"> {
        required?: boolean;
        isMember?: boolean
    };

    export interface ArgsItemString extends BaseItem<"string"> {
        required?: boolean;
        maxLength?: number;
        minLength?: number;
        choices?: Record<string, string>;
    };

    export interface ArgsItemNumber extends BaseItem<"number"> {
        required?: boolean;
        max?: number;
        min?: number;
        isInteger?: boolean;
        choices?: Record<string, number>;
    };

    export interface ArgsItemBoolean extends BaseItem<"boolean"> {
        required?: boolean;
    };

    export interface ArgsItemChannel extends BaseItem<"channel"> {
        required?: boolean;
        channelType?: (keyof typeof allowedChannelTypes)[] | (keyof typeof allowedChannelTypes);
    };

    export type ArgsItems =
        | ArgsItemRole
        | ArgsItemUser
        | ArgsItemString
        | ArgsItemNumber
        | ArgsItemBoolean
        | ArgsItemChannel

    export async function Parse(client: Client, message: Message, args: Record<string, ArgsItems>) {
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
                throw new Error(`Missing required argument: "${name}".`);
            };

            if (!raw) {
                solved[name] = null
                continue;
            };

            if (arg.type === "string" && i === entries.length - 1) {
                raw = [raw, ...input].join(" ");
                input.length = 0;
            };

            function Clean(v: string) {
                if (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'")) {
                    v = v.slice(1, -1);
                };

                v = v.replace(/\\(["'\\])/g, "$1");
                return v;
            };

            const value = Clean(raw);

            switch (arg.type) {
                case "string": {
                    if (arg.maxLength && value.length > arg.maxLength) {
                        throw new Error(`Arg "${name}" must have at most ${arg.maxLength} characters.`);
                    };

                    if (arg.minLength && value.length < arg.minLength) {
                        throw new Error(`Arg "${name}" must have at least ${arg.minLength} characters.`);
                    };

                    if (arg.choices) {
                        const match = Object.keys(arg.choices).find(key => key.toLowerCase() === value.toLowerCase());
                        if (!match) {
                            throw new Error(`Invalid choice for arg "${name}". Choose between: ${Object.keys(arg.choices).join(", ")}`);
                        }
                        solved[name] = arg.choices[match];
                        break;
                    };

                    solved[name] = value;
                    break;
                };

                case "number": {
                    const number = Number(value);
                    if (isNaN(number)) {
                        throw new Error(`Arg "${name}" must be a number.`);
                    };

                    if (arg.isInteger && !Number.isInteger(number)) {
                        throw new Error(`Arg "${name}" must be an integer.`);
                    };

                    if (arg.max && number > arg.max) {
                        throw new Error(`Arg "${name}" must be at most ${arg.max}.`);
                    };

                    if (arg.min && number < arg.min) {
                        throw new Error(`Arg "${name}" must be at least ${arg.min}.`);
                    };
                    
                    if (arg.choices) {
                        const match = Object.keys(arg.choices).find(key => key.toLowerCase() === value.toLowerCase());
                        if (!match) {
                            throw new Error(`Invalid choice for arg "${name}". Choose between: ${Object.keys(arg.choices).join(", ")}`);
                        };

                        const key = typeof number === "number" && !isNaN(Number(match)) ? Number(match) : match;
                        solved[name] = arg.choices[key as keyof typeof arg.choices];
                        break;
                    }

                    solved[name] = number;
                    break;
                };

                case "boolean": {
                    if (!["true", "false"].includes(value.toLowerCase())) {
                        throw new Error(`Arg "${name}" must be true or false.`);
                    };

                    solved[name] = value.toLowerCase() === "true";
                    break;
                };

                case "channel": {
                    const channel = message.guild?.channels.cache.get(value.replace(/[<#>]/g, ""));
                    if (!channel) {
                        throw new Error(`Invalid channel for arg "${name}".`);
                    };

                    if (arg.channelType) {
                        if (Array.isArray(arg.channelType)) {
                            if (!arg.channelType.includes(channel.type.toString() as typeof arg.channelType[number])) {
                                throw new Error(`Channel type "${channel.type}" is not allowed for arg "${name}".`);
                            };
                        } else if (arg.channelType !== channel.type.toString()) {
                            throw new Error(`Channel type "${channel.type}" is not allowed for arg "${name}".`);
                        };
                    };

                    solved[name] = channel
                    break;
                };

                case "user": {
                    const id = value.replace(/[<@!>]/g, "");
                    if (/^\d{17,19}$/.test(id)) {
                        const user = await (arg.isMember === true ? message.guild?.members.fetch(id).catch(() => null) : client.users.fetch(id, { force: true }).catch(() => null));
                        if (!user) {
                            throw new Error(`Invalid ${arg.isMember === true ? "member" : "user"} for arg "${name}".`);
                        };

                        solved[name] = user;
                    } else {
                        if (entries[i + 1]) {
                            input.unshift(value);
                            continue;
                        } else {
                            solved[name] = null
                        };
                    };
                    break;
                };

                case "role": {
                    const role = message.guild?.roles.cache.get(value.replace(/[<@&>]/g, ""));
                    if (!role) {
                        throw new Error(`Invalid role for arg "${name}".`);
                    };

                    solved[name] = role;
                    break;
                };
            };
        };

        return solved;
    };
};