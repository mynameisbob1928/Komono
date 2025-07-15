import { Slash } from "bases/slash";
import { Prisma } from "utils/database";
import { Embed } from "utils/embed";
import { Required } from "utils/env";
import { Icon, Link } from "utils/markdown";
import { Request } from "utils/request";
import { Commas } from "utils/utils";

export default Slash({
    body: {
        name: "lastfm",
        type: "Command",
        integrations: ["Guild", "User"],
        contexts: ["Guild", "DM", "Bot"],
        description: "Show the music that you're listening to",
        category: "Utility",
        cooldown: 5000,
        args: { user: { type: "string", description: "Your lastfm username" } }
    },
    defer: true,
    async callback(interaction, args) {
        const userId = interaction.user.id;
        const key = Required("lastfm").ToString();

        if (args.body.user) {
            const username = args.body.user;

            await Prisma.lastfm.upsert({
                where: { userId },
                update: { username },
                create: { userId, username }
            });

            await interaction.editReply({
                embeds: [Embed({
                    description: `Last.fm username saved as **${username}**!`
                })]
            });
            return;
        };

        const data = await Prisma.lastfm.findUnique({ where: { userId} });

        if (!data) {
            await interaction.editReply({
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
            await interaction.editReply({
                embeds: [Embed({
                    description: `${Icon("Error")} Username "${username}" is invalid. Please update it using the command k.lastfm <username>.`,
                    color: "Red"
                })]
            });
            return;
        };

        const track = recentTracks.recenttracks.track[0];
        if (!track) {
            await interaction.editReply({
                embeds: [Embed({
                    description: `${Icon("Error")} No recent tracks found.`,
                    color: "Red"
                })]
            });
            return;
        };

        const nowPlaying = track["@attr"]?.nowplaying === "true";
        if (!nowPlaying) {
            await interaction.editReply({
                embeds: [Embed({
                    description: `${Icon("Error")} No track playing right now.`,
                    color: "Red"
                })]
            });
            return;
        };

        await interaction.editReply({
            content: `${interaction.user} is playing ${Link(track.url, track.name)} by ${track.artist["#text"]}`,
            embeds: [Embed({
                title: `${track.name} — ${track.artist["#text"]}`,
                url: track.url,
                description: `Album: ${track.album["#text"] ? `**${track.album["#text"]}**` : "**Album not found**"} ・ Scrobbles: **${Commas(userInfo.user.playcount) || "N/A"}**`,
                thumb: track.image[2]["#text"]
            })]
        });
    }
});