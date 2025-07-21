import {
  ContainerBuilder,
  FileBuilder,
  ActionRowBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  type ContainerComponentBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  ChannelSelectMenuBuilder,
} from 'discord.js';

export interface ContainerProps {
  id?: number;
  components: ContainerComponentBuilder[];
  color?: number;
  spoiler?: boolean;
}

export type ActionRowComponent =
  | ButtonBuilder
  | StringSelectMenuBuilder
  | UserSelectMenuBuilder
  | RoleSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ChannelSelectMenuBuilder;

export class Container extends ContainerBuilder {
  constructor(props: ContainerProps) {
    super();
    if (props.id) this.setId(props.id);
    if (props.color) this.setAccentColor(props.color);
    if (props.spoiler) this.setSpoiler(props.spoiler);

    for (const component of props.components) {
      switch (component.constructor) {
        case FileBuilder: {
          this.addFileComponents(component as FileBuilder);
          break;
        }
        case MediaGalleryBuilder: {
          this.addMediaGalleryComponents(component as MediaGalleryBuilder);
          break;
        }
        case SectionBuilder: {
          this.addSectionComponents(component as SectionBuilder);
          break;
        }
        case TextDisplayBuilder: {
          this.addTextDisplayComponents(component as TextDisplayBuilder);
          break;
        }
        case SeparatorBuilder: {
          this.addSeparatorComponents(component as SeparatorBuilder);
          break;
        }
        case ActionRowBuilder: {
          this.addActionRowComponents(component as ActionRowBuilder<ActionRowComponent>);
        }
      }
    }
  }
}
