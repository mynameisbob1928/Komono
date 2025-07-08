import { Prefix } from "bases/prefix";
import Prisma from "utils/database";
import { Embed } from "utils/embed";
import { Env } from "utils/env";
import { Markdown } from "utils/markdown";
import { Request } from "utils/request";
import { Utils } from "utils/utils";

export default Prefix.Create({
    name: "lastfm",
    aliases: ["fm"],
    description: "Show the music that you're listening to",
    category: "Utility",
    cooldown: 5000,
    args: [{ name: "user", type: "string", description: "Your lastfm username"}],
    async callback(client, message, args) {
        const userId = message.author.id;
        const key = Env.Required("lastfm").ToString();

        if (args.user) {
            const username = args.user;

            await Prisma.lastfm.upsert({
                where: { userId },
                update: { username },
                create: { userId, username }
            });

            await message.reply({
                embeds: [Embed.Success({
                    description: `Last.fm username saved as **${username}**!`
                })]
            });
            return;
        };

        const data = await Prisma.lastfm.findUnique({ where: { userId} });

        if (!data) {
            await message.reply({
                embeds: [Embed.Error({
                    description: `${Markdown.Icon("Error")} You need to set your Last.fm username first with the command, e.g., k.lastfm <username>.`
                })]
            });
            return;
        };

        const username = data.username;

        const recentTracks = await Request.Request({
            url: `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
            method: "GET",
            response: "JSON"
        });

        const userInfo = await Request.Request({
            url: `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${key}&format=json&limit=1`,
            method: "GET",
            response: "JSON"
        });

        if (!userInfo) {
            await message.reply({
                embeds: [Embed.Error({
                    description: `${Markdown.Icon("Error")} Username "${username}" is invalid. Please update it using the command k.lastfm <username>.`
                })]
            });
            return;
        };

        const track = recentTracks.recenttracks.track[0];
        if (!track) {
            await message.reply({
                embeds: [Embed.Error({
                    description: `${Markdown.Icon("Error")} No recent tracks found.`
                })]
            });
            return;
        };

        const nowPlaying = track["@attr"]?.nowplaying === "true";
        if (!nowPlaying) {
            await message.reply({
                embeds: [Embed.Error({
                    description: `${Markdown.Icon("Error")} No track playing right now.`
                })]
            });
            return;
        };

        await message.reply({
            content: `${message.author} is playing ${Markdown.Link(track.url, track.name)} by ${track.artist["#text"]}`,
            embeds: [Embed.Create({
                title: `${track.name} — ${track.artist["#text"]}`,
                url: track.url,
                description: `Album: ${track.album["#text"] ? `**${track.album["#text"]}**` : "**Album not found**"} ・ Scrobbles: **${Utils.Commas(userInfo.user.playcount) || "N/A"}**`,
                thumb: track.image[2]["#text"]
            })]
        });
    }
});