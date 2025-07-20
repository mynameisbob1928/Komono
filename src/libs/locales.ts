import { join } from 'path';
import fs from 'fs';

const path = join(__dirname, '../locales');
const fallback = "en";
const supportedLanguages = ["en-US", "pt-BR"];

export function Translate(lang: string, key: string, params: (string | number)[] = []): string {
    const shortLang = lang.split('-')[0] || fallback;
    const finalLang = supportedLanguages.includes(shortLang) ? shortLang : fallback;

    const filePath = `${path}/${finalLang}/${finalLang}.json`;

    if (!fs.existsSync(filePath)) {
        throw new Error(`Translation file not found in ${filePath}`);
    };

    const language = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!language[key]) {
        throw new Error(`Missing key "${key}" in ${filePath}`);
    };

    return Interpolate(language[key], params);
};

function Interpolate(template: string, params: (string | number)[]): string {
    return template.replace(/\{\{(\d+)\}\}/g, (_, index) => {
        return params[Number(index)]?.toString() ?? `{{${index}}}`;
    });
};