import { ContainerBuilder, FileBuilder, ActionRowBuilder, MediaGalleryBuilder, SectionBuilder, SeparatorBuilder, TextDisplayBuilder, type ContainerComponentBuilder } from "discord.js";
import type { ActionRowComponentBuilder } from "./types";
  
export type ContainerOptions = {
  id?: number;
  components: ContainerComponentBuilder[];
  color?: number;
  spoiler?: boolean;
};

export function Container(options: ContainerOptions) {
  const container = new ContainerBuilder();

  if (options.id) container.setId(options.id);
  if (options.color) container.setAccentColor(options.color);
  if (options.spoiler) container.setSpoiler(options.spoiler);

  for (const comp of options.components) {
    switch (comp.constructor) {
      case FileBuilder: {
        container.addFileComponents(comp as FileBuilder);
        break;
      };
      case MediaGalleryBuilder: {
        container.addMediaGalleryComponents(comp as MediaGalleryBuilder);
        break;
      };
      case SectionBuilder: {
        container.addSectionComponents(comp as SectionBuilder);
        break;
      };
      case TextDisplayBuilder: {
        container.addTextDisplayComponents(comp as TextDisplayBuilder);
        break;
      };
      case SeparatorBuilder: {
        container.addSeparatorComponents(comp as SeparatorBuilder);
        break;
      };
      case ActionRowBuilder: {
        container.addActionRowComponents(comp as ActionRowBuilder<ActionRowComponentBuilder>);
        break;
      }
      default: {
        throw new Error(`Invalid component type provided ${comp.constructor}`);
      }
    }
  };

  return container;
};