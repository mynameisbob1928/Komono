import { EmbedBuilder } from "@discordjs/builders";
import { Colors } from "discord.js";
import type { DeepPartial } from "./types";

export namespace Embed {
  export type EmbedOptions = {
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
  };

  export function Error(options: DeepPartial<EmbedOptions>) {
    return Create({ color: "Red", ...options });
  };

  export function Success(options: DeepPartial<EmbedOptions>) {
    return Create({ color: "Green", ...options });
  };

  export function Create(options: DeepPartial<EmbedOptions>) {
    return new EmbedBuilder({
      title: options.title,
      description: options.description,

      color: Colors[(options.color || "DarkButNotBlack")],

      author: options.author ? { name: options.author.name || "", icon_url: options.author.avatar || "", url: options.author.url || "" } : undefined,
      footer: options.footer ? { text: options.footer.content || "", icon_url: options.footer.image || ""  } : undefined,

      fields: options.fields ? (options.fields as EmbedOptions["fields"]).map((field) => ({ name: field.name, value: field.content, inline: field.inline })) : undefined,

      url: options.url,
      image: options.image ? { url: options.image } : undefined,
      thumbnail: options.thumb ? { url: options.thumb } : undefined,

      timestamp: options.timestamp ? new Date(options.timestamp as any).toISOString() : undefined
    });
  };
};