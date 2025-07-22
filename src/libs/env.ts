import { Collection } from 'discord.js';
import fs from 'fs';

export default new (class Env {
  #_values = new Collection<string, string>();

  public ToString(content: any) {
    if (typeof content == 'object') {
      return JSON.stringify(content);
    }

    return `${content}`;
  }

  public ToNumber(content: any) {
    if (isNaN(content)) {
      throw new Error(`item "${content}" is not a valid number`);
    }

    return Number(content);
  }

  public ToInt(content: any) {
    return Math.floor(this.ToNumber(content));
  }

  public ToBoolean(content: any) {
    return content == 'true' || content == 'True';
  }

  public ToArray(content: any) {
    if (content[0] !== '[' && content[content.length - 1] !== ']') {
      throw new Error(`item "${content}" is not a valid array`);
    }

    return JSON.parse(content);
  }

  public ToObject(content: any) {
    if (content[0] !== '{' && content[content.length - 1] !== '}') {
      throw new Error(`item "${content}" is not a valid object`);
    }

    return JSON.parse(content);
  }

  public Has(key: string) {
    return this.#_values.has(key);
  }

  public Get(key: string) {
    return this.#_values.get(key);
  }

  public Default(key: string, value: any) {
    if (this.Has(key)) {
      return this.Get(key)!;
    }

    this.#_values.set(key, this.ToString(value));

    return this.Get(key)!;
  }

  public Required(key: string) {
    if (!this.Has(key)) {
      throw new Error(`"${key}" is required`);
    }

    return this.Get(key)!;
  }

  constructor() {
    let path = `${process.cwd()}/.env`;

    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
      fs.readFileSync(path, 'utf-8').replace(/^(.+?):(.+)$/gm, (_, name, value) => {
        this.#_values.set(name.trim(), value.trim());

        return '';
      });
    }
  }
})();
