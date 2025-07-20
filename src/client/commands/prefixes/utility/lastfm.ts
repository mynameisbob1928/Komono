import Prefix from "bases/prefix";
import { Env } from "libs/env";
import Prisma from "libs/database"
import { AttachmentBuilder, MessageFlags } from "discord.js";
import { Component } from "utils/component";
import { Icon, Link } from "utils/markdown";
import { Container } from "utils/container";
import { Request } from "libs/request";
import { Commas } from "utils/utils";

export default new Prefix({
    name: "lastfm",
    aliases: ["fm"],
    description: "Show the music that you're listening to",
    cooldown: 5,
    args: {
        user: {
            type: "string",
            name: "user",
            description: "Lastfm account username"
        }
    },
    async run(client, message, args) {
        const userId = message.author.id;
        const key = Env.Required("lastfm").ToString();

        if (args.user) {
            const username = args.user;

            await Prisma.lastfm.upsert({
                where: { userId },
                update: { username },
                create: { userId, username}
            });

            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Sucess")} Last.fm username saved as **${username}**!`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        const data = await Prisma.lastfm.findUnique({ where: { userId } });
        if (!data) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Error")} You need to set your Last.fm username first with the command, e.g., k.lastfm <username>`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
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
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Error")} Username "${username}" is invalid. Please update it using the command k.lastfm <username>`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        const track = recentTracks.recentTracks.track[0];
        if (!track) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Error")} No recent tracks found`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        const playing = track["@attr"]?.nowplaying === "true";
        if (!playing) {
            const text = Component.Create({
                type: "textDisplay",
                content: `${Icon("Error")} No track playing right now`
            });

            const container = Container.Create({ components: [text] });

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;
        };

        let attach;
        if (track.image[2]["#text"]) {
            const res = await fetch(track.image[2]["#text"]);
            const arrBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrBuffer);

            attach = new AttachmentBuilder(buffer, { name: "cover.jpg" });
        };

        const text1 = Component.Create({
            type: "textDisplay",
            content: `${message.author} is playing ${Link(track.url, track.name)} by ${track.artist["#text"]}`
        });

        const text2 =  Component.Create({
            type: "textDisplay",
            content: `## ${Link(track.url, `${track.name} ・ ${track.artist["#text"]}`)}`
        });

        const text3 = Component.Create({
            type: "textDisplay",
            content: `Album: **${track.album?.["#text"] ?? "Album not found"}** ・ Scrobbles: **${Commas(userInfo.user.playcount) || "N/A"}**`
        });

        let content;
        if (attach) {
            const thumb = Component.Create({
                type: "thumbnail",
                description: "Cover image",
                media: "attachment://cover.jpg"
            });

            const sect = Component.Create({
                type: "section",
                components: [text3],
                accessory: thumb
            });

            content = sect;
        } else {
            content = text3
        };

        const container = Container.Create({ components: [text2, content] });
        
        await message.reply({ components: [text1, container], flags: MessageFlags.IsComponentsV2 });
    }
});