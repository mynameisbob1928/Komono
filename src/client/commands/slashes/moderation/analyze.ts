import Slash from "bases/slash";
import { MessageFlags } from "discord.js";
import { Env } from "libs/env";
import { Translate } from "libs/locales";
import { Request } from "libs/request";
import { Ansi } from "utils/ansi";
import { Component } from "utils/component";
import { Container } from "utils/container";
import { Codeblock, Highlight, IconPill, Link } from "utils/markdown";

export default new Slash({
    name: {
        global: "analyze",
        "pt-BR": "analisar"
    },
    description: {
        global: "Analyze the given text using Google's Perspective API",
        "pt-BR": "Analisa o texto fornecido usando a API Perspective do Google"
    },
    integrations: ["guild", "user"],
    contexts: ["guild", "DM", "bot"],
    cooldown: 5,
    args: {
        message: {
            type: "string",
            name: {
                global: "message",
                "pt-BR": "mensagem"
            },
            description: {
                global: "Message to be analyzed",
                "pt-BR": "Mensagem a ser analisada"
            },
            required: true
        }
    },
    defer: true,
    async run(interaction, args) {
        const l = interaction.locale;

        const msg = args.message;
        const key = Env.Required("perspective").ToString()

        const res = await Request.Request({
            url: `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`,
            method: "POST",
            response: "JSON",
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                comment: { text: msg },
                languages: ["en"],
                requestedAttributes: {
                    LIKELY_TO_REJECT: {},
                    UNSUBSTANTIAL: {},
                    INCOHERENT: {},
                    ATTACK_ON_COMMENTER: {},
                    OBSCENE: {},
                    OFF_TOPIC: {},
                    INFLAMMATORY: {},
                    FLIRTATION: {},
                    ATTACK_ON_AUTHOR: {},
                    SPAM: {},
                    TOXICITY: {},
                    PROFANITY: {},
                    SEXUALLY_EXPLICIT: {},
                    INSULT: {},
                    THREAT: {},
                    IDENTITY_ATTACK: {},
                    SEVERE_TOXICITY: {}
                }
            }
        });

        const result = Object.keys(res.attributeScores).map((key) => {
            const raw = res.attributeScores[key].summaryScore.value;
            const score = (raw * 100).toFixed(1);
            const formatted = key
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase());
            
            let color = "g";
            if (raw >= 0.9) color = "m";
            else if (raw >= 0.76) color = "r";
            else if (raw >= 0.5) color = "y";

            return {
                display: Ansi.Format(`${score}%`, color) + `   ${formatted}`,
                numeric: parseFloat(score)
            }
        }).sort((a, b) => b.numeric - a.numeric).map((item) => item.display);

        const text = Component.Create({
            type: "textDisplay",
            content: `${IconPill("Insights", Translate(l, "analyze:scores"))} ${Link("https://developers.perspectiveapi.com/s/about-the-api-attributes-and-languages", Translate(l, "analyze:meaning"), Translate(l, "analyze:details"))}
            \n${Translate(l, "analyze:flagged", [Highlight(msg), Codeblock("ansi", result.join("\n"))])}`
        });

        const container = Container.Create({ components: [text] });

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
});