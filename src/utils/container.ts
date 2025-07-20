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

export namespace Container {
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

  export function Create(props: ContainerProps) {
    const container = new ContainerBuilder();

    if (props.id) container.setId(props.id);
    if (props.color) container.setAccentColor(props.color);
    if (props.spoiler) container.setSpoiler(props.spoiler);

    for (const component of props.components) {
      switch (component.constructor) {
        case FileBuilder: {
          container.addFileComponents(component as FileBuilder);
          break;
        }
        case MediaGalleryBuilder: {
          container.addMediaGalleryComponents(component as MediaGalleryBuilder);
          break;
        }
        case SectionBuilder: {
          container.addSectionComponents(component as SectionBuilder);
          break;
        }
        case TextDisplayBuilder: {
          container.addTextDisplayComponents(component as TextDisplayBuilder);
          break;
        }
        case SeparatorBuilder: {
          container.addSeparatorComponents(component as SeparatorBuilder);
          break;
        }
        case ActionRowBuilder: {
          container.addActionRowComponents(component as ActionRowBuilder<ActionRowComponent>);
        }
      }
    }

    return container;
  }
}
