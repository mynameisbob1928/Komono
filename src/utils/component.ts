import {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ThumbnailBuilder,
  ChannelType,
  SeparatorSpacingSize,
  Emoji,
} from 'discord.js';

export namespace Component {
  export type ComponentType =
    | 'button'
    | 'stringSelectMenu'
    | 'userSelectMenu'
    | 'roleSelectMenu'
    | 'mentionableSelectMenu'
    | 'channelSelectMenu'
    | 'file'
    | 'mediaGallery'
    | 'section'
    | 'textDisplay'
    | 'separator'
    | 'thumbnail';

  export interface BaseItem<T extends ComponentType> {
    customId?: string;
    type: T;
  }

  export interface ButtonProps extends BaseItem<'button'> {
    text?: string;
    emoji?: string;
    url?: string;
    color: ButtonStyle;
    disabled?: boolean;
  }

  export interface StringSelectMenuProps extends BaseItem<'stringSelectMenu'> {
    text?: string;
    max?: number;
    min?: number;
    disabled?: boolean;
    options?: { label: string; value: string }[];
  }

  export interface UserSelectMenuProps extends BaseItem<'userSelectMenu'> {
    text?: string;
    max?: number;
    min?: number;
    disabled?: boolean;
  }

  export interface RoleSelectMenuProps extends BaseItem<'roleSelectMenu'> {
    text?: string;
    max?: number;
    min?: number;
    disabled?: boolean;
  }

  export interface MentionableSelectMenuProps extends BaseItem<'mentionableSelectMenu'> {
    text?: string;
    max?: number;
    min?: number;
    disabled?: boolean;
  }

  export interface ChannelSelectMenuProps extends BaseItem<'channelSelectMenu'> {
    text?: string;
    max?: number;
    min?: number;
    disabled?: boolean;
    channelType?: ChannelType[];
  }

  export interface FileProps extends BaseItem<'file'> {
    file: string;
  }

  export interface MediaGalleryProps extends BaseItem<'mediaGallery'> {
    items: { description: string; media: { url: string } }[];
  }

  export interface SectionProps extends BaseItem<'section'> {
    components: TextDisplayBuilder[];
    accessory: ButtonBuilder | ThumbnailBuilder;
  }

  export interface TextDisplayProps extends BaseItem<'textDisplay'> {
    content: string;
  }

  export interface ThumbnailProps extends BaseItem<'thumbnail'> {
    description: string;
    media: string;
  }

  export interface SeparatorProps extends BaseItem<'separator'> {
    spacing: SeparatorSpacingSize;
    divider?: boolean;
  }

  export type ComponentItem =
    | ButtonProps
    | StringSelectMenuProps
    | UserSelectMenuProps
    | RoleSelectMenuProps
    | MentionableSelectMenuProps
    | ChannelSelectMenuProps
    | FileProps
    | MediaGalleryProps
    | SectionProps
    | TextDisplayProps
    | ThumbnailProps
    | SectionProps
    | SeparatorProps;

  export function Create<T extends ComponentItem>(
    props: T,
  ): T extends Component.TextDisplayProps
    ? TextDisplayBuilder
    : T extends Component.SectionProps
      ? SectionBuilder
      : T extends Component.ButtonProps
        ? ButtonBuilder
        : T extends Component.StringSelectMenuProps
          ? StringSelectMenuBuilder
          : T extends Component.UserSelectMenuProps
            ? UserSelectMenuBuilder
            : T extends Component.RoleSelectMenuProps
              ? RoleSelectMenuBuilder
              : T extends Component.MentionableSelectMenuProps
                ? MentionableSelectMenuBuilder
                : T extends Component.ChannelSelectMenuProps
                  ? ChannelSelectMenuBuilder
                  : T extends Component.FileProps
                    ? FileBuilder
                    : T extends Component.MediaGalleryProps
                      ? MediaGalleryBuilder
                      : T extends Component.ThumbnailProps
                        ? ThumbnailBuilder
                        : T extends Component.SeparatorProps
                          ? SeparatorBuilder
                          : never {
    switch (props.type) {
      case 'button': {
        // @ts-ignore
        return new ButtonBuilder({
          customId: props.color === ButtonStyle.Link ? undefined : props.customId,
          label: props.text,
          emoji: props.emoji as string | undefined,
          url: props.color === ButtonStyle.Link ? props.url : undefined,
          style: props.color,
          disabled: props.disabled,
        }) as any;
      }
      case 'stringSelectMenu': {
        return new StringSelectMenuBuilder({
          customId: props.customId,
          placeholder: props.text,
          maxValues: props.max,
          minValues: props.min,
          options: props.options,
          disabled: props.disabled,
        }) as any;
      }
      case 'userSelectMenu': {
        return new UserSelectMenuBuilder({
          customId: props.customId,
          placeholder: props.text,
          maxValues: props.max,
          minValues: props.min,
          disabled: props.disabled,
        }) as any;
      }
      case 'roleSelectMenu': {
        return new RoleSelectMenuBuilder({
          customId: props.customId,
          placeholder: props.text,
          maxValues: props.max,
          minValues: props.min,
          disabled: props.disabled,
        }) as any;
      }
      case 'mentionableSelectMenu': {
        return new MentionableSelectMenuBuilder({
          customId: props.customId,
          placeholder: props.text,
          maxValues: props.max,
          minValues: props.min,
          disabled: props.disabled,
        }) as any;
      }
      case 'channelSelectMenu': {
        return new ChannelSelectMenuBuilder({
          customId: props.customId,
          placeholder: props.text,
          maxValues: props.max,
          minValues: props.min,
          channelTypes: props.channelType,
          disabled: props.disabled,
        }) as any;
      }
      case 'file': {
        return new FileBuilder({
          file: { url: props.file },
        }) as any;
      }
      case 'mediaGallery': {
        return new MediaGalleryBuilder({
          items: props.items,
        }) as any;
      }
      case 'section': {
        return new SectionBuilder({
          components: props.components.map((comp) => comp.toJSON()),
          accessory: props.accessory.toJSON(),
        }) as any;
      }
      case 'textDisplay': {
        return new TextDisplayBuilder({
          content: props.content,
        }) as any;
      }
      case 'thumbnail': {
        return new ThumbnailBuilder({
          description: props.description,
          media: { url: props.media },
        }) as any;
      }
      case 'separator': {
        return new SeparatorBuilder({
          spacing: props.spacing,
          divider: props.divider,
        }) as any;
      }
    }
  }

  export function CreateActionRow(
    props: (
      | ButtonBuilder
      | StringSelectMenuBuilder
      | UserSelectMenuBuilder
      | RoleSelectMenuBuilder
      | MentionableSelectMenuBuilder
      | ChannelSelectMenuBuilder
    )[],
  ) {
    const action = new ActionRowBuilder();

    props.forEach((component) => {
      action.addComponents(component);
    });

    return action;
  }
}
