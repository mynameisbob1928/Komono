import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, type Message } from "discord.js";

export namespace Button {
    export type ButtonProps = {
        text?: string;
        emoji?: string;
        url?: string;
        color: keyof typeof Colors;
        disabled?: boolean;
    };

    export enum Colors {
        Red = ButtonStyle.Danger,
        Blue = ButtonStyle.Primary,
        Gray = ButtonStyle.Secondary,
        Green = ButtonStyle.Success,
        Link = ButtonStyle.Link,
        Premium = ButtonStyle.Premium
    };

    export function Create<T extends Record<string, Partial<ButtonProps>>>(options: T): Record<keyof T, ButtonProps> {
        return Object.keys(options).reduce((buttons, key) => {
            const data = options[key];

            if (!data?.text && !data?.emoji) {
                throw new Error(`Button "${key}" must have either text or emoji.`);
            };

            if (data.color === "Link" && !data.url) {
                throw new Error(`Button "${key}" must have a url.`);
            };

            buttons[key as keyof T] = {
                text: data.text ?? undefined,
                emoji: data.emoji ?? undefined,
                url: data.url,
                color: data.color ?? "Gray",
                disabled: !!data.disabled
            };

            return buttons ;
        }, {} as Record<keyof T, ButtonProps>);
    };

    export function CreateAction<T extends Record<string, Partial<ButtonProps>>>(options: T) {
        const buttons = Create(options);

        const action = new ActionRowBuilder<ButtonBuilder>();

        for (const key in buttons) {
            const button = buttons[key];

            const builder =  new ButtonBuilder({
                customId: button.color === "Link" ? undefined : key,
                label: button.text,
                emoji: button.emoji as string,
                url: button.color === "Link" ? button.url : undefined,
                style: Colors[button.color] as any,
                disabled: button.disabled
            });

            action.addComponents(builder);
        };

        return { action, buttons };
    };
};