import { Language } from 'packages/lib/src';
import { Translator } from '../translator';
import { translate, lang } from 'bing-translate-api';

export class BingTranslator implements Translator {
    async translate(text: string, sourceLanguageCode: string, targetLanguageCode: string): Promise<string> {
        if (sourceLanguageCode === targetLanguageCode) return text;

        const output = await translate(text, sourceLanguageCode, targetLanguageCode);
        return output.translation;
    }
    async getSupportedLanguages(): Promise<Language[]> {
        const langs = { ...lang.LANGS };
        delete langs['auto-detect'];

        return Object.entries(langs).map(
            (e) =>
                ({
                    code: e[0],
                    name: e[1],
                } as Language),
        );
    }
}
