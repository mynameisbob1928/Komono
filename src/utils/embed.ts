import { EmbedBuilder } from '@discordjs/builders';
import { Colors } from 'discord.js';
import type { DeepPartial } from '../types/types';

export interface EmbedProps {
  title: string;
  description: string;
  url: string;
  image: string;
  thumb: string;
  timestamp: Date | number | string;
  color: keyof typeof Colors;
  author: {
    name: string;
    avatar: string;
    url: string;
  };
  footer: {
    image: string;
    content: string;
  };
  fields: {
    name: string;
    content: string;
    inline: boolean;
  }[];
}

export class Embed extends EmbedBuilder {
  constructor(props: DeepPartial<EmbedProps>) {
    super({
      title: props.title,
      description: props.description,
      color: Colors[props.color || 'DarkButNotBlack'],
      author: props.author
        ? {
            name: props.author.name || '',
            icon_url: props.author.avatar || '',
            url: props.author.url || '',
          }
        : undefined,
      footer: props.footer
        ? {
            text: props.footer.content || '',
            icon_url: props.footer.image || '',
          }
        : undefined,
      fields: props.fields
        ? (props.fields as EmbedProps['fields']).map((field) => ({
            name: field.name,
            value: field.content,
            inline: field.inline,
          }))
        : undefined,
      url: props.url,
      image: props.image ? { url: props.image } : undefined,
      thumbnail: props.thumb ? { url: props.thumb } : undefined,
      timestamp: props.timestamp ? new Date(props.timestamp as any).toISOString() : undefined,
    });
  }
}
