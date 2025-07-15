import { ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, RoleSelectMenuBuilder, MentionableSelectMenuBuilder, ChannelSelectMenuBuilder, FileBuilder, MediaGalleryBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, ThumbnailBuilder } from "discord.js";
import type { ComponentBuilder, ComponentOptions } from "./types";

export enum ButtonColors {
    Red = ButtonStyle.Danger,
    Blue = ButtonStyle.Primary,
    Gray = ButtonStyle.Secondary,
    Green = ButtonStyle.Success,
    Link = ButtonStyle.Link,
    Premium = ButtonStyle.Premium
};

export function Component<T extends Record<string, ComponentOptions>>(options: T): {
    [K in keyof T]:
        T[K]['type'] extends 'Button' ? ButtonBuilder :
        T[K]['type'] extends 'StringMenu' ? StringSelectMenuBuilder :
        T[K]['type'] extends 'UserMenu' ? UserSelectMenuBuilder :
        T[K]['type'] extends 'RoleMenu' ? RoleSelectMenuBuilder :
        T[K]['type'] extends 'MentionableMenu' ? MentionableSelectMenuBuilder :
        T[K]['type'] extends 'ChannelMenu' ? ChannelSelectMenuBuilder :
        T[K]['type'] extends 'File' ? FileBuilder :
        T[K]['type'] extends 'MediaGallery' ? MediaGalleryBuilder :
        T[K]['type'] extends 'Section' ? SectionBuilder :
        T[K]['type'] extends 'TextDisplay' ? TextDisplayBuilder :
        T[K]['type'] extends 'Thumbnail' ? ThumbnailBuilder :
        T[K]['type'] extends 'Separator' ? SeparatorBuilder :
        never;
} {
    const components = {} as any;

    for (const key in options) {
        const data = options[key];
        if (!data) continue;

        switch (data.type) {
            case "Button": {
                components[key] = new ButtonBuilder({
                    customId: data.color === "Link" ? undefined : key,
                    label: data.text,
                    emoji: data.emoji as string,
                    url: data.color === "Link" ? data.url : undefined,
                    style: ButtonColors[data.color] as any,
                    disabled: data.disabled,
                });
                break;
            };
            case "StringMenu": {
                components[key] = new StringSelectMenuBuilder({
                    customId: key,
                    placeholder: data.text,
                    maxValues: data.max,
                    minValues: data.min,
                    options: data.options,
                    disabled: data.disabled,
                });
                break;
            };
            case "UserMenu": {
                components[key] = new UserSelectMenuBuilder({
                    customId: key,
                    placeholder: data.text,
                    maxValues: data.max,
                    minValues: data.min,
                    disabled: data.disabled,
                });
                break;
            };
            case "RoleMenu": {
                components[key] = new RoleSelectMenuBuilder({
                    customId: key,
                    placeholder: data.text,
                    maxValues: data.max,
                    minValues: data.min,
                    disabled: data.disabled,
                });
                break;
            };
            case "MentionableMenu": {
                components[key] = new MentionableSelectMenuBuilder({
                    customId: key,
                    placeholder: data.text,
                    maxValues: data.max,
                    minValues: data.min,
                    disabled: data.disabled,
                });
                break;
            };
            case "ChannelMenu": {
                components[key] = new ChannelSelectMenuBuilder({
                    customId: key,
                    placeholder: data.text,
                    maxValues: data.max,
                    minValues: data.min,
                    disabled: data.disabled,
                    channelTypes: data.channelType
                });
                break;
            };
            case "File": {
                components[key] = new FileBuilder({
                    file: { url: data.file }
                });
                break;
            };
            case "MediaGallery": {
                components[key] = new MediaGalleryBuilder({
                    items: data.items
                });
                break;
            };
            case "Section": {
                components[key] = new SectionBuilder({
                    components: data.components.map(comp => comp.toJSON()),
                    accessory: data.accessory.toJSON()
                });
                break;
            };
            case "TextDisplay": {
                components[key] = new TextDisplayBuilder({
                    content: data.content
                });
                break;
            };
            case "Thumbnail": {
                components[key] = new ThumbnailBuilder({
                    description: data.description,
                    media: { url: data.media }
                });
                break;
            };
            case "Separator": {
                components[key] = new SeparatorBuilder({
                    spacing: data.spacing,
                    divider: data.divider
                });
                break;
            };
        };
    };

    return components
};

export function CreateAction<T extends Record<string, ComponentBuilder>>(options: T) {
    const action = new ActionRowBuilder();

    for (const key in options) {
        const comp = options[key];

        if (comp instanceof (ButtonBuilder || StringSelectMenuBuilder || UserSelectMenuBuilder || RoleSelectMenuBuilder || MentionableSelectMenuBuilder || ChannelSelectMenuBuilder)) {
            action.addComponents(comp);
        };
    };

    return action;
};