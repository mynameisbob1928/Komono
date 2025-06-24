import i18next from "i18next";
import backend from 'i18next-fs-backend';
import { join } from 'path';
import fs from 'fs';

export namespace i18n {
    const path = join(__dirname, '../locales');
    const fallback = "en";
    const supportedLanguages = ["en", "pt", "fr"];

    export async function Initialize() {
        if (!fs.existsSync(path)) {
            console.error(`Localization path does not exist: ${path}`);
            return;
        };

        await i18next.use(backend).init({
            fallbackLng: fallback,
            backend: {
                loadPath: (lang: string) => join(path, lang, `${lang}.json`)
            },
            preload: supportedLanguages
        });
    };

    export function Translate(key: string, lang: string, params: (string | number)[] = []): string {
        const t = i18next.getFixedT(lang);
        const localized = t(key);

        if (!localized || localized === key) {
            console.warn(`Missing or untranslated key: "${key}" in lang: "${lang}"`);
            return key;
        };

        return Interpolate(localized, params);
    };

    export function Interpolate(template: string, params: (string | number)[]): string {
        return template.replace(/\{\{(\d+)\}\}/g, (_, index) => {
            return params[Number(index)]?.toString() ?? `{{${index}}}`;
        });
    };
};