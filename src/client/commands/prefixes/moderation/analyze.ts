import Prefix from 'bases/prefix';
import { MessageFlags } from 'discord.js';
import Env from 'libs/env';
import { Request } from 'libs/request';
import { FormatAnsi } from 'utils/ansi';
import { TextDisplay } from 'utils/component';
import { Container } from 'utils/container';
import { Codeblock, Highlight, IconPill, Link } from 'utils/markdown';

export default new Prefix({
  name: 'analyze',
  description: "Analyze the given text using Google's Perspective API",
  cooldown: 5,
  args: {
    message: {
      type: 'string',
      name: 'message',
      description: 'Message to be analyzed',
      required: true,
    },
  },
  async run(client, message, args) {
    const msg = args.message;
    const key = Env.Required('perspective');

    const res = await Request({
      url: `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`,
      method: 'POST',
      response: 'JSON',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        comment: { text: msg },
        languages: ['en'],
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
          SEVERE_TOXICITY: {},
        },
      },
    });

    const result = Object.keys(res.attributeScores)
      .map((key) => {
        const raw = res.attributeScores[key].summaryScore.value;
        const score = (raw * 100).toFixed(1);
        const formatted = key
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase());

        let color = 'g';
        if (raw >= 0.9) color = 'm';
        else if (raw >= 0.76) color = 'r';
        else if (raw >= 0.5) color = 'y';

        return {
          display: FormatAnsi(`${score}%`, color) + `   ${formatted}`,
          numeric: parseFloat(score),
        };
      })
      .sort((a, b) => b.numeric - a.numeric)
      .map((item) => item.display);

    const text = new TextDisplay({
      content: `${IconPill('Insights', 'Scores')} ${Link('https://developers.perspectiveapi.com/s/about-the-api-attributes-and-languages', 'What do these mean?', 'Check out the detection details.')}\n${Highlight(msg)} was flagged as\n${Codeblock('ansi', result.join('\n'))}`,
    });

    const container = new Container({ components: [text] });

    await message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
