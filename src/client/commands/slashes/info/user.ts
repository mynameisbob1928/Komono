import Slash from "bases/slash";
import { MessageFlags, SeparatorSpacingSize } from "discord.js";
import { Env } from "libs/env";
import { Translate } from "libs/locales";
import { Component } from "utils/component";
import { Container } from "utils/container";
import { Icon, IconPill, Pill, SmallPill, Timestamp } from "utils/markdown";

export default new Slash({
    name: "user",
    description: "View user profile",
    integrations: ["guild", "user"],
    contexts: ["guild", "DM", "bot"],
    cooldown: 5,
    args: {
        user: {
            type: "user",
            name: "user",
            description: "The user to view info"
        }
    },
    defer: true,
    async run(interaction, args) {
        const l = interaction.locale;

        const user = await interaction.client.users.fetch(args.user?.id || interaction.user.id, { force: true });
        const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

        const dev = Env.Required("dev").ToArray();

        let badges: string[] = []
        if (user.flags) {
            for (const flag of user.flags) {
                switch (flag) {
                    case "Staff": {
                        badges.push("Staff");
                        break;
                    };
                    case "Partner": {
                        badges.push("Partner");
                        break;
                    };
                    case "Hypesquad": {
                        badges.push("Hypesquad");
                        break;
                    };
                    case "BugHunterLevel1": {
                        badges.push("BugHunterLevel1");
                        break;
                    };
                    case "BugHunterLevel2": {
                        badges.push("BugHunterLevel2");
                        break;
                    };
                    case "HypeSquadOnlineHouse1": {
                        badges.push("HypeSquadOnlineHouse1");
                        break;
                    };
                    case "HypeSquadOnlineHouse2": {
                        badges.push("HypeSquadOnlineHouse2");
                        break;
                    };
                    case "HypeSquadOnlineHouse3": {
                        badges.push("HypeSquadOnlineHouse3");
                        break;
                    };
                    case "PremiumEarlySupporter": {
                        badges.push("PremiumEarlySupporter");
                        break;
                    };
                    case "VerifiedBot": {
                        badges.push("VerifiedBot");
                        break;
                    };
                    case "VerifiedDeveloper": {
                        badges.push("VerifiedDeveloper");
                        break;
                    };
                    case "ActiveDeveloper": {
                        badges.push("ActiveDeveloper");
                        break;
                    };
                    case "CertifiedModerator": {
                        badges.push("CertifiedModerator");
                        break;
                    };
                };
            };
        };

        if (user.bannerURL() || user.avatarURL()?.endsWith(".gif")) {
            badges.push("Nitro");
        };

        let tag = "";
        if (dev.includes(user.id)) {
            tag = `\n-# Developer\n`;
        };

        const icons = badges.map(badge => Icon(badge)).join("");

        const avatar = user.avatarURL?.() ?? user.defaultAvatarURL;

        const text1 = Component.Create({
            type: "textDisplay",
            content: `${Icon("Mention")} **${user.username}** ${Pill(`${user.id}`)}\n${icons}${tag}`
        });

        const text2 = Component.Create({
            type: "textDisplay",
            content: `${IconPill("Member", Translate(l, "display"))}\n${SmallPill(member ? member.displayName : user.displayName )}`
        });

        const text3 = Component.Create({
            type: "textDisplay",
            content: `${IconPill("Calendar", Translate(l, "created"))}\n${Timestamp(user.createdTimestamp, "D")}`
        });

        let text4;
        if (member) {
            text4 = Component.Create({
                type: "textDisplay",
                content: `${IconPill("Greenie", Translate(l, "joined"))}\n${Timestamp(member.joinedTimestamp!, "D")}`
            });
        };

        const thumb = Component.Create({
            type: "thumbnail",
            media: avatar,
            description: "User avatar"
        });

        const sect = Component.Create({
            type: "section",
            components: [text1],
            accessory: thumb
        });

        const sep = Component.Create({
            type: "separator",
            spacing: SeparatorSpacingSize.Large,
            divider: true
        });
        
        const container = Container.Create({ components: [sect, sep, text2, text3] })
        if (text4 !== undefined) {
            container.addTextDisplayComponents(text4);
        };

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
});