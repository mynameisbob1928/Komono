import fs from 'fs';

export default new (class DotEnv {
  #_values = new Map<string, string>();

  public static ToString(content: any) {
    if (typeof content == 'object') {
      return JSON.stringify(content);
    }

    return `${content}`;
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

    this.#_values.set(key, DotEnv.ToString(value));

    return this.Get(key)!;
  }

  public required(key: string, errMsg = "'$key' is required") {
    if (!this.Has(key)) {
      throw new Error(`"${key}" is required`);
    }

    return this.Get(key)!;
  }

  constructor() {
    let path = `${process.cwd()}/.env`;

    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
      fs.readFileSync(path, 'utf-8').replace(/^(.+?)=(.+)$/gm, (_, name, value) => {
        this.#_values.set(name, value);

        return '';
      });
    }
  }
})();
