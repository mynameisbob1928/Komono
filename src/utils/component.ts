import { TextInputBuilder } from '@discordjs/builders';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  FileBuilder,
  MediaGalleryBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  UserSelectMenuBuilder,
  type APISelectMenuOption,
  type PartialEmoji,
  type APIMediaGalleryItem,
  SeparatorSpacingSize,
  ModalBuilder,
  TextInputStyle,
  ComponentType,
} from 'discord.js';

export interface ButtonProps {
  customId?: string;
  text?: string;
  emoji?: PartialEmoji | string;
  url?: string;
  color: ButtonStyle;
  disabled?: boolean;
}

export class Button extends ButtonBuilder {
  constructor(props: ButtonProps) {
    super();
    this.setStyle(props.color);
    if (props.text) this.setLabel(props.text);
    if (props.emoji) this.setEmoji(props.emoji);
    if (props.disabled) this.setDisabled(props.disabled);

    if (props.color === ButtonStyle.Link) {
      if (props.url) {
        this.setURL(props.url);
      }
    } else if (props.customId) {
      this.setCustomId(props.customId);
    }
  }
}

export interface StringSelectMenuProps {
  customId: string;
  placeholder?: string;
  maxValues?: number;
  minValues?: number;
  disabled?: boolean;
  options?: APISelectMenuOption[];
}

export class StringSelectMenu extends StringSelectMenuBuilder {
  constructor(props: StringSelectMenuProps) {
    super({
      custom_id: props.customId,
      placeholder: props.placeholder,
      max_values: props.maxValues,
      min_values: props.minValues,
      options: props.options,
      disabled: props.disabled,
    });
  }
}

export interface UserSelectMenuProps {
  customId: string;
  placeholder?: string;
  maxValues?: number;
  minValues?: number;
  disabled?: boolean;
}

export class UserSelectMenu extends UserSelectMenuBuilder {
  constructor(props: UserSelectMenuProps) {
    super({
      custom_id: props.customId,
      placeholder: props.placeholder,
      max_values: props.maxValues,
      min_values: props.minValues,
      disabled: props.disabled,
    });
  }
}

export interface RoleSelectMenuProps {
  customId: string;
  placeholder?: string;
  maxValues?: number;
  minValues?: number;
  disabled?: boolean;
}

export class RoleSelectMenu extends RoleSelectMenuBuilder {
  constructor(props: RoleSelectMenuProps) {
    super({
      custom_id: props.customId,
      placeholder: props.placeholder,
      max_values: props.maxValues,
      min_values: props.minValues,
      disabled: props.disabled,
    });
  }
}

export interface MentionableSelectMenuProps {
  customId: string;
  placeholder?: string;
  maxValues?: number;
  minValues?: number;
  disabled?: boolean;
}

export class MentionableSelectMenu extends MentionableSelectMenuBuilder {
  constructor(props: MentionableSelectMenuProps) {
    super({
      custom_id: props.customId,
      placeholder: props.placeholder,
      max_values: props.maxValues,
      min_values: props.minValues,
      disabled: props.disabled,
    });
  }
}

export interface ChannelSelectMenuProps {
  customId: string;
  placeholder?: string;
  maxValues?: number;
  minValues?: number;
  disabled?: boolean;
  channelTypes?: ChannelType[];
}

export class ChannelSelectMenu extends ChannelSelectMenuBuilder {
  constructor(props: ChannelSelectMenuProps) {
    super({
      custom_id: props.customId,
      placeholder: props.placeholder,
      max_values: props.maxValues,
      min_values: props.minValues,
      channel_types: props.channelTypes,
      disabled: props.disabled,
    });
  }
}

export interface ModalProps {
  customId: string;
  title: string;
  components?: ActionRowBuilder<any>[];
}

export class Modal extends ModalBuilder {
  constructor(props: ModalProps) {
    super({
      customId: props.customId,
      title: props.title,
      components: props.components,
    });
  }
}

export interface TextInputProps {
  customId: string;
  text: string;
  format: TextInputStyle;
  placeholder?: string;
  max?: number;
  min?: number;
  default?: any;
  required?: boolean;
}

export class TextInput extends TextInputBuilder {
  constructor(props: TextInputProps) {
    super({
      type: ComponentType.TextInput,
      custom_id: props.customId,
      label: props.text,
      style: props.format,
      placeholder: props.placeholder,
      max_length: props.max,
      min_length: props.min,
      value: props.default,
      required: props.required,
    });
  }
}

export interface FileProps {
  url: string;
}

export class File extends FileBuilder {
  constructor(props: FileProps) {
    super({
      file: {
        url: props.url,
      },
    });
  }
}

export interface MediaGalleryProps {
  items: APIMediaGalleryItem[];
}

export class MediaGallery extends MediaGalleryBuilder {
  constructor(props: MediaGalleryProps) {
    super({
      items: props.items,
    });
  }
}

export interface SectionProps {
  components?: TextDisplay[];
  accessory?: Button | Thumbnail;
}

export class Section extends SectionBuilder {
  constructor(props: SectionProps) {
    super({
      components: props.components?.map((c) => c.toJSON()),
      accessory: props.accessory?.toJSON(),
    });
  }
}

export interface TextDisplayProps {
  content: string;
}

export class TextDisplay extends TextDisplayBuilder {
  constructor(props: TextDisplayProps) {
    super({ content: props.content });
  }
}

export interface ThumbnailProps {
  url: string;
  description?: string;
}

export class Thumbnail extends ThumbnailBuilder {
  constructor(props: ThumbnailProps) {
    super({ media: { url: props.url }, description: props.description });
  }
}

export interface SeparatorProps {
  spacing?: SeparatorSpacingSize;
  divider?: boolean;
}

export class Separator extends SeparatorBuilder {
  constructor(props: SeparatorProps) {
    super({
      spacing: props.spacing,
      divider: props.divider,
    });
  }
}

export type ActionRowMessageComponents =
  | Button
  | StringSelectMenu
  | UserSelectMenu
  | RoleSelectMenu
  | MentionableSelectMenu
  | ChannelSelectMenu
  | TextInput;

export class ActionRow extends ActionRowBuilder<ActionRowMessageComponents> {
  constructor(...components: ActionRowMessageComponents[]) {
    super();
    this.addComponents(...components);
  }
}
