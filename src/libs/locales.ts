import path from 'path';
import fs from 'fs';

const dir = path.join(__dirname, '../locales');
const fallback = 'en-US';
const supportedLanguages = ['en-US', 'pt-BR'];

export function Translate(lang: string, key: string, params: (string | number)[] = []): string {
  const finalLang = supportedLanguages.includes(lang) ? lang : fallback;
  const filePath = path.join(dir, finalLang, `${finalLang}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found in ${filePath}`);
  }

  const language = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!language[key]) {
    throw new Error(`Missing key "${key}" in ${filePath}`);
  }

  return Interpolate(language[key], params);
}

function Interpolate(template: string, params: (string | number)[]): string {
  return template.replace(/\{\{(\d+)\}\}/g, (_, index) => {
    return params[Number(index)]?.toString() ?? `{{${index}}}`;
  });
}
