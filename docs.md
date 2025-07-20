# Komono Bot

> **Komono** is a modular Discord bot written in TypeScript, supporting prefix and slash commands, events, interactive components, internationalization, logging, and hot reload.

---

## 🚀 Quick Start

1. **Prerequisites**
   - Node.js **or** Bun
   - Database (Prisma)

2. **Clone the project**

   ```sh
   git clone <repo-url>
   cd titanium
   ```

3. **Install dependencies**

   ```sh
   bun install
   # or
   npm install
   ```

4. **Configure environment**
   - Create a `.env` file in the root:
     ```
     token:your_discord_token
     dev:["123456789", "987654321"]
     # lastfm:your_lastfm_api_key
     # DATABASE_URL=your_database_url
     # ... (add other fields as needed)
     ```
   - **Note:** Use `:` (colon) to separate key and value.

5. **Run Prisma migrations**

   ```sh
   npx prisma migrate deploy
   ```

6. **Start the bot**
   ```sh
   bun run src/client/manager.ts
   # or
   npm run start
   ```

---

## 📁 Folder Structure

```
titanium/
  src/
    bases/         # Base classes: Prefix, Slash, Event, Component
    client/        # Entrypoint, commands, events, components
    libs/          # Integrations: database, env, locales, requests
    locales/       # Translations
    types/         # Global types
    utils/         # Utilities
```

---

## ⚙️ Environment Variables

- The custom loader reads the `.env` file in the format `key:value` (do not use `=`!).
- Example:
  ```
  token:your_token
  dev:["123456789", "987654321"]
  ```
- For arrays or objects, use JSON: `["id1", "id2"]` or `{ "foo": "bar" }`
- **Note:** The separator is `:` (colon), not `=`.
- Variables are loaded automatically when the bot starts.
- To access environment variables in your code:

  ```ts
  import Env from 'libs/env';

  // Returns the value as a string or undefined
  const token = Env.Get('token');

  // Returns the value or sets a default if it does not exist
  const devs = Env.Default('dev', '["123456789"]');

  // Throws an error if the variable does not exist
  const mustHave = Env.Required('token');
  ```

---

## 🗄️ Database (Prisma)

- The Prisma client is exported from `src/libs/database.ts`:
  ```ts
  import Prisma from 'libs/database';
  const user = await Prisma.user.findUnique({ where: { id: userId } });
  ```
- To add new models/fields, edit `prisma/schema.prisma` and run:
  ```sh
  npx prisma migrate dev --name <migration-name>
  ```

---

## 🌐 Internationalization

- Translations are in `src/locales/<lang>/<lang>.json` (e.g., `en-US/en-US.json`)
- To add a language:
  1. Copy an existing folder and translate the JSON.
  2. Add the language code to the `supportedLanguages` array in `src/libs/locales.ts`.
- To use:
  ```ts
  import { Translate } from 'libs/locales';
  const msg = Translate('en-US', 'ping:response', [1, 2, 3]);
  ```

---

## 🧩 Prefix Commands

- Location: `src/client/commands/prefixes/`
- Base: `src/bases/prefix.ts`
- Example:
  ```ts
  import Prefix from 'bases/prefix';
  export default new Prefix({
    name: 'ping',
    description: 'Responds with Pong!',
    async run(client, message, args) {
      await message.reply('Pong!');
    },
  });
  ```
- Permissions:
  ```ts
  permissions: { author: ["ManageGuild"], client: [] }
  ```
- Cooldown:
  ```ts
  cooldown: 5; // seconds
  ```
- Args:
  ```ts
  args: {
    user: { type: "user", description: "user to view", required: false }
  }
  ```

---

## 📝 Slash Commands

- Location: `src/client/commands/slashes/`
- Base: `src/bases/slash.ts`
- Example:
  ```ts
  import Slash from 'bases/slash';
  export default new Slash({
    name: 'ping',
    description: {
      global: 'Check if the bot is alive',
      'pt-BR': 'Verifica se o bot está vivo',
    },
    integrations: ['guild', 'user'],
    contexts: ['guild', 'bot', 'DM'],
    cooldown: 3,
    args: {},
    defer: true,
    async run(interaction, args) {
      await interaction.editReply('Pong!');
    },
  });
  ```

---

## 🎉 Events

- Location: `src/client/events/`
- Base: `src/bases/event.ts`
- Example:
  ```ts
  import Event from 'bases/event';
  export default new Event({
    name: 'ready',
    type: 'ready',
    once: true,
    run(client) {
      console.log(`Bot online as ${client.user.tag}`);
    },
  });
  ```

---

## 🖲️ Interactive Components

- Location: `src/client/components/`
- Base: `src/bases/component.ts`
- Example:
  ```ts
  import Component from 'bases/component';
  export default new Component({
    id: 'myButton',
    type: 'button',
    async run(interaction, args) {
      await interaction.reply('You clicked!');
    },
  });
  ```

---

## 🛠️ Utilities

- **ANSI for logs and messages**

  ```ts
  import { Ansi } from 'utils/ansi';
  console.log(Ansi.Format('Hello World', 'red'));
  ```

  - Colors: `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `black` (and aliases: `r`, `g`, etc.)

- **Embed Builder**

  ```ts
  import { Embed } from 'utils/embed';
  const embed = Embed.Create({
    title: 'Hello!',
    description: 'Embed message',
    color: 'Blue',
  });
  ```

- **Markdown Helpers**

  ```ts
  import { Codeblock, Highlight, Icon, Link } from 'utils/markdown';
  const msg = `${Icon('Info')} ${Highlight('Important!')}`;
  ```

- **Cooldown**

  ```ts
  import { Cooldown } from 'utils/cooldown';
  Cooldown.Check(client, userId, commandName, cooldownSeconds);
  ```

- **Logging**
  ```ts
  import { Log } from 'utils/log';
  Log.Write('Message', 'green');
  ```

---

## ♻️ Hot Reload

- The bot automatically reloads commands, events, and components when files are saved.
- The system uses the `Handler` (`src/utils/handler.ts`) and the custom watcher (`src/utils/watcher.ts`).

---

## 🧑‍💻 Contributing

1. Follow the folder and naming conventions.
2. Always test commands before pushing.
3. Open PRs with clear descriptions.
4. Comment complex logic.

---

## ❓ Questions?

Open an issue or join our [support Discord](https://discord.gg/7b234YFhmn)!
