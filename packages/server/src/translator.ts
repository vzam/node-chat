import { Language } from '@vichat/lib';

export interface Translator {
    /**
     * Translates a text message into the target language.
     * @param text The text to translate.
     * @param sourceLanguageCode The language code of the source language.
     * @param targetLanguageCode The language code of the target language.
     */
    translate(text: string, sourceLanguageCode: string, targetLanguageCode: string): Promise<string>;

    /**
     * Returns available languages using the translator.
     */
    getSupportedLanguages(): Promise<Language[]>;
}
