import { EmbedBuilder } from "@discordjs/builders";
import type { DeepPartial, EmbedOptions } from "./types";
import { Colors } from "discord.js";

export function Embed(options: DeepPartial<EmbedOptions>) {
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