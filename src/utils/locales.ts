import { join } from 'path';
import fs from 'fs';

export namespace Locales {
    const path = join(__dirname, '../locales');
    const fallback = "en";
    const supportedLanguages = ["en", "pt", "fr"];

    export function Translate(key: string, lang: string, params: (string | number)[] = []): string {
        const shortLang = lang.split('-')[0];
        const finalLang = supportedLanguages.includes(shortLang) ? shortLang : fallback;

        const filePath = `${path}/${finalLang}/${finalLang}.json`;

        if (!fs.existsSync(filePath)) {
            console.error("Translation file not found:", filePath);
        };

        const language = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!language[key]) {
            console.error(`Missing key "${key}" in ${filePath}`);
        };

        return Interpolate(language[key], params);
    };

    function Interpolate(template: string, params: (string | number)[]): string {
        return template.replace(/\{\{(\d+)\}\}/g, (_, index) => {
            return params[Number(index)]?.toString() ?? `{{${index}}}`;
        });
    };
};