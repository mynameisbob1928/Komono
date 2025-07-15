import { Prefix } from "bases/prefix";
import { fetch } from "bun";
import { AttachmentBuilder, MessageFlags } from "discord.js";
import { Component } from "utils/component";
import { Container } from "utils/container";
import { Prisma } from "utils/database";
import { Embed } from "utils/embed";
import { Required } from "utils/env";
import { Write } from "utils/log";
import { Icon, Link } from "utils/markdown";
import { Request } from "utils/request";
import { Commas } from "utils/utils";

export default Prefix({
    name: "lastfm",
    aliases: ["fm"],
    description: "Show the music that you're listening to",
    category: "Utility",
    cooldown: 5000,
    args: [{ name: "user", type: "string", description: "Your lastfm username"}],
    async callback(client, message, args) {
        const userId = message.author.id;
        const key = Required("lastfm").ToString();

        if (args.user) {
            const username = args.user;

            await Prisma.lastfm.upsert({
                where: { userId },
                update: { username },
                create: { userId, username }
            });

            await message.reply({
                embeds: [Embed({
                    description: `Last.fm username saved as **${username}**!`
                })]
            });
            return;
        };

        const data = await Prisma.lastfm.findUnique({ where: { userId} });

        if (!data) {
            await message.reply({
                embeds: [Embed({
                    description: `${Icon("Error")} You need to set your Last.fm username first with the command, e.g., k.lastfm <username>.`,
                    color: "Red"
                })]
            });
            return;
        };

        const username = data.username;

        const recentTracks = await Request({
            url: `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
            method: "GET",
            response: "JSON"
        });

        const userInfo = await Request({
            url: `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
            method: "GET",
            response: "JSON"
        });

        if (!userInfo) {
            const components = Component({
                text: {
                    type: "TextDisplay",
                    content: `${Icon("Error")} Username "${username}" is invalid. Please update it using the command k.lastfm <username>.`
                }
            });

            const container = Container({
                components: [components.text]
            });

            await message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
                /*
                embeds: [Embed({
                    description: `${Icon("Error")} Username "${username}" is invalid. Please update it using the command k.lastfm <username>.`,
                    color: "Red"
                })]
                */
            });
            return;
        };

        const track = recentTracks.recenttracks.track[0];
        if (!track) {
            const components = Component({
                text: {
                    type: "TextDisplay",
                    content: `${Icon("Error")} No recent tracks found.`
                }
            });

            const container = Container({
                components: [components.text]
            });

            await message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
                /*
                embeds: [Embed({
                    description: `${Icon("Error")} No recent tracks found.`,
                    color: "Red"
                })]
                */
            });
            return;
        };

        const nowPlaying = track["@attr"]?.nowplaying === "true";
        if (!nowPlaying) {
            const components = Component({
                text: {
                    type: "TextDisplay",
                    content: `${Icon("Error")} No track playing right now.`
                }
            });

            const container = Container({
                components: [components.text]
            });

            await message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
                /*
                embeds: [Embed({
                    description: `${Icon("Error")} No track playing right now.`,
                    color: "Red"
                })]
                */
            });
            return;
        };

        let attachment;

        if (track.image[2]["#text"]) {
            const res = await fetch(track.image[2]["#text"]);
            const arrBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrBuffer);
            attachment = new AttachmentBuilder(buffer, { name: "cover.jpg" });
        };

        const components = Component({
            text1: {
                type: "TextDisplay",
                content: `${message.author} is playing ${Link(track.url, track.name)} by ${track.artist["#text"]}`
            },
            text2: {
                type: "TextDisplay",
                content: `## ${Link(track.url, `${track.name} ・ ${track.artist["#text"]}`)}`
            },
            text3: {
                type: "TextDisplay",
                content: `Album: ${track.album["#text"] ? `**${track.album["#text"]}**` : "**Album not found**"} ・ Scrobbles: **${Commas(userInfo.user.playcount) || "N/A"}**`
            }
        });

        let content;

        if (attachment) {
            const thumb = Component({
                thumbnail: {
                    type: "Thumbnail",
                    description: "Cover image",
                    media: "attachment://cover.jpg"
                }
            });

            const sect = Component({
                section: {
                    type: "Section",
                    components: [components.text3],
                    accessory: thumb.thumbnail
                }
            });

            content = sect.section
        } else {
            content = components.text3
        };

        const container = Container({
            components: [components.text2, content]
        });

        await message.reply({
            components: [components.text1, container],
            files: attachment ? [attachment] : [],
            flags: MessageFlags.IsComponentsV2
            /*
            content: `${message.author} is playing ${Link(track.url, track.name)} by ${track.artist["#text"]}`,
            embeds: [Embed({
                title: `${track.name} ・ ${track.artist["#text"]}`,
                url: track.url,
                description: `Album: ${track.album["#text"] ? `**${track.album["#text"]}**` : "**Album not found**"} ・ Scrobbles: **${Commas(userInfo.user.playcount) || "N/A"}**`,
                thumb: track.image[2]["#text"]
            })]
            */
        });
    }
});